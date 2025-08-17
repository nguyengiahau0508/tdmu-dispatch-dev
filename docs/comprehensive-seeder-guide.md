# Hướng Dẫn Sử Dụng Comprehensive Seeder

## 📋 Tổng quan

Comprehensive Seeder là một công cụ tạo dữ liệu mẫu đầy đủ cho hệ thống TDMU Dispatch, bao gồm:

- **Users** với đầy đủ roles
- **Organizational Structure** (Departments, Units, Positions)
- **Documents** với đầy đủ trạng thái
- **Workflow Templates** với đầy đủ steps
- **Workflow Instances** đang hoạt động
- **Workflow Action Logs** để demo timeline

## 🚀 Cách sử dụng

### 1. Chạy Comprehensive Seeder

```bash
# Di chuyển vào thư mục backend
cd apps/backend

# Chạy comprehensive seeder
npm run seed:comprehensive
```

### 2. Kết quả mong đợi

```
🚀 Bắt đầu chạy Comprehensive Seeder...
🗑️ Xóa tất cả dữ liệu hiện có...
✅ Đã xóa tất cả dữ liệu thành công!
🔧 Bắt đầu tạo dữ liệu mẫu đầy đủ...
📋 1. Tạo Unit Types...
🏢 2. Tạo Units...
🏛️ 3. Tạo Departments...
👔 4. Tạo Positions...
👥 5. Tạo Users...
📁 6. Tạo Files...
📁 7. Tạo Document Categories...
📄 8. Tạo Document Types...
👤 9. Tạo User Positions...
📋 10. Tạo Assignments...
🔄 11. Tạo Workflow Templates...
📄 12. Tạo Documents...
🔄 13. Tạo Workflow Instances...
📝 14. Tạo Workflow Action Logs...
✅ Hoàn thành tạo dữ liệu mẫu đầy đủ!

📊 Thống kê dữ liệu đã tạo:
- Users: 7
- Departments: 3
- Units: 5
- Documents: 5
- Workflow Templates: 3
- Workflow Instances: 5

✅ Comprehensive Seeder hoàn thành thành công!

📋 Thông tin đăng nhập:
Email: admin@tdmu.edu.vn
Password: password123

📋 Các tài khoản khác:
- hieutruong@tdmu.edu.vn / password123
- truongphong@tdmu.edu.vn / password123
- nhanvien1@tdmu.edu.vn / password123
- giangvien1@tdmu.edu.vn / password123
- thuky1@tdmu.edu.vn / password123
```

## 👥 Danh sách Users được tạo

### 1. **Admin System** (SYSTEM_ADMIN)
- **Email**: `admin@tdmu.edu.vn`
- **Password**: `password123`
- **Role**: SYSTEM_ADMIN
- **Chức năng**: Quản lý toàn bộ hệ thống

### 2. **Hiệu Trưởng** (SYSTEM_ADMIN)
- **Email**: `hieutruong@tdmu.edu.vn`
- **Password**: `password123`
- **Role**: SYSTEM_ADMIN
- **Chức năng**: Phê duyệt văn bản cấp cao

### 3. **Phó Hiệu Trưởng** (SYSTEM_ADMIN)
- **Email**: `phohieutruong@tdmu.edu.vn`
- **Password**: `password123`
- **Role**: SYSTEM_ADMIN
- **Chức năng**: Phê duyệt văn bản cấp cao

### 4. **Trưởng Phòng** (DEPARTMENT_STAFF)
- **Email**: `truongphong@tdmu.edu.vn`
- **Password**: `password123`
- **Role**: DEPARTMENT_STAFF
- **Chức năng**: Phê duyệt văn bản cấp phòng

### 5. **Nhân Viên 1** (DEPARTMENT_STAFF)
- **Email**: `nhanvien1@tdmu.edu.vn`
- **Password**: `password123`
- **Role**: DEPARTMENT_STAFF
- **Chức năng**: Tạo và quản lý văn bản

### 6. **Giảng Viên 1** (CLERK)
- **Email**: `giangvien1@tdmu.edu.vn`
- **Password**: `password123`
- **Role**: CLERK
- **Chức năng**: Tạo văn bản

### 7. **Thư Ký 1** (CLERK)
- **Email**: `thuky1@tdmu.edu.vn`
- **Password**: `password123`
- **Role**: CLERK
- **Chức năng**: Tạo văn bản

## 🏢 Cấu trúc tổ chức

### Departments
1. **Phòng Đào tạo** - Quản lý đào tạo
2. **Phòng Tài chính - Kế toán** - Quản lý tài chính
3. **Phòng Tổ chức - Hành chính** - Quản lý nhân sự

### Units
1. **Trường Đại học Thủ Dầu Một** (Trường Đại học)
2. **Khoa Công nghệ Thông tin** (Khoa)
3. **Khoa Kinh tế** (Khoa)
4. **Phòng Đào tạo** (Phòng Ban)
5. **Phòng Tài chính - Kế toán** (Phòng Ban)

### Positions
1. **Hiệu trưởng** (Level 1)
2. **Phó Hiệu trưởng** (Level 2)
3. **Trưởng phòng** (Level 3)
4. **Nhân viên** (Level 4)
5. **Giảng viên** (Level 4)

## 📄 Documents được tạo

### 1. **Quyết định thành lập khoa mới**
- **Type**: INTERNAL
- **Status**: DRAFT
- **Priority**: HIGH
- **Workflow**: Đang ở bước "Tạo văn bản"

### 2. **Báo cáo tài chính quý 1 năm 2024**
- **Type**: INTERNAL
- **Status**: PENDING
- **Priority**: MEDIUM
- **Workflow**: Đang ở bước "Phê duyệt trưởng phòng"

### 3. **Kế hoạch đào tạo năm học 2024-2025**
- **Type**: INTERNAL
- **Status**: PROCESSING
- **Priority**: HIGH
- **Workflow**: Đang ở bước "Phê duyệt lãnh đạo"

### 4. **Biên bản họp Hội đồng trường**
- **Type**: INTERNAL
- **Status**: APPROVED
- **Priority**: MEDIUM
- **Workflow**: Đã hoàn thành

### 5. **Hợp đồng hợp tác với doanh nghiệp ABC**
- **Type**: OUTGOING
- **Status**: DRAFT
- **Priority**: HIGH
- **Workflow**: Đang ở bước "Tạo văn bản"

## 🔄 Workflow Templates

### 1. **Quy trình phê duyệt văn bản thông thường**
- **Steps**: 5 bước
- **Roles**: DEPARTMENT_STAFF → CLERK → DEPARTMENT_STAFF → SYSTEM_ADMIN → CLERK

### 2. **Quy trình phê duyệt văn bản tài chính**
- **Steps**: 5 bước
- **Roles**: DEPARTMENT_STAFF → CLERK → DEPARTMENT_STAFF → SYSTEM_ADMIN → CLERK

### 3. **Quy trình phê duyệt văn bản đào tạo**
- **Steps**: 5 bước
- **Roles**: DEPARTMENT_STAFF → CLERK → DEPARTMENT_STAFF → SYSTEM_ADMIN → CLERK

## 📝 Document Categories

1. **Văn bản hành chính** - Các loại văn bản hành chính thông thường
2. **Văn bản đào tạo** - Các văn bản liên quan đến công tác đào tạo
3. **Văn bản tài chính** - Các văn bản liên quan đến tài chính, kế toán
4. **Văn bản hợp tác** - Các văn bản hợp tác với đối tác bên ngoài
5. **Văn bản nhân sự** - Các văn bản liên quan đến nhân sự, cán bộ

## 📄 Document Types

1. **Quyết định** - Văn bản quyết định
2. **Nghị quyết** - Văn bản nghị quyết
3. **Chỉ thị** - Văn bản chỉ thị
4. **Thông báo** - Văn bản thông báo
5. **Báo cáo** - Văn bản báo cáo

## 🔧 Tính năng đặc biệt

### 1. **Workflow Instances đang hoạt động**
- 5 workflow instances với các trạng thái khác nhau
- Timeline đầy đủ với action logs
- Demo quy trình phê duyệt thực tế

### 2. **Documents với đầy đủ trạng thái**
- DRAFT: Văn bản nháp
- PENDING: Chờ xử lý
- PROCESSING: Đang xử lý
- APPROVED: Đã phê duyệt

### 3. **Files đính kèm**
- 5 files với các loại khác nhau (PDF, DOCX, XLSX)
- Demo upload và quản lý file

### 4. **User Assignments**
- Users được gán vào các positions và units
- Demo phân quyền theo tổ chức

## 🎯 Mục đích sử dụng

### 1. **Development & Testing**
- Test các tính năng workflow
- Demo quy trình phê duyệt
- Test phân quyền users

### 2. **Demo cho khách hàng**
- Hiển thị đầy đủ tính năng hệ thống
- Demo timeline workflow
- Demo quản lý documents

### 3. **Training**
- Hướng dẫn sử dụng hệ thống
- Demo các roles khác nhau
- Training workflow processes

## ⚠️ Lưu ý quan trọng

### 1. **Xóa dữ liệu hiện có**
- Seeder sẽ tự động xóa tất cả dữ liệu hiện có
- Chỉ sử dụng trong môi trường development
- **KHÔNG** sử dụng trong production

### 2. **Database connection**
- Đảm bảo database đã được tạo
- Kiểm tra connection string
- Đảm bảo user có quyền tạo/xóa tables

### 3. **Dependencies**
- Đảm bảo tất cả entities đã được import
- Kiểm tra TypeORM configuration
- Đảm bảo migrations đã chạy

## 🚨 Troubleshooting

### Lỗi thường gặp

1. **Connection refused**
   ```bash
   # Kiểm tra database connection
   # Đảm bảo MySQL server đang chạy
   ```

2. **Entity not found**
   ```bash
   # Kiểm tra import entities
   # Đảm bảo TypeORM configuration đúng
   ```

3. **Foreign key constraint**
   ```bash
   # Seeder sẽ tự động xử lý
   # Nếu vẫn lỗi, kiểm tra thứ tự tạo dữ liệu
   ```

### Reset database
```bash
# Nếu cần reset hoàn toàn
npm run seed:comprehensive
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Database connection
2. Entity imports
3. TypeORM configuration
4. Console logs để debug
