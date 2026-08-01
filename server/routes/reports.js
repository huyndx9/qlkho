const express = require('express');
const ExcelJS = require('exceljs');
const db = require('../db');

const router = express.Router();

router.get('/summary', (req, res) => {
  const totals = db.prepare(`
    SELECT COUNT(*) AS product_count,
           COALESCE(SUM(quantity), 0) AS total_quantity,
           COALESCE(SUM(quantity * price), 0) AS total_value
    FROM products
  `).get();

  const lowStockCount = db.prepare(`
    SELECT COUNT(*) AS count FROM products WHERE quantity <= low_stock_threshold
  `).get().count;

  const todayTx = db.prepare(`
    SELECT type, COALESCE(SUM(quantity), 0) AS qty, COALESCE(SUM(quantity * unit_price), 0) AS value
    FROM stock_transactions
    WHERE date(created_at) = date('now', 'localtime')
    GROUP BY type
  `).all();

  const todayIn = todayTx.find(t => t.type === 'in') || { qty: 0, value: 0 };
  const todayOut = todayTx.find(t => t.type === 'out') || { qty: 0, value: 0 };

  res.json({
    product_count: totals.product_count,
    total_quantity: totals.total_quantity,
    total_value: totals.total_value,
    low_stock_count: lowStockCount,
    today_in_qty: todayIn.qty,
    today_in_value: todayIn.value,
    today_out_qty: todayOut.qty,
    today_out_value: todayOut.value,
  });
});

router.get('/low-stock', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.quantity <= p.low_stock_threshold
    ORDER BY p.quantity ASC
  `).all();
  res.json(rows);
});

router.get('/stock-by-day', (req, res) => {
  const days = Number(req.query.days) || 14;
  const rows = db.prepare(`
    SELECT date(created_at) AS day, type, SUM(quantity) AS qty
    FROM stock_transactions
    WHERE created_at >= datetime('now', ?)
    GROUP BY day, type
    ORDER BY day
  `).all(`-${days} days`);
  res.json(rows);
});

router.get('/top-products', (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const rows = db.prepare(`
    SELECT p.id, p.name, p.sku, COALESCE(SUM(t.quantity), 0) AS total_out
    FROM products p
    JOIN stock_transactions t ON t.product_id = p.id AND t.type = 'out'
    GROUP BY p.id
    ORDER BY total_out DESC
    LIMIT ?
  `).all(limit);
  res.json(rows);
});

router.get('/export/products', async (req, res) => {
  const rows = db.prepare(`
    SELECT p.sku, p.name, c.name AS category_name, p.unit, p.price, p.quantity,
           p.low_stock_threshold, (p.price * p.quantity) AS total_value
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.name
  `).all();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Ton kho');

  sheet.columns = [
    { header: 'Ma SKU', key: 'sku', width: 15 },
    { header: 'Ten san pham', key: 'name', width: 30 },
    { header: 'Danh muc', key: 'category_name', width: 18 },
    { header: 'Don vi', key: 'unit', width: 10 },
    { header: 'Don gia', key: 'price', width: 14 },
    { header: 'So luong ton', key: 'quantity', width: 14 },
    { header: 'Muc canh bao', key: 'low_stock_threshold', width: 14 },
    { header: 'Gia tri ton', key: 'total_value', width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };
  rows.forEach(r => sheet.addRow(r));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="bao-cao-ton-kho-${new Date().toISOString().slice(0, 10)}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

router.get('/export/transactions', async (req, res) => {
  const rows = db.prepare(`
    SELECT t.created_at, p.sku, p.name, t.type, t.quantity, t.unit_price,
           (t.quantity * t.unit_price) AS total_value, t.partner, t.note
    FROM stock_transactions t
    JOIN products p ON p.id = t.product_id
    ORDER BY t.created_at DESC
  `).all();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Giao dich');

  sheet.columns = [
    { header: 'Thoi gian', key: 'created_at', width: 20 },
    { header: 'Ma SKU', key: 'sku', width: 15 },
    { header: 'Ten san pham', key: 'name', width: 28 },
    { header: 'Loai', key: 'type', width: 10 },
    { header: 'So luong', key: 'quantity', width: 12 },
    { header: 'Don gia', key: 'unit_price', width: 14 },
    { header: 'Thanh tien', key: 'total_value', width: 16 },
    { header: 'Doi tac', key: 'partner', width: 18 },
    { header: 'Ghi chu', key: 'note', width: 24 },
  ];
  sheet.getRow(1).font = { bold: true };
  rows.forEach(r => sheet.addRow({ ...r, type: r.type === 'in' ? 'Nhap' : 'Xuat' }));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="lich-su-giao-dich-${new Date().toISOString().slice(0, 10)}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
