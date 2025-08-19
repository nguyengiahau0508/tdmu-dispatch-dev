# 🚀 Quick Start Guide

Hướng dẫn nhanh để bắt đầu với TDMU Dispatch System trong 5 phút!

## ⚡ Cài đặt nhanh

### Yêu cầu
- Node.js 18+ 
- npm 9+
- MariaDB/MySQL 10.5+

### Bước 1: Clone và cài đặt
```bash
git clone https://github.com/your-org/tdmu-dispatch-dev.git
cd tdmu-dispatch-dev
npm install
```

### Bước 2: Cấu hình database
```bash
# Tạo database
mysql -u root -p -e "CREATE DATABASE tdmu_dispatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Tạo user
mysql -u root -p -e "CREATE USER 'tdmu_user'@'localhost' IDENTIFIED BY 'password123';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON tdmu_dispatch.* TO 'tdmu_user'@'localhost';"
```

### Bước 3: Cấu hình môi trường
```bash
# Copy template
cp env.example .env

# Chỉnh sửa .env với thông tin database của bạn
nano .env
```

### Bước 4: Khởi tạo dữ liệu
```bash
cd apps/backend
npm run migration:run
npm run seed:comprehensive
```

### Bước 5: Khởi chạy
```bash
# Quay về thư mục root
cd ../..

# Chạy cả frontend và backend
npm run dev
```

## 🎯 Truy cập hệ thống

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql

## 👤 Đăng nhập

Sử dụng tài khoản mặc định:
- **Email**: `admin@tdmu.edu.vn`
- **Password**: `admin123`

## 📋 Các bước tiếp theo

1. **Khám phá tính năng**: Tạo tài liệu mới, thiết lập workflow
2. **Cấu hình email**: Cập nhật SMTP settings trong `.env`
3. **Tích hợp Google Drive**: Thêm Google API credentials
4. **Tùy chỉnh**: Chỉnh sửa themes, thêm tính năng mới

## 🆘 Gặp vấn đề?

- **Lỗi database**: Kiểm tra kết nối và quyền truy cập
- **Lỗi port**: Đảm bảo port 3000 và 4200 không bị chiếm
- **Lỗi dependencies**: Xóa `node_modules` và chạy lại `npm install`

## 📚 Tài liệu chi tiết

- [README.md](README.md) - Hướng dẫn đầy đủ
- [docs/](docs/) - Tài liệu kỹ thuật
- [CONTRIBUTING.md](CONTRIBUTING.md) - Hướng dẫn đóng góp

---

**Chúc bạn sử dụng TDMU Dispatch hiệu quả! 🎉**
