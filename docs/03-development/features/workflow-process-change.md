# Thay đổi Quy trình Workflow - Giao việc trước, tạo văn bản sau

## Tổng quan

Hệ thống đã được cập nhật để thay đổi quy trình từ "tạo văn bản trước rồi giao việc" thành "giao việc trước rồi người nhận việc mới tạo văn bản".

## Thay đổi chính

### 1. Quy trình Workflow mới

**Quy trình cũ:**
1. Tạo văn bản (START) - BASIC_USER
2. Phê duyệt trưởng phòng (APPROVAL) - DEPARTMENT_STAFF
3. Phê duyệt phó hiệu trưởng (APPROVAL) - UNIVERSITY_LEADER
4. Phê duyệt hiệu trưởng (END) - UNIVERSITY_LEADER

**Quy trình mới:**
1. **Giao việc** (START) - DEPARTMENT_STAFF
2. **Tạo văn bản** (TRANSFER) - CLERK
3. Phê duyệt trưởng phòng (APPROVAL) - DEPARTMENT_STAFF
4. Phê duyệt phó hiệu trưởng (APPROVAL) - UNIVERSITY_LEADER
5. Phê duyệt hiệu trưởng (END) - UNIVERSITY_LEADER

### 2. Entity mới: TaskRequest

Đã tạo entity `TaskRequest` để quản lý việc giao việc trước khi tạo văn bản:

```typescript
export class TaskRequest {
  id: number;
  requestedByUserId: number; // Người giao việc
  assignedToUserId: number;  // Người nhận việc
  title: string;             // Tiêu đề công việc
  description?: string;      // Mô tả công việc
  priority: TaskPriority;    // Mức độ ưu tiên
  deadline?: Date;           // Deadline
  instructions?: string;     // Hướng dẫn thực hiện
  notes?: string;            // Ghi chú
  status: TaskRequestStatus; // Trạng thái
  // ... các trường khác
}
```

### 3. Trạng thái TaskRequest

- **PENDING**: Chờ người nhận việc phê duyệt
- **APPROVED**: Đã được phê duyệt, có thể tạo văn bản
- **REJECTED**: Bị từ chối
- **CANCELLED**: Đã hủy

### 4. Quyền hạn

**Tạo TaskRequest:**
- SYSTEM_ADMIN: Có thể giao việc cho bất kỳ ai
- UNIVERSITY_LEADER: Có thể giao việc cho DEPARTMENT_STAFF và CLERK
- DEPARTMENT_STAFF: Có thể giao việc cho CLERK

**Phê duyệt TaskRequest:**
- Người được giao việc có thể phê duyệt/từ chối task của mình
- SYSTEM_ADMIN và UNIVERSITY_LEADER có thể phê duyệt/từ chối bất kỳ task nào

## Cách sử dụng

### 1. Giao việc

**Bước 1:** Trưởng phòng/Quản lý tạo yêu cầu giao việc
- Vào menu "Giao việc" 
- Chọn "Giao việc mới"
- Điền thông tin: người nhận, tiêu đề, mô tả, deadline, ưu tiên
- Gửi yêu cầu

**Bước 2:** Người nhận việc xử lý
- Nhận thông báo có việc được giao
- Xem chi tiết và phê duyệt/từ chối
- Nếu phê duyệt, có thể bắt đầu tạo văn bản

### 2. Tạo văn bản từ task

**Bước 3:** Sau khi task được phê duyệt
- Người nhận việc click "Tạo văn bản" từ task
- Hệ thống sẽ tạo workflow instance mới
- Bắt đầu từ bước "Tạo văn bản" (step 2)

### 3. Quy trình phê duyệt

**Bước 4-6:** Quy trình phê duyệt vẫn giữ nguyên
- Phê duyệt trưởng phòng
- Phê duyệt phó hiệu trưởng  
- Phê duyệt hiệu trưởng

## Lợi ích của quy trình mới

1. **Kiểm soát tốt hơn:** Việc giao việc được kiểm soát chặt chẽ hơn
2. **Phân quyền rõ ràng:** Chỉ người có quyền mới được giao việc
3. **Theo dõi hiệu quả:** Có thể theo dõi ai giao việc cho ai, khi nào
4. **Linh hoạt:** Người nhận việc có thể từ chối nếu không phù hợp
5. **Quản lý workload:** Có thể quản lý khối lượng công việc tốt hơn

## Migration

Để áp dụng thay đổi này, cần chạy các migration sau:

1. `migration-task-request.sql` - Tạo bảng task_request
2. `migration-update-workflow-steps.sql` - Cập nhật workflow steps

## API Endpoints mới

### TaskRequest
- `POST /graphql` - `createTaskRequest` - Tạo yêu cầu giao việc
- `POST /graphql` - `approveTaskRequest` - Phê duyệt yêu cầu
- `POST /graphql` - `rejectTaskRequest` - Từ chối yêu cầu
- `POST /graphql` - `cancelTaskRequest` - Hủy yêu cầu
- `GET /graphql` - `myTaskRequests` - Lấy danh sách việc được giao
- `GET /graphql` - `myCreatedTaskRequests` - Lấy danh sách việc đã giao
- `GET /graphql` - `taskRequestStatistics` - Thống kê task requests

## Frontend Components mới

1. `TaskRequestCreateComponent` - Form tạo yêu cầu giao việc
2. `TaskRequestListComponent` - Danh sách và quản lý task requests

## Lưu ý

- Các workflow instance cũ sẽ được cập nhật tự động
- Dữ liệu cũ vẫn được giữ nguyên
- Có thể rollback nếu cần thiết
