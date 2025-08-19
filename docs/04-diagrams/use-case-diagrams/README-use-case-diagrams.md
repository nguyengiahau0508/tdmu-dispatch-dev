# Hướng dẫn Biểu đồ Use Case - TDMU Dispatch

## Tổng quan

Thư mục này chứa các tài liệu và biểu đồ use case cho hệ thống TDMU Dispatch, một hệ thống quản lý công văn điện tử tích hợp chữ ký số và xử lý thời gian thực.

## Các file trong thư mục

### 1. `use-case-diagram.md`
- **Mô tả**: Tài liệu mô tả chi tiết biểu đồ use case
- **Nội dung**:
  - Tổng quan hệ thống
  - Mô tả các Actor (tác nhân)
  - Chi tiết các Use Case
  - Mối quan hệ giữa các Use Case
  - Ràng buộc và điều kiện
  - Biểu đồ Mermaid

### 2. `use-case-diagram.puml`
- **Mô tả**: File PlantUML để vẽ biểu đồ use case
- **Cách sử dụng**: 
  - Mở file trong PlantUML editor
  - Hoặc sử dụng online PlantUML viewer
  - Hoặc chạy lệnh PlantUML để tạo hình ảnh

## Cách xem biểu đồ

### Phương pháp 1: Sử dụng PlantUML Online
1. Truy cập [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copy nội dung từ file `use-case-diagram.puml`
3. Paste vào editor
4. Biểu đồ sẽ được hiển thị tự động

### Phương pháp 2: Sử dụng VS Code
1. Cài đặt extension "PlantUML" trong VS Code
2. Mở file `use-case-diagram.puml`
3. Nhấn `Alt+Shift+P` và chọn "PlantUML: Preview Current Diagram"

### Phương pháp 3: Sử dụng command line
```bash
# Cài đặt PlantUML
# Ubuntu/Debian
sudo apt-get install plantuml

# macOS
brew install plantuml

# Tạo hình ảnh PNG
plantuml use-case-diagram.puml

# Tạo hình ảnh SVG
plantuml -tsvg use-case-diagram.puml
```

### Phương pháp 4: Sử dụng Mermaid (trong file .md)
- File `use-case-diagram.md` chứa biểu đồ Mermaid
- Có thể xem trực tiếp trên GitHub hoặc các platform hỗ trợ Mermaid

## Cấu trúc biểu đồ

### Actors (Tác nhân)
1. **SYSTEM_ADMIN**: Quản trị viên hệ thống
2. **UNIVERSITY_LEADER**: Lãnh đạo cấp cao (Hiệu trưởng, Phó Hiệu trưởng)
3. **DEPARTMENT_HEAD**: Trưởng đơn vị (Trưởng khoa, Trưởng phòng)
4. **DEPARTMENT_STAFF**: Chuyên viên/Nhân viên
5. **CLERK**: Văn thư
6. **DEGREE_MANAGER**: Quản lý văn bằng
7. **BASIC_USER**: Người dùng cơ bản

### Use Case Groups (Nhóm chức năng)
1. **Quản lý Xác thực và Phân quyền**
2. **Quản lý Tổ chức**
3. **Quản lý Văn bản**
4. **Quản lý Workflow**
5. **Quản lý Phê duyệt**
6. **Quản lý File và Tài liệu**
7. **Thông báo và Báo cáo**
8. **Quản lý Văn bằng**

## Mối quan hệ trong biểu đồ

### Association (Liên kết)
- Đường thẳng từ Actor đến Use Case
- Thể hiện Actor nào có thể thực hiện Use Case nào

### Include (Bao gồm)
- Đường đứt nét với mũi tên và label `<<include>>`
- Thể hiện Use Case này bắt buộc phải bao gồm Use Case khác

### Extend (Mở rộng)
- Đường đứt nét với mũi tên và label `<<extend>>`
- Thể hiện Use Case này có thể mở rộng Use Case khác

## Ví dụ sử dụng

### Kịch bản: Tạo văn bản mới
1. **Actor**: DEPARTMENT_STAFF
2. **Use Case**: "Tạo văn bản mới"
3. **Include**: "Upload file đính kèm"
4. **Extend**: "Tạo workflow instance"

### Kịch bản: Phê duyệt văn bản
1. **Actor**: UNIVERSITY_LEADER
2. **Use Case**: "Phê duyệt văn bản"
3. **Include**: "Nhận thông báo real-time"
4. **Result**: Văn bản được chuyển sang bước tiếp theo

## Cập nhật biểu đồ

### Khi thêm Use Case mới
1. Thêm Use Case vào file `.puml`
2. Thêm mô tả vào file `.md`
3. Cập nhật mối quan hệ với các Actor
4. Kiểm tra lại biểu đồ

### Khi thay đổi quyền
1. Cập nhật mối quan hệ Actor-Use Case
2. Cập nhật mô tả trong file `.md`
3. Kiểm tra tính nhất quán

## Lưu ý quan trọng

1. **Tính nhất quán**: Đảm bảo mô tả trong file `.md` khớp với biểu đồ trong file `.puml`
2. **Quyền truy cập**: Mỗi Actor chỉ có thể thực hiện các Use Case phù hợp với vai trò
3. **Mối quan hệ**: Include và Extend phải phản ánh đúng logic nghiệp vụ
4. **Cập nhật**: Biểu đồ cần được cập nhật khi có thay đổi về chức năng hệ thống

## Tài liệu tham khảo

- [PlantUML Use Case Diagram](https://plantuml.com/use-case-diagram)
- [UML Use Case Diagrams](https://www.uml-diagrams.org/use-case-diagrams.html)
- [Mermaid Use Case Diagrams](https://mermaid.js.org/syntax/useCase.html)

## Liên hệ

Nếu có câu hỏi hoặc cần hỗ trợ về biểu đồ use case, vui lòng liên hệ team phát triển TDMU Dispatch.
