# Hệ thống Seed Dữ liệu Mẫu

Hệ thống này được thiết kế để tự động tạo dữ liệu mẫu cho ứng dụng TDMU Dispatch.

## Cách sử dụng

### Chạy seed dữ liệu

```bash
npm run seed
```

### Quy trình hoạt động

1. **Kiểm tra dữ liệu hiện có**: Hệ thống sẽ kiểm tra xem đã có dữ liệu trong database chưa
2. **Hỏi người dùng**: Nếu đã có dữ liệu, hệ thống sẽ hỏi bạn có muốn xóa hết và tạo lại từ đầu không
3. **Xử lý theo lựa chọn**:
   - Nếu chọn `y` hoặc `yes`: Xóa dữ liệu cũ và tạo lại từ đầu
   - Nếu chọn khác: Hủy quá trình seed

## Dữ liệu mẫu được tạo

### 1. Unit Types (Loại đơn vị)
- Trường Đại học
- Khoa
- Phòng Ban
- Trung tâm
- Viện

### 2. Units (Đơn vị)
- Trường Đại học Thủ Dầu Một
- Khoa Công nghệ Thông tin
- Khoa Kinh tế
- Phòng Đào tạo
- Phòng Tài chính - Kế toán

### 3. Departments (Phòng ban)
- Phòng Đào tạo
- Phòng Tài chính - Kế toán
- Phòng Tổ chức - Hành chính
- Phòng Công tác Sinh viên
- Phòng Khoa học Công nghệ

### 4. Positions (Chức vụ)
- Hiệu trưởng
- Phó Hiệu trưởng
- Trưởng phòng Đào tạo
- Nhân viên Đào tạo
- Trưởng phòng Tài chính
- Kế toán trưởng
- Nhân viên Kế toán
- Trưởng phòng Tổ chức
- Nhân viên Hành chính

### 5. Users (Người dùng)
- **Admin**: admin@tdmu.edu.vn (mật khẩu: 123456)
- **Hiệu trưởng**: hieutruong@tdmu.edu.vn (mật khẩu: 123456)
- **Phó Hiệu trưởng**: phohieutruong@tdmu.edu.vn (mật khẩu: 123456)
- **Phòng Đào tạo**: daotao@tdmu.edu.vn (mật khẩu: 123456)
- **Phòng Tài chính**: taichinh@tdmu.edu.vn (mật khẩu: 123456)
- **User 1**: user1@tdmu.edu.vn (mật khẩu: 123456)
- **User 2**: user2@tdmu.edu.vn (mật khẩu: 123456)

### 6. Document Categories (Danh mục văn bản)
- Văn bản hành chính
- Văn bản đào tạo
- Văn bản tài chính
- Văn bản nghiên cứu
- Văn bản sinh viên

### 7. Document Types (Loại văn bản)
- Quyết định
- Công văn
- Thông báo
- Báo cáo
- Kế hoạch
- Biên bản
- Hợp đồng
- Đơn từ

### 8. Workflow Templates (Mẫu quy trình)
- Quy trình phê duyệt văn bản thông thường
- Quy trình phê duyệt văn bản tài chính
- Quy trình phê duyệt văn bản đào tạo

### 9. Workflow Steps (Các bước trong quy trình)
Mỗi template có 4 bước:
1. **Tạo văn bản** (START) - Role: BASIC_USER
2. **Phê duyệt trưởng phòng** (APPROVAL) - Role: DEPARTMENT_STAFF
3. **Phê duyệt phó hiệu trưởng** (APPROVAL) - Role: UNIVERSITY_LEADER
4. **Phê duyệt hiệu trưởng** (END) - Role: UNIVERSITY_LEADER

## Cấu trúc thư mục

```
src/database/seeds/
├── index.ts              # Entry point cho seed script
├── seeder.service.ts     # Service chính xử lý seed
├── seeder.module.ts      # Module cho seeder
└── README.md            # Hướng dẫn sử dụng
```

## Lưu ý

- Tất cả mật khẩu mặc định là `123456`
- Dữ liệu được tạo theo thứ tự để đảm bảo không có lỗi foreign key constraint
- Hệ thống sẽ tự động xóa dữ liệu cũ theo thứ tự ngược lại để tránh lỗi constraint
- Các user được tạo với các role khác nhau để test các chức năng khác nhau

## Troubleshooting

Nếu gặp lỗi khi chạy seed:

1. Kiểm tra kết nối database
2. Đảm bảo database đã được tạo và migrate
3. Kiểm tra các entity có được import đúng trong seeder.module.ts
4. Kiểm tra cấu hình TypeORM trong app.module.ts
