# Mô tả chi tiết - Sơ đồ tuần tự Workflow

## Tổng quan

Sơ đồ tuần tự workflow mô tả toàn bộ quy trình quản lý workflow trong hệ thống TDMU Dispatch, từ tạo workflow template, tạo workflow instance, thực hiện các actions đến quản lý workflow instances và theo dõi trạng thái.

## Các thành phần tham gia

### Actors
- **User**: Người dùng cuối thực hiện các thao tác workflow (tất cả roles)

### Participants
- **Frontend**: Giao diện người dùng (Angular)
- **WorkflowService**: Service xử lý logic workflow
- **WorkflowPermissionsService**: Service kiểm tra quyền workflow
- **NotificationService**: Service gửi thông báo
- **Database**: Cơ sở dữ liệu MySQL
- **Cache**: Redis cache cho workflow data

## Chi tiết các use case

### 1. Tạo workflow template

#### Mô tả
SYSTEM_ADMIN tạo một workflow template mới định nghĩa các bước trong quy trình xử lý văn bản.

#### Luồng xử lý
1. **User → Frontend**: Nhập thông tin template (name, description, steps)
2. **Frontend → WorkflowService**: Gọi API `createWorkflowTemplate(templateInput)`
3. **WorkflowService**: Validate template data (name, steps configuration)

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- WorkflowService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Tạo template**:
  - WorkflowService → Database: INSERT INTO workflow_templates (name, description, isActive)
  - Database → WorkflowService: Trả về templateId

- **Tạo các steps**:
  - Loop cho mỗi step trong template:
    - WorkflowService → Database: INSERT INTO workflow_steps (templateId, name, type, assignedRole, orderNumber)
    - Database → WorkflowService: Trả về stepId

- **Kết quả**:
  - WorkflowService → Frontend: Trả về WorkflowTemplate object
  - Frontend → User: Hiển thị thông báo tạo template thành công

### 2. Tạo workflow instance

#### Mô tả
User tạo một workflow instance từ template để xử lý một văn bản cụ thể.

#### Luồng xử lý
1. **User → Frontend**: Chọn template và document
2. **Frontend → WorkflowService**: Gọi API `createWorkflowInstance(instanceInput)`
3. **WorkflowService → WorkflowPermissionsService**: Kiểm tra quyền tạo workflow
4. **WorkflowPermissionsService**: `canCreateWorkflow(user, templateId)`

#### Xử lý các trường hợp

**Trường hợp 1: Không có quyền**
- WorkflowPermissionsService → WorkflowService: Trả về false
- WorkflowService throw `ForbiddenException`
- Frontend hiển thị lỗi "Không có quyền tạo workflow"

**Trường hợp 2: Có quyền**
- WorkflowPermissionsService → WorkflowService: Trả về true
- **Tạo workflow instance**:
  - WorkflowService → Database: INSERT INTO workflow_instances (templateId, documentId, status, createdByUserId, notes)
  - Database → WorkflowService: Trả về instanceId

- **Lấy steps và set current step**:
  - WorkflowService → Database: SELECT * FROM workflow_steps WHERE templateId = ? ORDER BY orderNumber
  - Database → WorkflowService: Trả về steps list
  - WorkflowService → Database: UPDATE workflow_instances SET currentStepId = ? WHERE id = ?
  - Database → WorkflowService: Success

- **Gửi thông báo**:
  - WorkflowService → NotificationService: `sendWorkflowNotification(instanceId, "CREATED")`
  - NotificationService → WorkflowService: Success

- **Kết quả**:
  - WorkflowService → Frontend: Trả về WorkflowInstance object
  - Frontend → User: Hiển thị thông báo tạo workflow thành công

### 3. Thực hiện workflow action

#### Mô tả
User thực hiện các actions trên workflow như APPROVE, REJECT, TRANSFER, CANCEL, COMPLETE.

#### Luồng xử lý
1. **User → Frontend**: Chọn action (APPROVE/REJECT/TRANSFER/CANCEL/COMPLETE)
2. **Frontend → WorkflowService**: Gọi API `executeAction(actionInput)`
3. **WorkflowService → WorkflowPermissionsService**: Kiểm tra quyền thực hiện action
4. **WorkflowPermissionsService**: `canPerformAction(user, currentStep, actionType)`

#### Xử lý các trường hợp

**Trường hợp 1: Không có quyền**
- WorkflowPermissionsService → WorkflowService: Trả về false
- WorkflowService throw `ForbiddenException`
- Frontend hiển thị lỗi "Không có quyền thực hiện action này"

**Trường hợp 2: Có quyền**
- WorkflowPermissionsService → WorkflowService: Trả về true

- **Xử lý theo loại action**:

  **Action = APPROVE**:
  - WorkflowService → WorkflowService: `handleApproveAction(instance)`
  - WorkflowService → Database: SELECT * FROM workflow_steps WHERE id > currentStepId ORDER BY orderNumber LIMIT 1
  - Database → WorkflowService: Trả về nextStep

  - **Nếu có bước tiếp theo**:
    - WorkflowService → Database: UPDATE workflow_instances SET currentStepId = ? WHERE id = ?
    - Database → WorkflowService: Success
    - WorkflowService → NotificationService: `sendWorkflowNotification(instanceId, "APPROVED")`

  - **Nếu không có bước tiếp theo (hoàn thành)**:
    - WorkflowService → Database: UPDATE workflow_instances SET status = 'COMPLETED', currentStepId = NULL WHERE id = ?
    - Database → WorkflowService: Success
    - WorkflowService → NotificationService: `sendWorkflowNotification(instanceId, "COMPLETED")`

  **Action = REJECT**:
  - WorkflowService → WorkflowService: `handleRejectAction(instance)`
  - WorkflowService → Database: UPDATE workflow_instances SET status = 'REJECTED' WHERE id = ?
  - Database → WorkflowService: Success
  - WorkflowService → NotificationService: `sendWorkflowNotification(instanceId, "REJECTED")`

  **Action = TRANSFER**:
  - WorkflowService → WorkflowService: `handleTransferAction(instance, targetStepId)`
  - WorkflowService → Database: UPDATE workflow_instances SET currentStepId = ? WHERE id = ?
  - Database → WorkflowService: Success
  - WorkflowService → NotificationService: `sendWorkflowNotification(instanceId, "TRANSFERRED")`

  **Action = CANCEL**:
  - WorkflowService → WorkflowService: `handleCancelAction(instance)`
  - WorkflowService → Database: UPDATE workflow_instances SET status = 'CANCELLED' WHERE id = ?
  - Database → WorkflowService: Success
  - WorkflowService → NotificationService: `sendWorkflowNotification(instanceId, "CANCELLED")`

  **Action = COMPLETE**:
  - WorkflowService → WorkflowService: `handleCompleteAction(instance)`
  - WorkflowService → Database: UPDATE workflow_instances SET status = 'COMPLETED' WHERE id = ?
  - Database → WorkflowService: Success
  - WorkflowService → NotificationService: `sendWorkflowNotification(instanceId, "COMPLETED")`

- **Lưu action log**:
  - WorkflowService → Database: INSERT INTO workflow_action_logs (instanceId, stepId, actionType, actionByUserId, note, metadata)
  - Database → WorkflowService: Trả về logId

- **Kết quả**:
  - WorkflowService → Frontend: Trả về Updated WorkflowInstance
  - Frontend refresh workflow list
  - Frontend → User: Hiển thị thông báo action thành công

### 4. Xem danh sách workflow đang chờ

#### Mô tả
User xem danh sách các workflow đang chờ xử lý theo role của mình.

#### Luồng xử lý
1. **User → Frontend**: Truy cập trang workflow pending
2. **Frontend → WorkflowService**: Gọi API `getMyPendingWorkflows(userId)`
3. **WorkflowService → Database**: SELECT * FROM workflow_instances WHERE currentStepId IN (SELECT id FROM workflow_steps WHERE assignedRole IN ?) AND status = 'IN_PROGRESS'
4. **Database → WorkflowService**: Trả về pending workflows list
5. **WorkflowService → Frontend**: Trả về WorkflowInstance array
6. **Frontend → User**: Hiển thị danh sách workflow cần xử lý

### 5. Xem chi tiết workflow

#### Mô tả
User xem chi tiết một workflow instance bao gồm thông tin, lịch sử actions và các steps.

#### Luồng xử lý
1. **User → Frontend**: Click vào workflow
2. **Frontend → WorkflowService**: Gọi API `getWorkflowInstance(id)`
3. **WorkflowService → WorkflowPermissionsService**: Kiểm tra quyền xem workflow
4. **WorkflowPermissionsService**: `canViewWorkflow(user, instance)`

#### Xử lý các trường hợp

**Trường hợp 1: Không có quyền xem**
- WorkflowPermissionsService → WorkflowService: Trả về false
- WorkflowService throw `ForbiddenException`
- Frontend hiển thị lỗi "Không có quyền xem workflow này"

**Trường hợp 2: Có quyền xem**
- WorkflowPermissionsService → WorkflowService: Trả về true
- **Lấy thông tin workflow**:
  - WorkflowService → Database: SELECT * FROM workflow_instances WHERE id = ?
  - Database → WorkflowService: Trả về instance data

- **Lấy action logs**:
  - WorkflowService → Database: SELECT * FROM workflow_action_logs WHERE instanceId = ? ORDER BY createdAt
  - Database → WorkflowService: Trả về action logs

- **Lấy steps**:
  - WorkflowService → Database: SELECT * FROM workflow_steps WHERE templateId = ? ORDER BY orderNumber
  - Database → WorkflowService: Trả về steps list

- **Kết quả**:
  - WorkflowService → Frontend: Trả về WorkflowInstanceDetail { instance, logs, steps }
  - Frontend → User: Hiển thị chi tiết workflow

### 6. Tìm kiếm workflow

#### Mô tả
User tìm kiếm workflow theo từ khóa hoặc các tiêu chí khác.

#### Luồng xử lý
1. **User → Frontend**: Nhập từ khóa tìm kiếm
2. **Frontend → WorkflowService**: Gọi API `searchWorkflows(keyword, filters)`
3. **WorkflowService → Database**: SELECT * FROM workflow_instances WHERE notes LIKE ? OR id IN (SELECT instanceId FROM workflow_action_logs WHERE note LIKE ?)
4. **Database → WorkflowService**: Trả về workflows list
5. **WorkflowService → Frontend**: Trả về WorkflowInstance array
6. **Frontend → User**: Hiển thị kết quả tìm kiếm

### 7. Lọc workflow theo trạng thái

#### Mô tả
User lọc workflow theo trạng thái (IN_PROGRESS, COMPLETED, CANCELLED, REJECTED).

#### Luồng xử lý
1. **User → Frontend**: Chọn bộ lọc trạng thái
2. **Frontend → WorkflowService**: Gọi API `getWorkflowsByStatus(status, pagination)`
3. **WorkflowService → Database**: SELECT * FROM workflow_instances WHERE status = ? ORDER BY updatedAt DESC LIMIT ? OFFSET ?
4. **Database → WorkflowService**: Trả về workflows list
5. **WorkflowService → Database**: SELECT COUNT(*) FROM workflow_instances WHERE status = ?
6. **Database → WorkflowService**: Trả về total count
7. **WorkflowService → Frontend**: Trả về PaginatedResponse
8. **Frontend → User**: Hiển thị danh sách đã lọc

## Các đặc điểm kỹ thuật

### Workflow Engine
- **State Management**: Quản lý trạng thái workflow theo steps
- **Action Validation**: Kiểm tra action có hợp lệ với step hiện tại
- **Permission Control**: Kiểm tra quyền dựa trên role và step
- **Audit Trail**: Lưu lại tất cả actions và thay đổi trạng thái

### Database Design
- **Workflow Templates**: Lưu cấu trúc workflow
- **Workflow Steps**: Lưu các bước trong workflow
- **Workflow Instances**: Lưu các instance đang chạy
- **Action Logs**: Lưu lịch sử các actions

### Security
- **Role-based Access**: Kiểm tra quyền dựa trên role
- **Step-based Permission**: Chỉ user có role phù hợp mới thực hiện được action
- **Action Validation**: Validate action type với step type

### Performance
- **Caching**: Cache workflow templates và permissions
- **Pagination**: Phân trang cho danh sách workflow
- **Indexing**: Index trên các trường tìm kiếm

## Các trường hợp đặc biệt

### Workflow States
- **IN_PROGRESS**: Workflow đang chạy
- **COMPLETED**: Workflow đã hoàn thành
- **CANCELLED**: Workflow bị hủy
- **REJECTED**: Workflow bị từ chối

### Action Types
- **APPROVE**: Phê duyệt và chuyển sang bước tiếp theo
- **REJECT**: Từ chối và kết thúc workflow
- **TRANSFER**: Chuyển sang bước khác
- **CANCEL**: Hủy workflow
- **COMPLETE**: Hoàn thành workflow

### Permission Rules
- **SYSTEM_ADMIN**: Có thể thực hiện tất cả actions
- **UNIVERSITY_LEADER**: Có thể APPROVE/REJECT ở bước cuối
- **DEPARTMENT_HEAD**: Có thể APPROVE/REJECT ở bước trung gian
- **DEPARTMENT_STAFF**: Có thể thực hiện actions theo step được gán

## Monitoring và Logging

### Audit Trail
- Log tất cả các actions trên workflow
- Lưu thông tin user thực hiện action
- Track thời gian xử lý mỗi step

### Metrics
- Số lượng workflow được tạo/completed/cancelled
- Thời gian xử lý trung bình của workflow
- Số lượng actions được thực hiện

## Tích hợp với hệ thống

### Document Integration
- Workflow được tạo tự động khi tạo văn bản
- Cập nhật trạng thái văn bản theo workflow
- Link workflow với document

### Notification Integration
- Thông báo khi workflow được tạo
- Thông báo khi có action mới
- Thông báo khi workflow hoàn thành

### User Management Integration
- Kiểm tra quyền dựa trên user roles
- Gán workflow cho user có role phù hợp
- Track user participation trong workflow

