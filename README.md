# Quản Lý Tồn Kho

Ứng dụng quản lý hàng tồn kho dạng desktop, hỗ trợ nhiều người dùng truy cập cùng lúc qua mạng LAN. Hỗ trợ 3 ngôn ngữ: Tiếng Việt, English, 한국어.
<img width="1342" height="849" alt="image" src="https://github.com/user-attachments/assets/ab9f0f90-e9f4-4aad-af4b-8e02ef378e99" />

## Tính năng

- Quản lý sản phẩm & danh mục (thêm/sửa/xóa, tìm kiếm, lọc)
- Nhập/xuất kho, lịch sử giao dịch
- Cảnh báo tồn kho thấp
- Dashboard tổng quan, báo cáo thống kê, xuất Excel
-<img width="1343" height="819" alt="image" src="https://github.com/user-attachments/assets/0eab7c8b-457b-445e-9aa2-ab4f098a6368" />
<img width="1345" height="821" alt="image" src="https://github.com/user-attachments/assets/b389297e-f193-409e-abf3-1ae1e7185139" />
 <img width="1342" height="822" alt="image" src="https://github.com/user-attachments/assets/c960bd1e-c322-4ca2-8a99-ecb868ff46bf" />

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
