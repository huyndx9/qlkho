const path = require('path');
const db = require(path.join(__dirname, '..', 'db'));

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function roundPrice(v) {
  return Math.round(v / 500) * 500;
}

const CATEGORIES = [
  { name: 'Điện tử', unit: 'cái', priceRange: [150000, 8000000], items: [
    'Chuột không dây', 'Bàn phím cơ', 'Tai nghe Bluetooth', 'Loa mini', 'Sạc dự phòng',
    'Cáp sạc Type-C', 'Củ sạc nhanh', 'Webcam HD', 'Ổ cứng di động', 'USB 32GB',
    'Router WiFi', 'Màn hình 24 inch', 'Giá đỡ laptop', 'Đèn LED bàn học', 'Micro thu âm',
  ] },
  { name: 'Văn phòng phẩm', unit: 'cái', priceRange: [3000, 120000], items: [
    'Bút bi xanh', 'Bút chì 2B', 'Vở kẻ ngang', 'Giấy A4', 'Kẹp bướm',
    'Kéo văn phòng', 'Băng keo trong', 'Bìa còng', 'Sổ tay lò xo', 'Ghim bấm',
    'Máy bấm ghim', 'Thước kẻ 30cm', 'Bút highlight', 'Hồ dán', 'File tài liệu',
  ] },
  { name: 'Gia dụng', unit: 'cái', priceRange: [50000, 2500000], items: [
    'Nồi cơm điện', 'Bình đun siêu tốc', 'Chảo chống dính', 'Bộ dao nhà bếp', 'Thớt nhựa',
    'Máy xay sinh tố', 'Bình giữ nhiệt', 'Hộp đựng thực phẩm', 'Móc treo quần áo', 'Rổ nhựa',
    'Chổi quét nhà', 'Xô nhựa', 'Kệ để giày', 'Đèn ngủ', 'Quạt để bàn',
  ] },
  { name: 'Thực phẩm khô', unit: 'gói', priceRange: [8000, 250000], items: [
    'Mì gói', 'Gạo ST25', 'Đường trắng', 'Muối i-ốt', 'Nước mắm',
    'Dầu ăn', 'Bột ngọt', 'Nước tương', 'Cà phê hòa tan', 'Trà túi lọc',
    'Bánh quy', 'Snack khoai tây', 'Sữa bột', 'Hạt điều', 'Miến dong',
  ] },
  { name: 'Thời trang', unit: 'cái', priceRange: [80000, 900000], items: [
    'Áo thun nam', 'Áo sơ mi nữ', 'Quần jean', 'Áo khoác gió', 'Nón lưỡi trai',
    'Tất cotton', 'Thắt lưng da', 'Ví da nam', 'Túi xách nữ', 'Khăn quàng cổ',
    'Giày sneaker', 'Dép quai hậu', 'Áo len', 'Quần short', 'Kính râm',
  ] },
  { name: 'Dụng cụ sửa chữa', unit: 'cái', priceRange: [20000, 1200000], items: [
    'Búa cao su', 'Tua vít bộ', 'Kìm cắt dây', 'Thước dây 5m', 'Máy khoan cầm tay',
    'Cưa tay', 'Mỏ lết', 'Băng keo điện', 'Đèn pin sạc', 'Bộ lục giác',
    'Súng bắn keo', 'Găng tay bảo hộ', 'Kính bảo hộ', 'Dây rút nhựa', 'Ốc vít bộ',
  ] },
  { name: 'Mỹ phẩm & Chăm sóc', unit: 'chai', priceRange: [25000, 650000], items: [
    'Sữa rửa mặt', 'Kem chống nắng', 'Dầu gội đầu', 'Sữa tắm', 'Nước hoa hồng',
    'Kem dưỡng ẩm', 'Son dưỡng môi', 'Nước súc miệng', 'Bàn chải đánh răng', 'Kem đánh răng',
  ] },
];

function buildProductList() {
  const products = [];
  let counter = 1;
  for (const cat of CATEGORIES) {
    for (const itemName of cat.items) {
      const variantCount = rand(1, 3);
      for (let v = 0; v < variantCount; v++) {
        if (products.length >= 135) break;
        const suffix = variantCount > 1 ? ` #${v + 1}` : '';
        const [min, max] = cat.priceRange;
        const price = roundPrice(rand(min, max));
        products.push({
          sku: `SKU-${String(counter).padStart(4, '0')}`,
          name: itemName + suffix,
          category: cat.name,
          unit: cat.unit,
          price,
        });
        counter++;
      }
    }
    if (products.length >= 135) break;
  }
  return products.slice(0, 135);
}

function daysAgoTimestamp(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(rand(8, 18), rand(0, 59), rand(0, 59), 0);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const SUPPLIERS = ['Cong ty TNHH Phu Thai', 'Nha phan phoi An Binh', 'Cong ty CP Minh Long', 'Kho si Dong Tien', 'Nha cung cap Viet Phat'];
const CUSTOMERS = ['Khach le', 'Cua hang Thanh Cong', 'Sieu thi mini Hoa Mai', 'Khach Nguyen Van A', 'Khach Tran Thi B', 'Dai ly Quan 7', 'Cua hang Tien Loi'];

function seed() {
  console.log('Xoa du lieu cu...');
  db.exec('DELETE FROM stock_transactions');
  db.exec('DELETE FROM products');
  db.exec('DELETE FROM categories');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('stock_transactions', 'products', 'categories')");

  console.log('Tao danh muc...');
  const categoryIds = {};
  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  for (const cat of CATEGORIES) {
    const info = insertCategory.run(cat.name);
    categoryIds[cat.name] = info.lastInsertRowid;
  }

  console.log('Tao 135 san pham...');
  const products = buildProductList();
  const insertProduct = db.prepare(`
    INSERT INTO products (sku, name, category_id, unit, price, quantity, low_stock_threshold, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
  `);
  const productIds = [];
  for (const p of products) {
    const lowStockThreshold = rand(5, 20);
    const createdAt = daysAgoTimestamp(rand(60, 90));
    const info = insertProduct.run(
      p.sku, p.name, categoryIds[p.category], p.unit, p.price,
      lowStockThreshold, createdAt, createdAt
    );
    productIds.push({ id: info.lastInsertRowid, unit: p.unit, price: p.price, lowStockThreshold });
  }

  console.log('Tao giao dich nhap/xuat trong 60 ngay gan day...');
  const insertTx = db.prepare(`
    INSERT INTO stock_transactions (product_id, type, quantity, unit_price, note, partner, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const updateQty = db.prepare('UPDATE products SET quantity = quantity + ?, updated_at = ? WHERE id = ?');

  let txCount = 0;
  for (const prod of productIds) {
    const initialIn = rand(30, 200);
    const initTs = daysAgoTimestamp(rand(55, 60));
    insertTx.run(prod.id, 'in', initialIn, prod.price, 'Nhap hang dau ky', pick(SUPPLIERS), initTs);
    updateQty.run(initialIn, initTs, prod.id);
    txCount++;

    const eventCount = rand(3, 12);
    const events = [];
    for (let i = 0; i < eventCount; i++) {
      const daysAgo = rand(0, 55);
      const isIn = Math.random() < 0.35;
      events.push({ daysAgo, isIn });
    }
    events.sort((a, b) => b.daysAgo - a.daysAgo);

    for (const ev of events) {
      const ts = daysAgoTimestamp(ev.daysAgo);
      if (ev.isIn) {
        const qty = rand(10, 80);
        insertTx.run(prod.id, 'in', qty, prod.price, 'Nhap bo sung', pick(SUPPLIERS), ts);
        updateQty.run(qty, ts, prod.id);
      } else {
        const current = db.prepare('SELECT quantity FROM products WHERE id = ?').get(prod.id).quantity;
        const maxOut = Math.min(current, rand(1, 25));
        if (maxOut > 0) {
          const sellPrice = Math.round(prod.price * (1 + rand(10, 40) / 100) / 500) * 500;
          insertTx.run(prod.id, 'out', maxOut, sellPrice, 'Ban hang', pick(CUSTOMERS), ts);
          updateQty.run(-maxOut, ts, prod.id);
        }
      }
      txCount++;
    }
  }

  console.log('Tao mot so san pham sap het hang de kiem tra canh bao...');
  const lowStockTargets = productIds.filter(() => Math.random() < 0.12);
  for (const prod of lowStockTargets) {
    const current = db.prepare('SELECT quantity FROM products WHERE id = ?').get(prod.id).quantity;
    const target = rand(0, Math.max(prod.lowStockThreshold - 1, 0));
    const drain = current - target;
    if (drain > 0) {
      const ts = daysAgoTimestamp(rand(0, 3));
      const sellPrice = Math.round(prod.price * 1.2 / 500) * 500;
      insertTx.run(prod.id, 'out', drain, sellPrice, 'Ban hang', pick(CUSTOMERS), ts);
      updateQty.run(-drain, ts, prod.id);
      txCount++;
    }
  }

  console.log(`Da tao ${products.length} san pham, ${Object.keys(categoryIds).length} danh muc, ${txCount} giao dich.`);
}

seed();
