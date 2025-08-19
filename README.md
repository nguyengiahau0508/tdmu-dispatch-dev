# TDMU Dispatch System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-20+-red.svg)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-11+-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Hệ thống quản lý và xử lý tài liệu điện tử cho Trường Đại học Thủ Dầu Một (TDMU)

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng](#-tính-năng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [Phát triển](#-phát-triển)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)

## 🎯 Tổng quan

TDMU Dispatch là hệ thống quản lý và xử lý tài liệu điện tử được phát triển cho Trường Đại học Thủ Dầu Một. Hệ thống hỗ trợ quy trình workflow từ tạo tài liệu, phê duyệt, đến lưu trữ và truy xuất.

### Các thành phần chính:
- **Frontend**: Angular 20 + PrimeNG + TailwindCSS
- **Backend**: NestJS + GraphQL + TypeORM
- **Database**: MariaDB/MySQL
- **Authentication**: JWT + Passport
- **File Storage**: Google Drive Integration

## ✨ Tính năng

### 🔐 Xác thực và Phân quyền
- Đăng nhập/đăng xuất với JWT
- Xác thực OTP qua email
- Phân quyền theo vai trò (Admin, User, Manager)
- Refresh token tự động

### 📄 Quản lý Tài liệu
- Tạo, chỉnh sửa, xóa tài liệu
- Upload file với hỗ trợ nhiều định dạng
- Phân loại tài liệu theo danh mục
- Tìm kiếm và lọc tài liệu
- Lịch sử phiên bản

### 🔄 Workflow và Phê duyệt
- Thiết kế workflow tùy chỉnh
- Quy trình phê duyệt nhiều cấp
- Theo dõi trạng thái tài liệu
- Thông báo tự động
- Lịch sử phê duyệt

### 👥 Quản lý Tổ chức
- Quản lý phòng ban, đơn vị
- Phân công vai trò và nhiệm vụ
- Cấu trúc tổ chức phân cấp
- Quản lý người dùng

### 📊 Báo cáo và Thống kê
- Thống kê tài liệu theo thời gian
- Báo cáo workflow
- Dashboard quản lý
- Export dữ liệu

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Angular)     │◄──►│   (NestJS)      │◄──►│   (MariaDB)     │
│                 │    │                 │    │                 │
│ - Components    │    │ - GraphQL API   │    │ - Users         │
│ - Services      │    │ - Auth Module   │    │ - Documents     │
│ - Guards        │    │ - Workflow      │    │ - Workflows     │
│ - Interceptors  │    │ - File Upload   │    │ - Approvals     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Google Drive  │    │   Email Service │    │   File Storage  │
│   Integration   │    │   (Nodemailer)  │    │   (Local/Cloud) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💻 Yêu cầu hệ thống

### Yêu cầu tối thiểu
- **Node.js**: 18.x trở lên
- **npm**: 9.x trở lên
- **Docker**: 20.x trở lên (tùy chọn)
- **MariaDB/MySQL**: 10.5 trở lên

### Yêu cầu khuyến nghị
- **Node.js**: 20.x LTS
- **npm**: 10.x
- **Docker Compose**: 2.x
- **MariaDB**: 10.11
- **RAM**: 8GB trở lên
- **Storage**: 10GB trống

## 🚀 Cài đặt

### Phương pháp 1: Cài đặt trực tiếp

#### 1. Clone repository
```bash
git clone https://github.com/your-org/tdmu-dispatch-dev.git
cd tdmu-dispatch-dev
```

#### 2. Cài đặt dependencies
```bash
# Cài đặt dependencies root
npm install

# Cài đặt dependencies backend
cd apps/backend
npm install

# Cài đặt dependencies frontend
cd ../frontend
npm install
```

#### 3. Cấu hình môi trường
```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa các biến môi trường
nano .env
```

#### 4. Khởi tạo database
```bash
# Tạo database
mysql -u root -p -e "CREATE DATABASE tdmu_dispatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Chạy migrations
cd apps/backend
npm run migration:run

# Seed dữ liệu mẫu
npm run seed:comprehensive
```

#### 5. Khởi chạy ứng dụng
```bash
# Khởi chạy cả frontend và backend
npm run dev

# Hoặc chạy riêng lẻ
npm run start:backend  # Backend trên port 3000
npm run start:frontend # Frontend trên port 4200
```

### Phương pháp 2: Sử dụng Docker

#### 1. Clone và cấu hình
```bash
git clone https://github.com/your-org/tdmu-dispatch-dev.git
cd tdmu-dispatch-dev

# Tạo file .env
cp .env.example .env
```

#### 2. Khởi chạy với Docker Compose
```bash
# Build và khởi chạy tất cả services
docker-compose -f docker-compose.dev.yml up --build

# Chạy ở background
docker-compose -f docker-compose.dev.yml up -d --build
```

#### 3. Truy cập ứng dụng
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql

## ⚙️ Cấu hình

### Biến môi trường

Tạo file `.env` với các biến sau:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tdmu_dispatch
DB_USER=tdmu_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@tdmu.edu.vn

# Google Drive Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Application Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
```

### Cấu hình Database

#### MariaDB/MySQL
```sql
-- Tạo database
CREATE DATABASE tdmu_dispatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user
CREATE USER 'tdmu_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON tdmu_dispatch.* TO 'tdmu_user'@'localhost';
FLUSH PRIVILEGES;
```

## 🎮 Sử dụng

### Truy cập hệ thống

1. **Mở trình duyệt**: Truy cập http://localhost:4200
2. **Đăng nhập**: Sử dụng tài khoản mặc định
   - Email: `admin@tdmu.edu.vn`
   - Password: `admin123`

### Tài khoản mặc định

Sau khi chạy seeder, các tài khoản sau sẽ được tạo:

| Vai trò | Email | Password | Mô tả |
|---------|-------|----------|-------|
| Super Admin | `admin@tdmu.edu.vn` | `admin123` | Quản trị viên hệ thống |
| Manager | `manager@tdmu.edu.vn` | `manager123` | Quản lý phòng ban |
| User | `user@tdmu.edu.vn` | `user123` | Người dùng thường |

### Hướng dẫn sử dụng cơ bản

#### 1. Tạo tài liệu mới
1. Đăng nhập vào hệ thống
2. Chọn "Tài liệu" → "Tạo mới"
3. Điền thông tin tài liệu
4. Upload file đính kèm
5. Chọn workflow phê duyệt
6. Gửi để phê duyệt

#### 2. Phê duyệt tài liệu
1. Vào "Tài liệu chờ phê duyệt"
2. Xem chi tiết tài liệu
3. Chọn "Phê duyệt" hoặc "Từ chối"
4. Thêm ghi chú (nếu cần)
5. Xác nhận hành động

#### 3. Quản lý workflow
1. Vào "Cài đặt" → "Workflow"
2. Tạo workflow mới hoặc chỉnh sửa
3. Thiết lập các bước phê duyệt
4. Gán người phê duyệt
5. Lưu cấu hình

## 🛠️ Phát triển

### Cấu trúc dự án

```
tdmu-dispatch-dev/
├── apps/
│   ├── backend/                 # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── modules/        # Feature modules
│   │   │   ├── common/         # Shared utilities
│   │   │   ├── config/         # Configuration
│   │   │   └── database/       # Database entities & migrations
│   │   └── test/               # Backend tests
│   └── frontend/               # Angular Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/       # Core services & guards
│       │   │   ├── features/   # Feature modules
│       │   │   ├── shared/     # Shared components
│       │   │   └── layouts/    # Layout components
│       │   └── environments/   # Environment configs
│       └── test/               # Frontend tests
├── docs/                       # Documentation
├── docker/                     # Docker configurations
└── test/                       # E2E tests
```

### Scripts có sẵn

#### Root level
```bash
# Development
npm run dev                    # Chạy cả frontend và backend
npm run start                  # Chạy production build

# Build
npm run build:frontend         # Build frontend
npm run build:backend          # Build backend

# Linting
npm run lint                   # Lint cả frontend và backend
npm run lint:frontend          # Lint frontend
npm run lint:backend           # Lint backend

# Testing
npm run test:frontend          # Test frontend
npm run test:backend           # Test backend
```

#### Backend scripts
```bash
cd apps/backend

# Development
npm run start:dev              # Development mode với hot reload
npm run start:debug            # Debug mode

# Database
npm run migration:generate     # Tạo migration mới
npm run migration:run          # Chạy migrations
npm run migration:revert       # Revert migration cuối
npm run seed:comprehensive     # Seed dữ liệu đầy đủ

# Testing
npm run test                   # Unit tests
npm run test:e2e               # E2E tests
npm run test:cov               # Test với coverage
```

#### Frontend scripts
```bash
cd apps/frontend

# Development
npm start                      # Development server
npm run build                  # Production build

# Testing
npm test                       # Unit tests
npm run test:watch             # Watch mode tests
```

### Quy ước code

#### TypeScript/JavaScript
- Sử dụng **ESLint** và **Prettier** cho formatting
- Tuân thủ **Angular Style Guide** cho frontend
- Tuân thủ **NestJS conventions** cho backend
- Sử dụng **TypeScript strict mode**

#### Git workflow
```bash
# Tạo feature branch
git checkout -b feature/your-feature-name

# Commit với conventional commits
git commit -m "feat: add user authentication"

# Push và tạo Pull Request
git push origin feature/your-feature-name
```

#### Conventional Commits
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật tài liệu
- `style:` - Formatting, semicolons, etc.
- `refactor:` - Refactoring code
- `test:` - Thêm tests
- `chore:` - Cập nhật build process, etc.

## 🧪 Testing

### Backend Testing

```bash
cd apps/backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test specific file
npm test -- auth.service.spec.ts
```

### Frontend Testing

```bash
cd apps/frontend

# Unit tests
npm test

# Test với coverage
npm test -- --code-coverage

# Test specific component
npm test -- --include="**/user.component.spec.ts"
```

### E2E Testing

```bash
# Chạy E2E tests
npm run test:e2e

# Chạy E2E tests với UI
npm run test:e2e -- --watch
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend

# Hoặc build tất cả
npm run build
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables Production

```env
NODE_ENV=production
PORT=3000
DB_HOST=your_production_db_host
DB_PASSWORD=your_secure_production_password
JWT_SECRET=your_production_jwt_secret
```

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết.

### Quy trình đóng góp

1. **Fork** repository
2. **Clone** về máy local
3. **Tạo branch** mới: `git checkout -b feature/amazing-feature`
4. **Commit** thay đổi: `git commit -m 'feat: add amazing feature'`
5. **Push** lên branch: `git push origin feature/amazing-feature`
6. **Tạo Pull Request**

### Báo cáo lỗi

Vui lòng sử dụng [GitHub Issues](https://github.com/your-org/tdmu-dispatch-dev/issues) để báo cáo lỗi hoặc yêu cầu tính năng mới.

## 📄 Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên hệ

- **Email**: support@tdmu.edu.vn
- **Website**: https://tdmu.edu.vn
- **GitHub**: https://github.com/your-org/tdmu-dispatch-dev

## 🙏 Lời cảm ơn

Cảm ơn tất cả các [contributors](https://github.com/your-org/tdmu-dispatch-dev/graphs/contributors) đã đóng góp cho dự án này.

---

**TDMU Dispatch** - Hệ thống quản lý tài liệu điện tử cho Trường Đại học Thủ Dầu Một
