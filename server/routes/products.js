const express = require('express');
const db = require('../db');

const router = express.Router();

const PRODUCT_SELECT = `
  SELECT p.*, c.name AS category_name,
    CASE WHEN p.quantity <= p.low_stock_threshold THEN 1 ELSE 0 END AS low_stock
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

router.get('/', (req, res) => {
  const { search, category_id, low_stock } = req.query;
  let query = PRODUCT_SELECT + ' WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category_id) {
    query += ' AND p.category_id = ?';
    params.push(category_id);
  }
  if (low_stock === '1') {
    query += ' AND p.quantity <= p.low_stock_threshold';
  }
  query += ' ORDER BY p.name';

  res.json(db.prepare(query).all(...params));
});

router.get('/:id', (req, res) => {
  const row = db.prepare(PRODUCT_SELECT + ' WHERE p.id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { sku, name, category_id, unit, price, quantity, low_stock_threshold, note } = req.body;
  if (!sku || !sku.trim() || !name || !name.trim()) {
    return res.status(400).json({ error: 'PRODUCT_REQUIRED_FIELDS' });
  }
  try {
    const info = db.prepare(`
      INSERT INTO products (sku, name, category_id, unit, price, quantity, low_stock_threshold, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sku.trim(),
      name.trim(),
      category_id || null,
      unit || 'cai',
      Number(price) || 0,
      Number(quantity) || 0,
      Number(low_stock_threshold) || 0,
      note || null
    );
    res.status(201).json(db.prepare(PRODUCT_SELECT + ' WHERE p.id = ?').get(info.lastInsertRowid));
  } catch (e) {
    res.status(400).json({ error: 'SKU_EXISTS' });
  }
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });

  const { sku, name, category_id, unit, price, quantity, low_stock_threshold, note } = req.body;
  if (!sku || !sku.trim() || !name || !name.trim()) {
    return res.status(400).json({ error: 'PRODUCT_REQUIRED_FIELDS' });
  }
  try {
    db.prepare(`
      UPDATE products SET sku = ?, name = ?, category_id = ?, unit = ?, price = ?,
        quantity = ?, low_stock_threshold = ?, note = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      sku.trim(),
      name.trim(),
      category_id || null,
      unit || 'cai',
      Number(price) || 0,
      Number(quantity) || 0,
      Number(low_stock_threshold) || 0,
      note || null,
      req.params.id
    );
    res.json(db.prepare(PRODUCT_SELECT + ' WHERE p.id = ?').get(req.params.id));
  } catch (e) {
    res.status(400).json({ error: 'SKU_EXISTS' });
  }
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
  res.status(204).end();
});

module.exports = router;
