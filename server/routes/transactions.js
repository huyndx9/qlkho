const express = require('express');
const db = require('../db');

const router = express.Router();

const TX_SELECT = `
  SELECT t.*, p.name AS product_name, p.sku AS product_sku, p.unit AS product_unit
  FROM stock_transactions t
  JOIN products p ON p.id = t.product_id
`;

router.get('/', (req, res) => {
  const { product_id, type, from, to, limit } = req.query;
  let query = TX_SELECT + ' WHERE 1=1';
  const params = [];

  if (product_id) {
    query += ' AND t.product_id = ?';
    params.push(product_id);
  }
  if (type) {
    query += ' AND t.type = ?';
    params.push(type);
  }
  if (from) {
    query += ' AND t.created_at >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND t.created_at <= ?';
    params.push(to);
  }
  query += ' ORDER BY t.created_at DESC, t.id DESC';
  if (limit) {
    query += ' LIMIT ?';
    params.push(Number(limit));
  }

  res.json(db.prepare(query).all(...params));
});

const createTransaction = db.transaction(({ product_id, type, quantity, unit_price, note, partner }) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) throw { status: 404, error: 'PRODUCT_NOT_FOUND' };

  if (type === 'out' && product.quantity < quantity) {
    throw {
      status: 400,
      error: 'INSUFFICIENT_STOCK',
      data: { available: product.quantity, unit: product.unit },
    };
  }

  const delta = type === 'in' ? quantity : -quantity;
  db.prepare(`UPDATE products SET quantity = quantity + ?, updated_at = datetime('now', 'localtime') WHERE id = ?`)
    .run(delta, product_id);

  const info = db.prepare(`
    INSERT INTO stock_transactions (product_id, type, quantity, unit_price, note, partner)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(product_id, type, quantity, unit_price || 0, note || null, partner || null);

  return info.lastInsertRowid;
});

router.post('/', (req, res) => {
  const { product_id, type, quantity, unit_price, note, partner } = req.body;

  if (!product_id) return res.status(400).json({ error: 'PRODUCT_REQUIRED' });
  if (type !== 'in' && type !== 'out') return res.status(400).json({ error: 'INVALID_TX_TYPE' });
  if (!quantity || Number(quantity) <= 0) return res.status(400).json({ error: 'QTY_MUST_BE_POSITIVE' });

  try {
    const id = createTransaction({
      product_id,
      type,
      quantity: Number(quantity),
      unit_price: Number(unit_price) || 0,
      note,
      partner,
    });
    res.status(201).json(db.prepare(TX_SELECT + ' WHERE t.id = ?').get(id));
  } catch (e) {
    if (e && e.status) return res.status(e.status).json({ error: e.error, data: e.data });
    res.status(500).json({ error: 'TRANSACTION_ERROR' });
  }
});

module.exports = router;
