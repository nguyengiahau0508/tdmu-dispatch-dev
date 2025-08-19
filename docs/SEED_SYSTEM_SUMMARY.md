# Tổng quan Hệ thống Seed Dữ liệu Mẫu - TDMU Dispatch

## 🎯 Mục tiêu
Tạo hệ thống seed dữ liệu mẫu tự động cho ứng dụng TDMU Dispatch với khả năng:
- Kiểm tra dữ liệu hiện có
- Hỏi người dùng có muốn xóa và tạo lại không
- Tạo dữ liệu mẫu đầy đủ cho hệ thống

## 📁 Cấu trúc thư mục đã tạo

```
src/database/seeds/
├── index.ts                    # Entry point chính cho seed
├── demo.ts                     # Demo không cần database
├── seeder.service.ts           # Service chính (có GraphQL)
├── seeder-simple.service.ts    # Service đơn giản (không GraphQL)
├── seeder.module.ts            # Module cho seeder chính
├── seeder-simple.module.ts     # Module cho seeder đơn giản
├── seeder-app.module.ts        # App module đơn giản cho seeder
└── README.md                   # Hướng dẫn chi tiết
```

## 🚀 Cách sử dụng

### 1. Chạy Demo (không cần database)
```bash
npm run seed:demo
```

### 2. Chạy thực tế (cần cấu hình database)
```bash
npm run seed
```

## 📊 Dữ liệu mẫu được tạo

### 1. **Unit Types** (5 loại)
- Trường Đại học
- Khoa
- Phòng Ban
- Trung tâm
- Viện

### 2. **Units** (5 đơn vị)
- Trường Đại học Thủ Dầu Một
- Khoa Công nghệ Thông tin
- Khoa Kinh tế
- Phòng Đào tạo
- Phòng Tài chính - Kế toán

### 3. **Departments** (5 phòng ban)
- Phòng Đào tạo
- Phòng Tài chính - Kế toán
- Phòng Tổ chức - Hành chính
- Phòng Công tác Sinh viên
- Phòng Khoa học Công nghệ

### 4. **Positions** (9 chức vụ)
- Hiệu trưởng
- Phó Hiệu trưởng
- Trưởng phòng Đào tạo
- Nhân viên Đào tạo
- Trưởng phòng Tài chính
- Kế toán trưởng
- Nhân viên Kế toán
- Trưởng phòng Tổ chức
- Nhân viên Hành chính

### 5. **Users** (7 người dùng)
| Email | Role | Mật khẩu |
|-------|------|----------|
| admin@tdmu.edu.vn | SYSTEM_ADMIN | 123456 |
| hieutruong@tdmu.edu.vn | UNIVERSITY_LEADER | 123456 |
| phohieutruong@tdmu.edu.vn | UNIVERSITY_LEADER | 123456 |
| daotao@tdmu.edu.vn | DEPARTMENT_STAFF | 123456 |
| taichinh@tdmu.edu.vn | DEPARTMENT_STAFF | 123456 |
| user1@tdmu.edu.vn | BASIC_USER | 123456 |
| user2@tdmu.edu.vn | BASIC_USER | 123456 |

### 6. **Document Categories** (5 danh mục)
- Văn bản hành chính
- Văn bản đào tạo
- Văn bản tài chính
- Văn bản nghiên cứu
- Văn bản sinh viên

### 7. **Document Types** (8 loại)
- Quyết định
- Công văn
- Thông báo
- Báo cáo
- Kế hoạch
- Biên bản
- Hợp đồng
- Đơn từ

### 8. **Workflow Templates** (3 mẫu)
- Quy trình phê duyệt văn bản thông thường
- Quy trình phê duyệt văn bản tài chính
- Quy trình phê duyệt văn bản đào tạo

### 9. **Workflow Steps** (4 bước cho mỗi template)
1. **Tạo văn bản** (START) - Role: BASIC_USER
2. **Phê duyệt trưởng phòng** (APPROVAL) - Role: DEPARTMENT_STAFF
3. **Phê duyệt phó hiệu trưởng** (APPROVAL) - Role: UNIVERSITY_LEADER
4. **Phê duyệt hiệu trưởng** (END) - Role: UNIVERSITY_LEADER

## 🔧 Cấu hình cần thiết

### File .env
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=tdmu_dispatch
```

### Scripts trong package.json
```json
{
  "scripts": {
    "seed": "ts-node -r tsconfig-paths/register src/database/seeds/index.ts",
    "seed:demo": "ts-node -r tsconfig-paths/register src/database/seeds/demo.ts"
  }
}
```

## 🔄 Quy trình hoạt động

1. **Khởi động**: Chạy lệnh `npm run seed`
2. **Kiểm tra**: Hệ thống kiểm tra dữ liệu hiện có
3. **Hỏi người dùng**: Nếu có dữ liệu, hỏi có muốn xóa không
4. **Xử lý**:
   - Nếu chọn `y`: Xóa dữ liệu cũ và tạo mới
   - Nếu chọn `n`: Hủy quá trình
5. **Tạo dữ liệu**: Tạo theo thứ tự để tránh lỗi foreign key
6. **Hoàn thành**: Hiển thị thông báo thành công

## 🛡️ Tính năng bảo mật

- **Mật khẩu được hash**: Sử dụng bcrypt với salt rounds = 10
- **Thứ tự tạo dữ liệu**: Đảm bảo không có lỗi foreign key constraint
- **Thứ tự xóa dữ liệu**: Xóa theo thứ tự ngược lại để tránh lỗi constraint
- **Kiểm tra dữ liệu**: Kiểm tra trước khi tạo để tránh trùng lặp

## 📋 Entity được sử dụng

### Core Entities
- `User` - Người dùng
- `Department` - Phòng ban
- `Position` - Chức vụ
- `UnitType` - Loại đơn vị
- `Unit` - Đơn vị

### Document Entities
- `DocumentCategory` - Danh mục văn bản
- `DocumentType` - Loại văn bản

### Workflow Entities
- `WorkflowTemplate` - Mẫu quy trình
- `WorkflowStep` - Bước trong quy trình

## 🎨 Giao diện người dùng

Hệ thống sử dụng emoji và màu sắc để tạo trải nghiệm thân thiện:
- 🌱 Bắt đầu quá trình
- 🔍 Kiểm tra dữ liệu
- ⚠️ Cảnh báo
- 🗑️ Xóa dữ liệu
- 📋 Tạo Unit Types
- 🏢 Tạo Units
- 🏛️ Tạo Departments
- 👔 Tạo Positions
- 👥 Tạo Users
- 📁 Tạo Document Categories
- 📄 Tạo Document Types
- 🔄 Tạo Workflow Templates
- 📋 Tạo Workflow Steps
- ✅ Hoàn thành

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Lỗi kết nối database**
   - Kiểm tra thông tin trong file .env
   - Đảm bảo MySQL đang chạy
   - Kiểm tra quyền truy cập database

2. **Lỗi GraphQL schema**
   - Sử dụng seeder-simple thay vì seeder chính
   - Kiểm tra xung đột tên type

3. **Lỗi foreign key constraint**
   - Đảm bảo thứ tự tạo dữ liệu đúng
   - Kiểm tra quan hệ giữa các entity

### Giải pháp

1. **Chạy demo trước**: `npm run seed:demo`
2. **Kiểm tra cấu hình**: File .env và database
3. **Sử dụng seeder đơn giản**: Tránh xung đột GraphQL
4. **Kiểm tra logs**: Xem lỗi chi tiết

## 📈 Kết quả mong đợi

Sau khi chạy thành công, bạn sẽ có:
- **7 người dùng** với các role khác nhau
- **5 đơn vị** với cấu trúc phân cấp
- **5 phòng ban** với các chức vụ
- **8 loại văn bản** và **5 danh mục**
- **3 quy trình** với **12 bước** tổng cộng
- **Dữ liệu sẵn sàng** để test hệ thống

## 🎉 Kết luận

Hệ thống seed dữ liệu mẫu đã được tạo hoàn chỉnh với:
- ✅ Giao diện thân thiện
- ✅ Xử lý lỗi tốt
- ✅ Dữ liệu đầy đủ và thực tế
- ✅ Tài liệu hướng dẫn chi tiết
- ✅ Demo không cần database
- ✅ Bảo mật và ổn định

Bạn có thể sử dụng ngay để tạo dữ liệu mẫu cho hệ thống TDMU Dispatch!
