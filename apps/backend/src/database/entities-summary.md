# Tổng hợp các Entity trong hệ thống TDMU Dispatch

## 1. User Entity
**File**: `src/modules/users/entities/user.entity.ts`

### Các trường chính:
- `id`: Primary key
- `email`: Email đăng nhập (unique)
- `passwordHash`: Mật khẩu đã hash
- `firstName`: Tên
- `lastName`: Họ
- `isActive`: Trạng thái hoạt động
- `isFirstLogin`: Đánh dấu đăng nhập lần đầu
- `avatar`: Ảnh đại diện
- `roles`: Danh sách vai trò (enum Role)
- `avatarFileId`: ID file ảnh đại diện
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

### Quan hệ:
- `assignments`: OneToMany với Assignment
- `avatarFile`: ManyToOne với File
- `userPositions`: OneToMany với UserPosition

## 2. Department Entity
**File**: `src/modules/organizational/departments/entities/department.entity.ts`

### Các trường chính:
- `id`: Primary key
- `name`: Tên phòng ban
- `description`: Mô tả
- `parentDepartmentId`: ID phòng ban cha

### Quan hệ:
- `parentDepartment`: ManyToOne với Department (self-referencing)
- `children`: OneToMany với Department (self-referencing)
- `positions`: OneToMany với Position

## 3. Position Entity
**File**: `src/modules/organizational/positions/entities/position.entity.ts`

### Các trường chính:
- `id`: Primary key
- `positionName`: Tên chức vụ
- `departmentId`: ID phòng ban
- `maxSlots`: Số lượng tối đa người giữ chức vụ

### Quan hệ:
- `department`: ManyToOne với Department
- `userPositions`: OneToMany với UserPosition

## 4. UnitType Entity
**File**: `src/modules/organizational/unit-types/entities/unit-type.entity.ts`

### Các trường chính:
- `id`: Primary key
- `typeName`: Tên loại đơn vị
- `description`: Mô tả

## 5. Unit Entity
**File**: `src/modules/organizational/units/entities/unit.entity.ts`

### Các trường chính:
- `id`: Primary key
- `unitName`: Tên đơn vị
- `unitTypeId`: ID loại đơn vị
- `parentUnitId`: ID đơn vị cha
- `establishmentDate`: Ngày thành lập
- `email`: Email đơn vị
- `phone`: Số điện thoại đơn vị

### Quan hệ:
- `unitType`: ManyToOne với UnitType
- `childUnits`: OneToMany với Unit (self-referencing)
- `parentUnit`: ManyToOne với Unit (self-referencing)

## 6. DocumentCategory Entity
**File**: `src/modules/dispatch/document-category/entities/document-category.entity.ts`

### Các trường chính:
- `id`: Primary key
- `name`: Tên danh mục
- `description`: Mô tả

## 7. DocumentType Entity
**File**: `src/modules/dispatch/document-types/entities/document-type.entity.ts`

### Các trường chính:
- `id`: Primary key
- `name`: Tên loại văn bản
- `description`: Mô tả

## 8. Document Entity
**File**: `src/modules/dispatch/documents/entities/document.entity.ts`

### Các trường chính:
- `id`: Primary key
- `title`: Tiêu đề văn bản
- `content`: Nội dung
- `documentNumber`: Số văn bản
- `status`: Trạng thái văn bản
- `priority`: Độ ưu tiên
- `createdByUserId`: ID người tạo
- `assignedToUserId`: ID người được giao
- `categoryId`: ID danh mục
- `typeId`: ID loại văn bản
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

### Quan hệ:
- `createdByUser`: ManyToOne với User
- `assignedToUser`: ManyToOne với User
- `category`: ManyToOne với DocumentCategory
- `type`: ManyToOne với DocumentType

## 9. WorkflowTemplate Entity
**File**: `src/modules/workflow/workflow-templates/entities/workflow-template.entity.ts`

### Các trường chính:
- `id`: Primary key
- `name`: Tên template
- `description`: Mô tả
- `isActive`: Trạng thái hoạt động
- `createdByUserId`: ID người tạo
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

### Quan hệ:
- `createdByUser`: ManyToOne với User
- `steps`: OneToMany với WorkflowStep
- `instances`: OneToMany với WorkflowInstance

## 10. WorkflowStep Entity
**File**: `src/modules/workflow/workflow-steps/entities/workflow-step.entity.ts`

### Các trường chính:
- `id`: Primary key
- `name`: Tên bước
- `description`: Mô tả
- `type`: Loại bước (enum StepType: START, APPROVAL, TRANSFER, END)
- `assignedRole`: Vai trò được giao
- `orderNumber`: Thứ tự bước
- `nextStepId`: ID bước tiếp theo
- `isActive`: Trạng thái hoạt động
- `templateId`: ID template
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

### Quan hệ:
- `template`: ManyToOne với WorkflowTemplate
- `actionLogs`: OneToMany với WorkflowActionLog

## 11. WorkflowInstance Entity
**File**: `src/modules/workflow/workflow-instances/entities/workflow-instance.entity.ts`

### Các trường chính:
- `id`: Primary key
- `templateId`: ID template
- `documentId`: ID văn bản
- `status`: Trạng thái instance
- `currentStepId`: ID bước hiện tại
- `createdByUserId`: ID người tạo
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

### Quan hệ:
- `template`: ManyToOne với WorkflowTemplate
- `document`: ManyToOne với Document
- `currentStep`: ManyToOne với WorkflowStep
- `createdByUser`: ManyToOne với User

## 12. WorkflowActionLog Entity
**File**: `src/modules/workflow/workflow-action-logs/entities/workflow-action-log.entity.ts`

### Các trường chính:
- `id`: Primary key
- `instanceId`: ID instance
- `stepId`: ID bước
- `actionType`: Loại hành động
- `actionByUserId`: ID người thực hiện
- `comment`: Ghi chú
- `createdAt`: Thời gian tạo

### Quan hệ:
- `instance`: ManyToOne với WorkflowInstance
- `step`: ManyToOne với WorkflowStep
- `actionByUser`: ManyToOne với User

## 13. Assignment Entity
**File**: `src/modules/organizational/assignments/entities/assignment.entity.ts`

### Các trường chính:
- `id`: Primary key
- `userId`: ID người dùng
- `positionId`: ID chức vụ
- `startDate`: Ngày bắt đầu
- `endDate`: Ngày kết thúc
- `isActive`: Trạng thái hoạt động

### Quan hệ:
- `user`: ManyToOne với User
- `position`: ManyToOne với Position

## 14. UserPosition Entity
**File**: `src/modules/organizational/user-positions/entities/user-position.entity.ts`

### Các trường chính:
- `id`: Primary key
- `userId`: ID người dùng
- `positionId`: ID chức vụ
- `startDate`: Ngày bắt đầu
- `endDate`: Ngày kết thúc
- `isActive`: Trạng thái hoạt động

### Quan hệ:
- `user`: ManyToOne với User
- `position`: ManyToOne với Position

## 15. File Entity
**File**: `src/modules/files/entities/file.entity.ts`

### Các trường chính:
- `id`: Primary key
- `filename`: Tên file
- `originalName`: Tên gốc
- `mimeType`: Loại MIME
- `size`: Kích thước
- `path`: Đường dẫn
- `uploadedByUserId`: ID người upload
- `createdAt`: Thời gian tạo

### Quan hệ:
- `uploadedByUser`: ManyToOne với User

## Enums

### Role Enum
**File**: `src/common/enums/role.enums.ts`
- `BASIC_USER`: Người dùng cơ bản
- `STAFF`: Nhân viên
- `MANAGER`: Quản lý
- `ADMIN`: Quản trị viên

### StepType Enum
**File**: `src/modules/workflow/workflow-steps/entities/workflow-step.entity.ts`
- `START`: Bước bắt đầu
- `APPROVAL`: Bước phê duyệt
- `TRANSFER`: Bước chuyển tiếp
- `END`: Bước kết thúc

### StepStatus Enum
**File**: `src/modules/workflow/workflow-steps/entities/workflow-step.entity.ts`
- `PENDING`: Chờ xử lý
- `IN_PROGRESS`: Đang xử lý
- `COMPLETED`: Hoàn thành
- `REJECTED`: Từ chối

## Lưu ý quan trọng

1. **Thứ tự tạo dữ liệu**: Phải tạo theo thứ tự để tránh lỗi foreign key constraint
2. **Xóa dữ liệu**: Phải xóa theo thứ tự ngược lại
3. **Quan hệ đệ quy**: Department và Unit có quan hệ self-referencing
4. **Mật khẩu**: Luôn hash mật khẩu trước khi lưu
5. **Timestamps**: Các entity chính đều có createdAt và updatedAt
6. **Soft Delete**: Có thể cân nhắc thêm soft delete cho các entity quan trọng
