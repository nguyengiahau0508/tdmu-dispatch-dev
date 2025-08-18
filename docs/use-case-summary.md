# Tóm tắt Biểu đồ Use Case - TDMU Dispatch

## 🎯 Tổng quan

Hệ thống TDMU Dispatch là một **hệ thống quản lý công văn điện tử** tích hợp chữ ký số và xử lý thời gian thực cho Trường Đại học Thủ Dầu Một.

## 👥 7 Actor chính

| Actor | Vai trò | Chức năng chính |
|-------|---------|-----------------|
| **SYSTEM_ADMIN** | Quản trị viên hệ thống | Toàn quyền quản lý hệ thống |
| **UNIVERSITY_LEADER** | Lãnh đạo cấp cao | Phê duyệt văn bản quan trọng |
| **DEPARTMENT_HEAD** | Trưởng đơn vị | Quản lý đơn vị, phê duyệt văn bản |
| **DEPARTMENT_STAFF** | Chuyên viên/Nhân viên | Soạn thảo văn bản, nghiệp vụ chuyên môn |
| **CLERK** | Văn thư | Xử lý luồng văn bản, nhận/phát văn bản |
| **DEGREE_MANAGER** | Quản lý văn bằng | Quản lý văn bằng, chứng chỉ |
| **BASIC_USER** | Người dùng cơ bản | Xem thông tin cá nhân, thông báo |

## 📋 8 Nhóm chức năng chính

### 1. 🔐 **Quản lý Xác thực và Phân quyền**
- Đăng nhập (mật khẩu/OTP)
- Quản lý người dùng
- Phân quyền

### 2. 🏢 **Quản lý Tổ chức**
- Quản lý đơn vị
- Quản lý chức vụ
- Phân công

### 3. 📄 **Quản lý Văn bản**
- Tạo/chỉnh sửa/xóa văn bản
- Upload/Download file
- Phân loại văn bản

### 4. 🔄 **Quản lý Workflow**
- Tạo workflow template
- Thực hiện workflow
- Quản lý workflow instances

### 5. ✅ **Quản lý Phê duyệt**
- Phê duyệt/từ chối văn bản
- Quy trình phê duyệt
- Báo cáo phê duyệt

### 6. 📁 **Quản lý File và Tài liệu**
- Upload/Download Google Drive
- Quản lý tài liệu
- Chia sẻ file

### 7. 🔔 **Thông báo và Báo cáo**
- Thông báo real-time
- Báo cáo tổng quan
- Thống kê workflow

### 8. 🎓 **Quản lý Văn bằng**
- Quản lý phôi bằng
- Cấp phát văn bằng
- Xác minh văn bằng

## 🔗 Mối quan hệ chính

### Include Relationships
- **Tạo văn bản** → **Upload file**
- **Thực hiện workflow** → **Kiểm tra quyền**
- **Phê duyệt văn bản** → **Gửi thông báo**

### Extend Relationships
- **Quản lý người dùng** → **Quản lý phân quyền**
- **Workflow** → **Quản lý văn bản**
- **Báo cáo** → **Thống kê hệ thống**

## 🎯 Đặc điểm nổi bật

### ✅ **Role-Based Access Control**
- Mỗi người dùng chỉ có quyền phù hợp với vai trò
- Bảo mật và kiểm soát truy cập tốt

### ✅ **Workflow Automation**
- Quy trình xử lý văn bản tự động
- Theo dõi trạng thái real-time

### ✅ **File Management**
- Tích hợp Google Drive
- Upload/Download an toàn

### ✅ **Real-time Notifications**
- Thông báo tức thì
- Cập nhật trạng thái workflow

## 📊 Thống kê

- **7 Actor** (tác nhân)
- **73 Use Case** (chức năng)
- **8 Nhóm chức năng** chính
- **3 Loại mối quan hệ** (Association, Include, Extend)

## 🚀 Lợi ích

1. **Hiệu quả**: Tự động hóa quy trình xử lý văn bản
2. **Bảo mật**: Phân quyền chi tiết theo vai trò
3. **Minh bạch**: Theo dõi toàn bộ quá trình xử lý
4. **Tiện lợi**: Giao diện thân thiện, dễ sử dụng
5. **Tích hợp**: Kết nối với Google Drive và các hệ thống khác

## 📝 Kết luận

Biểu đồ use case TDMU Dispatch thể hiện một hệ thống quản lý công văn điện tử hoàn chỉnh, đáp ứng đầy đủ nhu cầu của một trường đại học hiện đại với các tính năng tiên tiến như workflow automation, role-based access control, và real-time processing.
