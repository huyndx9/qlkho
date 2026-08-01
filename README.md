# Quản Lý Tồn Kho

Ứng dụng quản lý hàng tồn kho dạng desktop, hỗ trợ nhiều người dùng truy cập cùng lúc qua mạng LAN. Hỗ trợ 3 ngôn ngữ: Tiếng Việt, English, 한국어.

## Tính năng

- Quản lý sản phẩm & danh mục (thêm/sửa/xóa, tìm kiếm, lọc)
- Nhập/xuất kho, lịch sử giao dịch
- Cảnh báo tồn kho thấp
- Dashboard tổng quan, báo cáo thống kê, xuất Excel
- Chọn ngôn ngữ: Tiếng Việt / English / 한국어
- Chạy như app desktop (Electron), máy khác trong LAN truy cập qua trình duyệt

## Kiến trúc

- **server/** — Express API + SQLite (`node:sqlite`, không cần build native)
- **client/** — React + Vite
- **electron/** — wrapper desktop, tự khởi động server nội bộ

## Chạy ở chế độ phát triển

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

## Chạy như app desktop

```bash
npm run build
npm run electron
```

## Đóng gói file cài đặt Windows

```bash
npm run dist
```

File cài đặt `.exe` sẽ nằm trong thư mục `dist/`.
