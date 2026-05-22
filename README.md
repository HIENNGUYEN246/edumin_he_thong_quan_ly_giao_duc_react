# React Login Demo

Đây là phiên bản React chuyển đổi từ `index.html` hiện tại, sử dụng API để lấy dữ liệu thay vì localStorage.

## Cách chạy

1. Mở terminal trong thư mục `react-login-demo`
2. Chạy `npm install`
3. Chạy `npm run dev`
4. Mở liên kết được in ra (mặc định `http://localhost:5173`)

## Nội dung

- `src/App.jsx`: phiên bản React của trang đăng nhập
- `src/index.css`: cấu hình Tailwind
- `tailwind.config.js`: cấu hình Tailwind cho Vite
- `index.html`: entry point React

## Thay đổi từ localStorage sang API

- **API URL**: `https://mindx-mockup-server.vercel.app/api/resources/edumin_api`
- **API Key**: `69ff56dffe59a9ca0baa44ea`
- **Dữ liệu**: API trả về object với `users`, `teachersData`, `studentsData`
- **Logic**: Giữ nguyên logic phân loại role như `index.html` gốc

## Ghi chú

- Khi load trang, sẽ fetch dữ liệu từ API
- Hiển thị loading spinner trong khi tải
- Nếu API lỗi, hiển thị toast thông báo
- Logic đăng nhập và phân loại role giống hệt `index.html`

## Tài khoản test

Dựa trên dữ liệu từ API (có thể thay đổi):

- **Admin**: email/pass từ `users` array
- **Giáo viên**: email/pass từ `teachersData` array
- **Sinh viên**: email/pass từ `studentsData` array
