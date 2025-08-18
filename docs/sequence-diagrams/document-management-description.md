# Mô tả chi tiết - Sơ đồ tuần tự Quản lý Văn bản (Document Management)

## Tổng quan

Sơ đồ tuần tự quản lý văn bản mô tả toàn bộ quy trình quản lý văn bản trong hệ thống TDMU Dispatch, từ tạo mới, chỉnh sửa, xóa văn bản đến upload/download file và tìm kiếm lọc văn bản.

## Các thành phần tham gia

### Actors
- **User**: Người dùng cuối thực hiện các thao tác quản lý văn bản (DEPARTMENT_STAFF, CLERK, SYSTEM_ADMIN)

### Participants
- **Frontend**: Giao diện người dùng (Angular)
- **DocumentService**: Service xử lý logic quản lý văn bản
- **GoogleDriveService**: Service tích hợp Google Drive
- **FileService**: Service quản lý file
- **WorkflowService**: Service quản lý workflow
- **Database**: Cơ sở dữ liệu MySQL
- **Google Drive**: Dịch vụ lưu trữ file của Google

## Chi tiết các use case

### 1. Tạo văn bản mới

#### Mô tả
Người dùng tạo một văn bản mới trong hệ thống, có thể kèm theo file đính kèm.

#### Luồng xử lý
1. **User → Frontend**: Nhập thông tin văn bản + chọn file
2. **Frontend**: Validate form data (title, documentType, documentCategoryId)
3. **Frontend → DocumentService**: Gọi API `createDocument(createInput, file)`
4. **DocumentService**: Validate required fields

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- DocumentService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Nếu có file upload**:
  - DocumentService → GoogleDriveService: `uploadFile(file)`
  - GoogleDriveService → Google Drive: Upload file
  - Google Drive → GoogleDriveService: Trả về fileId
  - GoogleDriveService → DocumentService: Trả về driveFileId
  - DocumentService → FileService: `createFileEntity(driveFileId, fileInfo)`
  - FileService → Database: INSERT INTO files
  - Database → FileService: Trả về fileEntity
  - FileService → DocumentService: Trả về fileEntity

- **Tạo document entity**:
  - DocumentService tạo document entity với thông tin input và fileEntity
  - DocumentService → Database: INSERT INTO documents
  - Database → DocumentService: Trả về documentEntity

- **Tạo workflow (nếu cần)**:
  - DocumentService → WorkflowService: `createWorkflowInstance(documentId, templateId)`
  - WorkflowService → Database: INSERT INTO workflow_instances
  - Database → WorkflowService: Trả về workflowInstance
  - WorkflowService → DocumentService: Trả về workflowInstance

- **Kết quả**:
  - DocumentService → Frontend: Trả về Document object
  - Frontend refresh document list
  - Frontend → User: Hiển thị thông báo thành công

### 2. Chỉnh sửa văn bản

#### Mô tả
Người dùng chỉnh sửa thông tin của một văn bản đã tồn tại, có thể thay đổi file đính kèm.

#### Luồng xử lý
1. **User → Frontend**: Chọn văn bản cần sửa
2. **Frontend → DocumentService**: Gọi API `getDocument(id)`
3. **DocumentService → Database**: SELECT * FROM documents WHERE id = ?
4. **Database → DocumentService**: Trả về document data
5. **DocumentService → Frontend**: Trả về Document object
6. **Frontend → User**: Hiển thị form chỉnh sửa

7. **User → Frontend**: Cập nhật thông tin + chọn file mới (nếu có)
8. **Frontend → DocumentService**: Gọi API `updateDocument(updateInput, newFile)`
9. **DocumentService**: Validate input

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- DocumentService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Nếu có file mới**:
  - DocumentService → GoogleDriveService: `uploadFile(newFile)`
  - GoogleDriveService → Google Drive: Upload new file
  - Google Drive → GoogleDriveService: Trả về newFileId
  - GoogleDriveService → DocumentService: Trả về newDriveFileId
  - DocumentService → FileService: `updateFileEntity(oldFileId, newDriveFileId)`
  - FileService → Database: UPDATE files SET driveFileId = ?
  - Database → FileService: Success
  - FileService → DocumentService: Success

- **Cập nhật document**:
  - DocumentService → Database: UPDATE documents SET ... WHERE id = ?
  - Database → DocumentService: Success
  - DocumentService → Frontend: Trả về Updated document
  - Frontend refresh document list
  - Frontend → User: Hiển thị thông báo cập nhật thành công

### 3. Xóa văn bản

#### Mô tả
Người dùng xóa một văn bản khỏi hệ thống, bao gồm cả file đính kèm.

#### Luồng xử lý
1. **User → Frontend**: Chọn văn bản cần xóa
2. **Frontend**: Hiển thị dialog xác nhận
3. **User → Frontend**: Xác nhận xóa
4. **Frontend → DocumentService**: Gọi API `removeDocument(id)`
5. **DocumentService**: Check user permissions

#### Xử lý các trường hợp

**Trường hợp 1: Không có quyền**
- DocumentService throw `ForbiddenException`
- Frontend hiển thị lỗi "Không có quyền xóa"

**Trường hợp 2: Có quyền**
- DocumentService → Database: SELECT * FROM documents WHERE id = ?
- Database → DocumentService: Trả về document data

- **Nếu có file đính kèm**:
  - DocumentService → GoogleDriveService: `deleteFile(document.file.driveFileId)`
  - GoogleDriveService → Google Drive: Delete file
  - Google Drive → GoogleDriveService: Success
  - GoogleDriveService → DocumentService: Success

- **Xóa document**:
  - DocumentService → Database: DELETE FROM documents WHERE id = ?
  - Database → DocumentService: Success
  - DocumentService → Frontend: Trả về Success response
  - Frontend refresh document list
  - Frontend → User: Hiển thị thông báo xóa thành công

### 4. Upload file

#### Mô tả
Người dùng upload file lên hệ thống để đính kèm vào văn bản.

#### Luồng xử lý
1. **User → Frontend**: Chọn file để upload
2. **Frontend**: Validate file (size, type)
3. **Frontend → DocumentService**: Gọi API `uploadFile(file)`
4. **DocumentService → GoogleDriveService**: `uploadFile(file)`
5. **GoogleDriveService → Google Drive**: Upload file
6. **Google Drive → GoogleDriveService**: Trả về fileId
7. **GoogleDriveService → DocumentService**: Trả về driveFileId
8. **DocumentService → FileService**: `createFileEntity(driveFileId, fileInfo)`
9. **FileService → Database**: INSERT INTO files
10. **Database → FileService**: Trả về fileEntity
11. **FileService → DocumentService**: Trả về fileEntity
12. **DocumentService → Frontend**: Trả về File object
13. **Frontend → User**: Hiển thị thông báo upload thành công

### 5. Download file

#### Mô tả
Người dùng download file đính kèm từ văn bản.

#### Luồng xử lý
1. **User → Frontend**: Click nút download
2. **Frontend → FileService**: Gọi API `downloadFile(driveFileId)`
3. **FileService → GoogleDriveService**: `downloadFile(driveFileId)`
4. **GoogleDriveService → Google Drive**: Get file
5. **Google Drive → GoogleDriveService**: Trả về file stream
6. **GoogleDriveService → FileService**: Trả về file stream
7. **FileService → Frontend**: Trả về file blob
8. **Frontend**: Tạo download link
9. **Frontend → User**: Tự động download file

### 6. Tìm kiếm văn bản

#### Mô tả
Người dùng tìm kiếm văn bản theo từ khóa.

#### Luồng xử lý
1. **User → Frontend**: Nhập từ khóa tìm kiếm
2. **Frontend → DocumentService**: Gọi API `searchDocuments(keyword, filters)`
3. **DocumentService → Database**: SELECT * FROM documents WHERE title LIKE ? OR content LIKE ?
4. **Database → DocumentService**: Trả về documents list
5. **DocumentService → Frontend**: Trả về Documents array
6. **Frontend → User**: Hiển thị kết quả tìm kiếm

### 7. Lọc văn bản

#### Mô tả
Người dùng lọc văn bản theo các tiêu chí khác nhau.

#### Luồng xử lý
1. **User → Frontend**: Chọn bộ lọc (loại, trạng thái, ngày)
2. **Frontend → DocumentService**: Gọi API `getDocumentsPaginated(input)`
3. **DocumentService → Database**: SELECT * FROM documents WHERE documentType = ? AND status = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?
4. **Database → DocumentService**: Trả về documents list
5. **DocumentService → Database**: SELECT COUNT(*) FROM documents WHERE documentType = ? AND status = ?
6. **Database → DocumentService**: Trả về total count
7. **DocumentService → Frontend**: Trả về PaginatedResponse
8. **Frontend → User**: Hiển thị danh sách đã lọc

## Các đặc điểm kỹ thuật

### File Management
- **Google Drive Integration**: Sử dụng Google Drive API để lưu trữ file
- **File Validation**: Kiểm tra kích thước, định dạng file
- **File Security**: Chỉ user có quyền mới có thể download file
- **File Metadata**: Lưu thông tin file trong database

### Database Design
- **Document Table**: Lưu thông tin văn bản
- **File Table**: Lưu thông tin file đính kèm
- **Relationships**: One-to-one giữa Document và File
- **Indexing**: Index trên các trường tìm kiếm

### Security
- **Permission Check**: Kiểm tra quyền trước khi thực hiện action
- **File Access Control**: Chỉ user có quyền mới có thể truy cập file
- **Input Validation**: Validate tất cả input từ user

### Performance
- **Pagination**: Phân trang cho danh sách văn bản
- **Caching**: Cache kết quả tìm kiếm
- **Lazy Loading**: Load file chỉ khi cần thiết

## Các trường hợp đặc biệt

### File Upload Errors
- **File too large**: Hiển thị lỗi "File quá lớn"
- **Invalid file type**: Hiển thị lỗi "Định dạng file không hợp lệ"
- **Network error**: Hiển thị lỗi "Lỗi kết nối"

### Document Status
- **Draft**: Văn bản nháp, có thể chỉnh sửa
- **Pending**: Văn bản đang chờ phê duyệt
- **Approved**: Văn bản đã được phê duyệt
- **Rejected**: Văn bản bị từ chối

### Workflow Integration
- **Auto-create workflow**: Tự động tạo workflow khi tạo văn bản
- **Status update**: Cập nhật trạng thái văn bản theo workflow
- **Permission check**: Kiểm tra quyền dựa trên workflow step

## Monitoring và Logging

### Audit Trail
- Log tất cả các thao tác CRUD trên văn bản
- Lưu thông tin user thực hiện action
- Track file upload/download activities

### Metrics
- Số lượng văn bản được tạo/sửa/xóa
- Thời gian xử lý upload/download
- Số lượng file được upload

## Tích hợp với hệ thống

### Workflow Integration
- Tự động tạo workflow khi tạo văn bản
- Cập nhật trạng thái văn bản theo workflow
- Kiểm tra quyền dựa trên workflow step

### Notification Integration
- Thông báo khi văn bản được tạo/cập nhật
- Thông báo khi có file mới được upload

### Search Integration
- Full-text search trên nội dung văn bản
- Search theo metadata (title, author, date)
- Filter theo document type và status

