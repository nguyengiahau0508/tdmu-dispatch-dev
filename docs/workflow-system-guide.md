# Hướng dẫn sử dụng Hệ thống Workflow với Quyền theo Role

## Tổng quan

Hệ thống workflow của TDMU Dispatch cho phép quản lý quy trình xử lý văn bản theo từng vai trò (role) cụ thể. Mỗi người dùng chỉ có thể thực hiện các hành động phù hợp với vai trò của mình trong quy trình.

## Các Vai trò (Roles) và Quyền

### 1. SYSTEM_ADMIN (Quản trị viên hệ thống)
- **Quyền**: Toàn quyền trên hệ thống
- **Có thể**: Tạo, xem, xử lý tất cả workflow
- **Chức năng**: Quản lý người dùng, phân quyền, cấu hình hệ thống

### 2. UNIVERSITY_LEADER (Lãnh đạo cấp cao)
- **Quyền**: Phê duyệt văn bản quan trọng
- **Có thể**: Phê duyệt văn bản cấp trường, xem báo cáo toàn trường
- **Chức năng**: Hiệu trưởng, Phó Hiệu trưởng

### 3. DEPARTMENT_HEAD (Trưởng đơn vị)
- **Quyền**: Quản lý đơn vị, phê duyệt văn bản trong phạm vi đơn vị
- **Có thể**: Phê duyệt văn bản của đơn vị, quản lý nhân sự đơn vị
- **Chức năng**: Trưởng khoa, Trưởng phòng

### 4. DEPARTMENT_STAFF (Chuyên viên/Nhân viên)
- **Quyền**: Soạn thảo văn bản, thực hiện nghiệp vụ chuyên môn
- **Có thể**: Tạo văn bản, xem tài liệu được chia sẻ trong đơn vị
- **Chức năng**: Chuyên viên các phòng ban

### 5. CLERK (Văn thư)
- **Quyền**: Xử lý luồng văn bản
- **Có thể**: Nhận văn bản đến, phát hành văn bản đi, đóng dấu, lưu trữ
- **Chức năng**: Văn thư, thư ký

### 6. DEGREE_MANAGER (Quản lý văn bằng)
- **Quyền**: Quản lý văn bằng, chứng chỉ
- **Có thể**: Truy cập module quản lý phôi bằng, in, cấp phát văn bằng
- **Chức năng**: Chuyên viên phòng Đào tạo, Công tác Sinh viên

### 7. BASIC_USER (Người dùng cơ bản)
- **Quyền**: Quyền cơ bản nhất
- **Có thể**: Xem thông tin cá nhân, thông báo chung
- **Chức năng**: Tất cả người dùng đã xác thực

## Quy trình Workflow Mẫu

### Quy trình phê duyệt văn bản thông thường:

1. **Bước 1: Tạo văn bản** (START)
   - **Vai trò**: BASIC_USER
   - **Hành động**: Tạo văn bản mới

2. **Bước 2: Phê duyệt trưởng phòng** (APPROVAL)
   - **Vai trò**: DEPARTMENT_STAFF
   - **Hành động**: Phê duyệt hoặc từ chối

3. **Bước 3: Phê duyệt phó hiệu trưởng** (APPROVAL)
   - **Vai trò**: UNIVERSITY_LEADER
   - **Hành động**: Phê duyệt hoặc từ chối

4. **Bước 4: Phê duyệt hiệu trưởng** (END)
   - **Vai trò**: UNIVERSITY_LEADER
   - **Hành động**: Phê duyệt cuối cùng

## Các Loại Hành động (Action Types)

### 1. APPROVE (Phê duyệt)
- **Mô tả**: Chấp thuận và chuyển sang bước tiếp theo
- **Áp dụng cho**: Bước APPROVAL

### 2. REJECT (Từ chối)
- **Mô tả**: Từ chối và kết thúc workflow
- **Áp dụng cho**: Bước APPROVAL

### 3. TRANSFER (Chuyển tiếp)
- **Mô tả**: Chuyển sang bước khác
- **Áp dụng cho**: Tất cả bước

### 4. CANCEL (Hủy bỏ)
- **Mô tả**: Hủy bỏ workflow
- **Áp dụng cho**: Tất cả bước

### 5. START (Bắt đầu)
- **Mô tả**: Bắt đầu workflow
- **Áp dụng cho**: Bước START

### 6. COMPLETE (Hoàn thành)
- **Mô tả**: Hoàn thành bước hoặc workflow
- **Áp dụng cho**: Bước START, TRANSFER, END

## Cách sử dụng

### 1. Tạo Workflow Instance

```typescript
// Ví dụ: Văn thư tạo workflow cho văn bản mới
const createWorkflowInput = {
  templateId: 1, // ID của template "Quy trình phê duyệt văn bản thông thường"
  documentId: 123, // ID của văn bản
  notes: "Văn bản cần phê duyệt gấp"
};

// Chỉ CLERK, DEPARTMENT_STAFF, SYSTEM_ADMIN mới có thể tạo
```

### 2. Xử lý Workflow

```typescript
// Ví dụ: Trưởng phòng phê duyệt văn bản
const actionInput = {
  instanceId: 1,
  stepId: 2, // ID của bước "Phê duyệt trưởng phòng"
  actionType: "APPROVE",
  note: "Văn bản đã được phê duyệt"
};

// Chỉ DEPARTMENT_STAFF mới có thể thực hiện action này
```

### 3. Kiểm tra quyền

```typescript
// Kiểm tra user có thể thực hiện action không
const canPerform = await workflowPermissionsService.canPerformAction(
  user,
  step,
  actionType
);

// Kiểm tra user có thể xem workflow không
const canView = await workflowPermissionsService.canViewWorkflow(
  user,
  instance
);
```

## API Endpoints

### Queries

- `workflowInstances`: Lấy tất cả workflow instances
- `myWorkflowInstances`: Lấy workflow instances của user hiện tại
- `myPendingWorkflows`: Lấy workflow instances đang chờ xử lý
- `workflowInstance(id)`: Lấy workflow instance theo ID
- `availableActions(instanceId)`: Lấy danh sách actions có thể thực hiện

### Mutations

- `createWorkflowInstance`: Tạo workflow instance mới
- `executeWorkflowAction`: Thực hiện action trên workflow

### Permissions Queries

- `canPerformWorkflowAction`: Kiểm tra quyền thực hiện action
- `canViewWorkflow`: Kiểm tra quyền xem workflow
- `canCreateWorkflow`: Kiểm tra quyền tạo workflow
- `workflowRoles`: Lấy danh sách roles
- `workflowActionTypes`: Lấy danh sách action types

## Frontend Components

### 1. WorkflowDashboardComponent
- Hiển thị dashboard với thống kê workflow
- Danh sách workflow cần xử lý
- Danh sách workflow của user

### 2. WorkflowActionComponent
- Form để thực hiện action trên workflow
- Hiển thị thông tin bước hiện tại
- Danh sách actions có thể thực hiện

### 3. WorkflowInstanceDetailComponent
- Chi tiết workflow instance
- Lịch sử xử lý
- Thông tin các bước

## Bảo mật

### 1. Authentication
- Tất cả API đều yêu cầu JWT token
- User phải đăng nhập để truy cập

### 2. Authorization
- Kiểm tra role trước khi thực hiện action
- Guard bảo vệ các mutation quan trọng
- Service kiểm tra quyền chi tiết

### 3. Validation
- Validate input trước khi xử lý
- Kiểm tra trạng thái workflow hợp lệ
- Đảm bảo workflow không bị duplicate action

## Monitoring và Logging

### 1. Action Logs
- Lưu lại tất cả actions thực hiện
- Thông tin user thực hiện
- Thời gian và ghi chú

### 2. Audit Trail
- Theo dõi toàn bộ quá trình xử lý
- Có thể truy vết lại lịch sử
- Bảo mật và minh bạch

## Troubleshooting

### Lỗi thường gặp:

1. **"User does not have permission to perform this action"**
   - Nguyên nhân: User không có role phù hợp
   - Giải pháp: Kiểm tra role của user và assignedRole của step

2. **"Workflow template is not active"**
   - Nguyên nhân: Template đã bị vô hiệu hóa
   - Giải pháp: Kích hoạt template hoặc chọn template khác

3. **"Invalid action type"**
   - Nguyên nhân: Action type không phù hợp với step type
   - Giải pháp: Kiểm tra action type được phép cho step

### Debug:

```typescript
// Kiểm tra quyền chi tiết
const permissions = await workflowPermissionsService.getAvailableActions(step);
console.log('Available actions:', permissions);

// Kiểm tra role user
console.log('User roles:', user.roles);
console.log('Step assigned role:', step.assignedRole);
```

## Kết luận

Hệ thống workflow với quyền theo role đảm bảo:
- Mỗi người chỉ thực hiện đúng chức năng của mình
- Quy trình được thực hiện đúng thứ tự
- Bảo mật và kiểm soát truy cập tốt
- Dễ dàng mở rộng và tùy chỉnh
