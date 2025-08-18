# Mô tả chi tiết - Sơ đồ tuần tự Phê duyệt (Approval)

## Tổng quan

Sơ đồ tuần tự phê duyệt mô tả toàn bộ quy trình phê duyệt văn bản trong hệ thống TDMU Dispatch, từ phê duyệt, từ chối, yêu cầu chỉnh sửa đến xem lịch sử phê duyệt và tạo báo cáo.

## Các thành phần tham gia

### Actors
- **Approver**: Người phê duyệt (UNIVERSITY_LEADER, DEPARTMENT_HEAD, DEPARTMENT_STAFF)

### Participants
- **Frontend**: Giao diện người dùng (Angular)
- **ApprovalService**: Service xử lý logic phê duyệt
- **WorkflowService**: Service quản lý workflow
- **DocumentService**: Service quản lý văn bản
- **NotificationService**: Service gửi thông báo
- **Database**: Cơ sở dữ liệu MySQL
- **MailService**: Service gửi email

## Chi tiết các use case

### 1. Phê duyệt văn bản

#### Mô tả
Approver phê duyệt một văn bản và chuyển sang bước tiếp theo trong workflow hoặc hoàn thành quy trình.

#### Luồng xử lý
1. **Approver → Frontend**: Chọn văn bản cần phê duyệt
2. **Frontend → WorkflowService**: Gọi API `getWorkflowInstance(documentId)`
3. **WorkflowService → Database**: SELECT * FROM workflow_instances WHERE documentId = ?
4. **Database → WorkflowService**: Trả về workflow data
5. **WorkflowService → Frontend**: Trả về WorkflowInstance object
6. **Frontend → Approver**: Hiển thị form phê duyệt

7. **Approver → Frontend**: Nhập ý kiến và chọn "Phê duyệt"
8. **Frontend → ApprovalService**: Gọi API `approveDocument(approvalInput)`
9. **ApprovalService**: Validate approval data

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- ApprovalService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Thực hiện approval action**:
  - ApprovalService → WorkflowService: `executeAction(APPROVE, approvalInput)`
  - WorkflowService → WorkflowService: `handleApproveAction(workflowInstance)`

- **Tìm bước tiếp theo**:
  - WorkflowService → Database: SELECT * FROM workflow_steps WHERE id > currentStepId ORDER BY orderNumber LIMIT 1
  - Database → WorkflowService: Trả về nextStep

- **Xử lý theo kết quả**:

  **Nếu có bước tiếp theo**:
  - WorkflowService → Database: UPDATE workflow_instances SET currentStepId = ? WHERE id = ?
  - Database → WorkflowService: Success
  - WorkflowService → Database: INSERT INTO approval_history (workflowId, stepId, action, approverId, comment)
  - Database → WorkflowService: Trả về historyId
  - WorkflowService → NotificationService: `sendApprovalNotification(workflowId, "APPROVED", nextStep.assignedRole)`
  - NotificationService → WorkflowService: Success
  - WorkflowService → MailService: `sendApprovalEmail(approver.email, document.title, "APPROVED")`
  - MailService → WorkflowService: Success
  - WorkflowService → ApprovalService: Success
  - ApprovalService → Frontend: Trả về ApprovalResult { status: "APPROVED", nextStep }
  - Frontend → Approver: Hiển thị "Đã phê duyệt thành công"

  **Nếu không có bước tiếp theo (hoàn thành)**:
  - WorkflowService → Database: UPDATE workflow_instances SET status = 'COMPLETED', currentStepId = NULL WHERE id = ?
  - Database → WorkflowService: Success
  - WorkflowService → Database: INSERT INTO approval_history (workflowId, stepId, action, approverId, comment)
  - Database → WorkflowService: Trả về historyId
  - WorkflowService → DocumentService: `updateDocumentStatus(documentId, 'APPROVED')`
  - DocumentService → Database: UPDATE documents SET status = 'APPROVED' WHERE id = ?
  - Database → DocumentService: Success
  - WorkflowService → NotificationService: `sendCompletionNotification(workflowId, "COMPLETED")`
  - NotificationService → WorkflowService: Success
  - WorkflowService → MailService: `sendCompletionEmail(creator.email, document.title, "APPROVED")`
  - MailService → WorkflowService: Success
  - WorkflowService → ApprovalService: Success
  - ApprovalService → Frontend: Trả về ApprovalResult { status: "COMPLETED" }
  - Frontend → Approver: Hiển thị "Văn bản đã được phê duyệt hoàn toàn"

### 2. Từ chối văn bản

#### Mô tả
Approver từ chối văn bản và kết thúc quy trình phê duyệt.

#### Luồng xử lý
1. **Approver → Frontend**: Chọn văn bản và nhập lý do từ chối
2. **Frontend → ApprovalService**: Gọi API `rejectDocument(rejectionInput)`
3. **ApprovalService**: Validate rejection data

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- ApprovalService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Thực hiện reject action**:
  - ApprovalService → WorkflowService: `executeAction(REJECT, rejectionInput)`
  - WorkflowService → WorkflowService: `handleRejectAction(workflowInstance)`

- **Cập nhật trạng thái workflow**:
  - WorkflowService → Database: UPDATE workflow_instances SET status = 'REJECTED' WHERE id = ?
  - Database → WorkflowService: Success

- **Lưu lịch sử phê duyệt**:
  - WorkflowService → Database: INSERT INTO approval_history (workflowId, stepId, action, approverId, comment)
  - Database → WorkflowService: Trả về historyId

- **Cập nhật trạng thái văn bản**:
  - WorkflowService → DocumentService: `updateDocumentStatus(documentId, 'REJECTED')`
  - DocumentService → Database: UPDATE documents SET status = 'REJECTED' WHERE id = ?
  - Database → DocumentService: Success

- **Gửi thông báo**:
  - WorkflowService → NotificationService: `sendRejectionNotification(workflowId, "REJECTED")`
  - NotificationService → WorkflowService: Success
  - WorkflowService → MailService: `sendRejectionEmail(creator.email, document.title, rejectionInput.comment)`
  - MailService → WorkflowService: Success

- **Kết quả**:
  - WorkflowService → ApprovalService: Success
  - ApprovalService → Frontend: Trả về RejectionResult { status: "REJECTED" }
  - Frontend → Approver: Hiển thị "Đã từ chối văn bản"

### 3. Yêu cầu chỉnh sửa

#### Mô tả
Approver yêu cầu chỉnh sửa văn bản và chuyển workflow về bước chỉnh sửa.

#### Luồng xử lý
1. **Approver → Frontend**: Chọn văn bản và nhập yêu cầu chỉnh sửa
2. **Frontend → ApprovalService**: Gọi API `requestRevision(revisionInput)`
3. **ApprovalService**: Validate revision data

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- ApprovalService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Thực hiện transfer action**:
  - ApprovalService → WorkflowService: `executeAction(TRANSFER, revisionInput)`
  - WorkflowService → WorkflowService: `handleTransferAction(workflowInstance, revisionStepId)`

- **Cập nhật current step**:
  - WorkflowService → Database: UPDATE workflow_instances SET currentStepId = ? WHERE id = ?
  - Database → WorkflowService: Success

- **Lưu lịch sử phê duyệt**:
  - WorkflowService → Database: INSERT INTO approval_history (workflowId, stepId, action, approverId, comment)
  - Database → WorkflowService: Trả về historyId

- **Cập nhật trạng thái văn bản**:
  - WorkflowService → DocumentService: `updateDocumentStatus(documentId, 'REVISION_REQUESTED')`
  - DocumentService → Database: UPDATE documents SET status = 'REVISION_REQUESTED' WHERE id = ?
  - Database → DocumentService: Success

- **Gửi thông báo**:
  - WorkflowService → NotificationService: `sendRevisionNotification(workflowId, "REVISION_REQUESTED")`
  - NotificationService → WorkflowService: Success
  - WorkflowService → MailService: `sendRevisionEmail(creator.email, document.title, revisionInput.comment)`
  - MailService → WorkflowService: Success

- **Kết quả**:
  - WorkflowService → ApprovalService: Success
  - ApprovalService → Frontend: Trả về RevisionResult { status: "REVISION_REQUESTED" }
  - Frontend → Approver: Hiển thị "Đã yêu cầu chỉnh sửa văn bản"

### 4. Xem lịch sử phê duyệt

#### Mô tả
Approver xem lịch sử phê duyệt của một văn bản cụ thể.

#### Luồng xử lý
1. **Approver → Frontend**: Click vào văn bản để xem lịch sử
2. **Frontend → ApprovalService**: Gọi API `getApprovalHistory(documentId)`
3. **ApprovalService → Database**: SELECT * FROM approval_history WHERE workflowId = ? ORDER BY createdAt DESC
4. **Database → ApprovalService**: Trả về history list
5. **ApprovalService → Frontend**: Trả về ApprovalHistory array
6. **Frontend → Approver**: Hiển thị lịch sử phê duyệt

### 5. Tạo báo cáo phê duyệt

#### Mô tả
Approver tạo báo cáo phê duyệt theo khoảng thời gian và bộ lọc.

#### Luồng xử lý
1. **Approver → Frontend**: Chọn khoảng thời gian và bộ lọc
2. **Frontend → ApprovalService**: Gọi API `generateApprovalReport(reportInput)`
3. **ApprovalService → Database**: SELECT * FROM approval_history WHERE createdAt BETWEEN ? AND ? AND action = ?
4. **Database → ApprovalService**: Trả về approval data
5. **ApprovalService → Database**: SELECT COUNT(*) FROM approval_history WHERE action = 'APPROVED' AND createdAt BETWEEN ? AND ?
6. **Database → ApprovalService**: Trả về approved count
7. **ApprovalService → Database**: SELECT COUNT(*) FROM approval_history WHERE action = 'REJECTED' AND createdAt BETWEEN ? AND ?
8. **Database → ApprovalService**: Trả về rejected count
9. **ApprovalService → ApprovalService**: `generateReport(approval data, approved count, rejected count)`
10. **ApprovalService → Frontend**: Trả về ApprovalReport object
11. **Frontend → Approver**: Hiển thị báo cáo phê duyệt

### 6. Xem văn bản cần phê duyệt

#### Mô tả
Approver xem danh sách văn bản đang chờ phê duyệt theo role của mình.

#### Luồng xử lý
1. **Approver → Frontend**: Truy cập trang pending approvals
2. **Frontend → ApprovalService**: Gọi API `getPendingApprovals(userId)`
3. **ApprovalService → Database**: SELECT * FROM workflow_instances WHERE currentStepId IN (SELECT id FROM workflow_steps WHERE assignedRole IN ?) AND status = 'IN_PROGRESS'
4. **Database → ApprovalService**: Trả về pending workflows list
5. **ApprovalService → Frontend**: Trả về PendingApproval array
6. **Frontend → Approver**: Hiển thị danh sách văn bản cần phê duyệt

### 7. Phê duyệt hàng loạt

#### Mô tả
Approver phê duyệt nhiều văn bản cùng lúc.

#### Luồng xử lý
1. **Approver → Frontend**: Chọn nhiều văn bản và action
2. **Frontend → ApprovalService**: Gọi API `batchApprove(batchInput)`
3. **ApprovalService**: Validate batch input

#### Xử lý các trường hợp

**Trường hợp 1: Validation failed**
- ApprovalService throw `BadRequestException`
- Frontend hiển thị lỗi validation

**Trường hợp 2: Validation passed**
- **Xử lý từng document**:
  - Loop cho mỗi documentId:
    - ApprovalService → ApprovalService: `approveDocument(documentId, batchInput.comment)`
    - ApprovalService → WorkflowService: `executeAction(APPROVE, approvalInput)`
    - WorkflowService → WorkflowService: `handleApproveAction(workflowInstance)`
    - WorkflowService → Database: UPDATE workflow_instances SET currentStepId = ? WHERE id = ?
    - Database → WorkflowService: Success
    - WorkflowService → Database: INSERT INTO approval_history (...)
    - Database → WorkflowService: Trả về historyId

- **Gửi thông báo hàng loạt**:
  - ApprovalService → NotificationService: `sendBatchApprovalNotification(batchInput.documentIds, "BATCH_APPROVED")`
  - NotificationService → ApprovalService: Success

- **Kết quả**:
  - ApprovalService → Frontend: Trả về BatchApprovalResult { processed: count, success: count }
  - Frontend → Approver: Hiển thị "Đã phê duyệt hàng loạt thành công"

### 8. Thống kê phê duyệt

#### Mô tả
Approver xem thống kê phê duyệt theo khoảng thời gian.

#### Luồng xử lý
1. **Approver → Frontend**: Truy cập trang thống kê
2. **Frontend → ApprovalService**: Gọi API `getApprovalStatistics(timeRange)`
3. **ApprovalService → Database**: SELECT action, COUNT(*) FROM approval_history WHERE createdAt BETWEEN ? AND ? GROUP BY action
4. **Database → ApprovalService**: Trả về statistics data
5. **ApprovalService → Database**: SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) FROM workflow_instances WHERE status = 'COMPLETED' AND createdAt BETWEEN ? AND ?
6. **Database → ApprovalService**: Trả về average processing time
7. **ApprovalService → Frontend**: Trả về ApprovalStatistics object
8. **Frontend → Approver**: Hiển thị thống kê phê duyệt

## Các đặc điểm kỹ thuật

### Approval Engine
- **Multi-step Approval**: Hỗ trợ phê duyệt nhiều bước
- **Action Validation**: Kiểm tra action có hợp lệ với step hiện tại
- **Permission Control**: Kiểm tra quyền dựa trên role và step
- **Audit Trail**: Lưu lại tất cả actions và thay đổi trạng thái

### Database Design
- **Approval History**: Lưu lịch sử phê duyệt
- **Workflow Instances**: Lưu trạng thái workflow
- **Documents**: Lưu trạng thái văn bản
- **Relationships**: Link approval history với workflow và document

### Security
- **Role-based Access**: Kiểm tra quyền dựa trên role
- **Step-based Permission**: Chỉ user có role phù hợp mới phê duyệt được
- **Action Validation**: Validate action type với step type

### Performance
- **Caching**: Cache approval permissions và workflow data
- **Pagination**: Phân trang cho danh sách văn bản cần phê duyệt
- **Indexing**: Index trên các trường tìm kiếm

## Các trường hợp đặc biệt

### Approval States
- **PENDING**: Văn bản đang chờ phê duyệt
- **APPROVED**: Văn bản đã được phê duyệt
- **REJECTED**: Văn bản bị từ chối
- **REVISION_REQUESTED**: Văn bản cần chỉnh sửa

### Action Types
- **APPROVE**: Phê duyệt và chuyển sang bước tiếp theo
- **REJECT**: Từ chối và kết thúc workflow
- **REVISION**: Yêu cầu chỉnh sửa và chuyển về bước chỉnh sửa

### Permission Rules
- **UNIVERSITY_LEADER**: Có thể phê duyệt ở bước cuối
- **DEPARTMENT_HEAD**: Có thể phê duyệt ở bước trung gian
- **DEPARTMENT_STAFF**: Có thể phê duyệt theo step được gán

## Monitoring và Logging

### Audit Trail
- Log tất cả các actions phê duyệt
- Lưu thông tin approver và thời gian
- Track thời gian xử lý mỗi step

### Metrics
- Số lượng văn bản được phê duyệt/từ chối
- Thời gian phê duyệt trung bình
- Số lượng revision requests

## Tích hợp với hệ thống

### Workflow Integration
- Approval actions được thực hiện thông qua workflow
- Cập nhật trạng thái workflow theo approval
- Link approval history với workflow steps

### Document Integration
- Cập nhật trạng thái văn bản theo approval
- Link approval history với document
- Track document lifecycle

### Notification Integration
- Thông báo khi có văn bản cần phê duyệt
- Thông báo khi văn bản được phê duyệt/từ chối
- Email notifications cho tất cả stakeholders

