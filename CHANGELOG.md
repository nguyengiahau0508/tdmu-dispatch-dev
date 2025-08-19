# Changelog

Tất cả những thay đổi quan trọng trong dự án này sẽ được ghi lại trong file này.

Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
và dự án này tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Hệ thống quản lý tài liệu điện tử hoàn chỉnh
- Workflow phê duyệt tùy chỉnh
- Tích hợp Google Drive
- Hệ thống thông báo email
- Quản lý người dùng và phân quyền
- Dashboard quản lý

### Changed
- Cải thiện hiệu suất hệ thống
- Tối ưu hóa database queries
- Cập nhật UI/UX

### Fixed
- Sửa lỗi authentication
- Sửa lỗi file upload
- Sửa lỗi workflow processing

## [1.0.0] - 2024-08-19

### Added
- **Authentication System**
  - JWT-based authentication
  - OTP verification via email
  - Role-based access control
  - Refresh token mechanism

- **Document Management**
  - Create, edit, delete documents
  - File upload with multiple formats support
  - Document categorization
  - Search and filter functionality
  - Version history tracking

- **Workflow System**
  - Custom workflow design
  - Multi-level approval process
  - Status tracking
  - Automatic notifications
  - Approval history

- **User Management**
  - User registration and profile management
  - Department and unit management
  - Role assignment
  - Organizational structure

- **File Storage**
  - Google Drive integration
  - Local file storage
  - File type validation
  - File size limits

- **Notification System**
  - Email notifications
  - In-app notifications
  - Notification templates
  - Notification preferences

### Technical Features
- **Frontend**: Angular 20 + PrimeNG + TailwindCSS
- **Backend**: NestJS + GraphQL + TypeORM
- **Database**: MariaDB/MySQL
- **Authentication**: JWT + Passport
- **File Storage**: Google Drive API
- **Email**: Nodemailer
- **Testing**: Jest + Angular Testing
- **Documentation**: Comprehensive docs

### Security
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting
- File upload security

## [0.9.0] - 2024-08-15

### Added
- Initial project setup
- Basic authentication system
- Document management foundation
- Database schema design
- API structure

### Changed
- Project architecture refinement
- Code organization improvements

## [0.8.0] - 2024-08-10

### Added
- Project initialization
- Development environment setup
- Basic folder structure
- Docker configuration

---

## Release Notes

### Version 1.0.0
Đây là phiên bản đầu tiên hoàn chỉnh của hệ thống TDMU Dispatch với đầy đủ các tính năng cốt lõi:

- ✅ Hệ thống xác thực và phân quyền
- ✅ Quản lý tài liệu điện tử
- ✅ Workflow phê duyệt
- ✅ Quản lý người dùng và tổ chức
- ✅ Tích hợp Google Drive
- ✅ Hệ thống thông báo
- ✅ Dashboard quản lý

### Breaking Changes
- Không có breaking changes trong phiên bản này

### Migration Guide
- Không cần migration từ phiên bản trước

### Known Issues
- Một số tính năng nâng cao sẽ được phát triển trong các phiên bản tiếp theo

---

## Contributing

Khi thêm entries vào changelog, vui lòng tuân thủ format sau:

- **Added** cho tính năng mới
- **Changed** cho thay đổi trong tính năng hiện có
- **Deprecated** cho tính năng sắp bị loại bỏ
- **Removed** cho tính năng đã bị loại bỏ
- **Fixed** cho sửa lỗi
- **Security** cho cập nhật bảo mật
