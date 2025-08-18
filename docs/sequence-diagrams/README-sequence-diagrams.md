# Hướng dẫn Sơ đồ Tuần tự - TDMU Dispatch

## Tổng quan

Thư mục này chứa các sơ đồ tuần tự (Sequence Diagrams) cho các use case chính của hệ thống TDMU Dispatch. Các sơ đồ này mô tả chi tiết luồng tương tác giữa các thành phần trong hệ thống.

## Các file sơ đồ tuần tự

### 1. `authentication-sequence.puml`
- **Mô tả**: Sơ đồ tuần tự cho quá trình xác thực
- **Use Cases bao gồm**:
  - Đăng nhập bằng mật khẩu
  - Đăng nhập bằng OTP
  - Gửi mã OTP
  - Đặt lại mật khẩu

### 2. `document-management-sequence.puml`
- **Mô tả**: Sơ đồ tuần tự cho quản lý văn bản
- **Use Cases bao gồm**:
  - Tạo văn bản mới
  - Chỉnh sửa văn bản
  - Xóa văn bản
  - Upload/Download file
  - Tìm kiếm và lọc văn bản

### 3. `workflow-sequence.puml`
- **Mô tả**: Sơ đồ tuần tự cho quản lý workflow
- **Use Cases bao gồm**:
  - Tạo workflow template
  - Tạo workflow instance
  - Thực hiện workflow action
  - Xem danh sách workflow đang chờ
  - Xem chi tiết workflow

### 4. `user-management-sequence.puml`
- **Mô tả**: Sơ đồ tuần tự cho quản lý người dùng
- **Use Cases bao gồm**:
  - Tạo tài khoản người dùng
  - Cập nhật thông tin người dùng
  - Phân quyền cho người dùng
  - Vô hiệu hóa/Kích hoạt tài khoản
  - Phân công chức vụ

### 5. `approval-sequence.puml`
- **Mô tả**: Sơ đồ tuần tự cho quản lý phê duyệt
- **Use Cases bao gồm**:
  - Phê duyệt văn bản
  - Từ chối văn bản
  - Yêu cầu chỉnh sửa
  - Xem lịch sử phê duyệt
  - Tạo báo cáo phê duyệt

### 6. `notification-sequence.puml`
- **Mô tả**: Sơ đồ tuần tự cho thông báo và báo cáo
- **Use Cases bao gồm**:
  - Nhận thông báo real-time
  - Xem danh sách thông báo
  - Cấu hình thông báo
  - Tạo báo cáo tùy chỉnh
  - Xuất báo cáo

## Cách xem sơ đồ tuần tự

### Phương pháp 1: Sử dụng PlantUML Online
1. Truy cập [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copy nội dung từ file `.puml` tương ứng
3. Paste vào editor
4. Sơ đồ sẽ được hiển thị tự động

### Phương pháp 2: Sử dụng VS Code
1. Cài đặt extension "PlantUML" trong VS Code
2. Mở file `.puml` tương ứng
3. Nhấn `Alt+Shift+P` và chọn "PlantUML: Preview Current Diagram"

### Phương pháp 3: Sử dụng command line
```bash
# Tạo hình ảnh PNG cho tất cả sơ đồ
plantuml *.puml

# Tạo hình ảnh SVG
plantuml -tsvg *.puml

# Tạo hình ảnh cho file cụ thể
plantuml authentication-sequence.puml
```

## Cấu trúc sơ đồ tuần tự

### Actors (Tác nhân)
- **User**: Người dùng cuối
- **SYSTEM_ADMIN**: Quản trị viên hệ thống
- **Approver**: Người phê duyệt

### Participants (Thành phần tham gia)
- **Frontend**: Giao diện người dùng
- **Service**: Các service xử lý nghiệp vụ
- **Database**: Cơ sở dữ liệu
- **Cache**: Bộ nhớ cache
- **External Services**: Các dịch vụ bên ngoài (Google Drive, Email)

### Các loại tương tác
1. **Synchronous**: Đường thẳng với mũi tên đầy
2. **Asynchronous**: Đường thẳng với mũi tên rỗng
3. **Return**: Đường đứt nét với mũi tên rỗng
4. **Alternative**: Khối `alt` cho các trường hợp khác nhau
5. **Loop**: Khối `loop` cho các vòng lặp

## Các kịch bản chính

### 1. Kịch bản đăng nhập
```
User -> Frontend: Nhập thông tin đăng nhập
Frontend -> AuthService: Gửi thông tin xác thực
AuthService -> Database: Kiểm tra thông tin user
Database --> AuthService: Trả về thông tin user
AuthService -> TokenService: Tạo access token
TokenService --> AuthService: Trả về token
AuthService --> Frontend: Trả về kết quả đăng nhập
Frontend --> User: Chuyển đến trang chính
```

### 2. Kịch bản tạo văn bản
```
User -> Frontend: Nhập thông tin văn bản
Frontend -> DocumentService: Gửi thông tin văn bản
DocumentService -> GoogleDriveService: Upload file
GoogleDriveService -> Google Drive: Lưu file
Google Drive --> GoogleDriveService: Trả về file ID
DocumentService -> Database: Lưu thông tin văn bản
Database --> DocumentService: Trả về văn bản đã tạo
DocumentService -> WorkflowService: Tạo workflow
WorkflowService --> DocumentService: Trả về workflow
DocumentService --> Frontend: Trả về kết quả
Frontend --> User: Hiển thị thông báo thành công
```

### 3. Kịch bản phê duyệt
```
Approver -> Frontend: Chọn văn bản cần phê duyệt
Frontend -> ApprovalService: Gửi yêu cầu phê duyệt
ApprovalService -> WorkflowService: Thực hiện action
WorkflowService -> Database: Cập nhật trạng thái workflow
Database --> WorkflowService: Xác nhận cập nhật
WorkflowService -> NotificationService: Gửi thông báo
NotificationService --> WorkflowService: Xác nhận gửi
WorkflowService --> ApprovalService: Trả về kết quả
ApprovalService --> Frontend: Trả về kết quả phê duyệt
Frontend --> Approver: Hiển thị thông báo thành công
```

## Lưu ý quan trọng

### 1. Xử lý lỗi
- Tất cả các sơ đồ đều bao gồm xử lý lỗi
- Sử dụng khối `alt` để mô tả các trường hợp lỗi
- Luôn có thông báo lỗi trả về cho user

### 2. Validation
- Mọi input đều được validate trước khi xử lý
- Validation được thực hiện ở cả Frontend và Backend
- Có thông báo lỗi chi tiết cho từng trường hợp

### 3. Security
- Kiểm tra quyền truy cập trước khi thực hiện action
- Sử dụng JWT token cho xác thực
- Có cơ chế revoke token khi cần thiết

### 4. Performance
- Sử dụng cache để tối ưu hiệu năng
- Có cơ chế pagination cho danh sách lớn
- Sử dụng WebSocket cho thông báo real-time

## Cập nhật sơ đồ

### Khi thêm chức năng mới
1. Tạo file `.puml` mới hoặc cập nhật file hiện có
2. Mô tả đầy đủ các bước trong quy trình
3. Bao gồm xử lý lỗi và validation
4. Cập nhật README này

### Khi thay đổi quy trình
1. Cập nhật sơ đồ tuần tự tương ứng
2. Kiểm tra tính nhất quán với code thực tế
3. Cập nhật tài liệu liên quan

## Tài liệu tham khảo

- [PlantUML Sequence Diagram](https://plantuml.com/sequence-diagram)
- [UML Sequence Diagrams](https://www.uml-diagrams.org/sequence-diagrams.html)
- [Sequence Diagram Best Practices](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/uml-sequence-diagram-tutorial/)

## Liên hệ

Nếu có câu hỏi hoặc cần hỗ trợ về sơ đồ tuần tự, vui lòng liên hệ team phát triển TDMU Dispatch.

