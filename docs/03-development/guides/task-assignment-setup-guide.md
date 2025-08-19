# Hướng dẫn Setup Chức năng Giao việc (Task Assignment)

## Tổng quan
Chức năng giao việc cho phép cấp trên giao việc cho cấp dưới thực hiện các công việc liên quan đến văn bản. Tính năng này bao gồm:

- Giao việc cho người dùng cụ thể
- Theo dõi trạng thái công việc
- Quản lý deadline và ưu tiên
- Thống kê và báo cáo

## Các file đã tạo

### Backend
1. **Entities:**
   - `apps/backend/src/modules/dispatch/documents/entities/task-assignment.entity.ts`
   - Enum TaskStatus: PENDING, IN_PROGRESS, COMPLETED, CANCELLED

2. **DTOs:**
   - `apps/backend/src/modules/dispatch/documents/dto/assign-task/assign-task.input.ts`
   - `apps/backend/src/modules/dispatch/documents/dto/assign-task/assign-task.output.ts`

3. **Services:**
   - `apps/backend/src/modules/dispatch/documents/task-assignment.service.ts`

4. **Resolvers:**
   - `apps/backend/src/modules/dispatch/documents/task-assignment.resolver.ts`

5. **Migration:**
   - `migration-task-assignment.sql`

### Frontend
1. **Services:**
   - `apps/frontend/src/app/core/services/dispatch/task-assignment.service.ts`

2. **Components:**
   - `apps/frontend/src/app/features/user/task-assignment/task-assignment-modal.component.ts`
   - `apps/frontend/src/app/features/user/task-assignment/task-management.component.ts`

## Cài đặt

### 1. Chạy Migration Database

Chạy file migration để tạo bảng `task_assignment`:

```sql
-- Copy nội dung từ file migration-task-assignment.sql và chạy trong MySQL
CREATE TABLE `task_assignment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `documentId` int NOT NULL,
  `assignedToUserId` int NOT NULL,
  `assignedByUserId` int NOT NULL,
  `taskDescription` text,
  `deadline` timestamp NULL DEFAULT NULL,
  `instructions` text,
  `notes` text,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `assignedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`documentId`),
  KEY `idx_assigned_to_user_id` (`assignedToUserId`),
  KEY `idx_assigned_by_user_id` (`assignedByUserId`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_at` (`assignedAt`),
  CONSTRAINT `fk_task_assignment_document` FOREIGN KEY (`documentId`) REFERENCES `document` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_assignment_assigned_to_user` FOREIGN KEY (`assignedToUserId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_assignment_assigned_by_user` FOREIGN KEY (`assignedByUserId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX `idx_task_assignment_composite` ON `task_assignment` (`assignedToUserId`, `status`, `assignedAt`);
CREATE INDEX `idx_task_assignment_deadline` ON `task_assignment` (`deadline`);
```

### 2. Khởi động Backend

```bash
cd apps/backend
npm run start:dev
```

### 3. Khởi động Frontend

```bash
cd apps/frontend
npm run start
```

## Sử dụng

### 1. Giao việc

Để giao việc cho người dùng:

1. Mở văn bản cần giao việc
2. Click nút "Giao việc"
3. Chọn người được giao việc
4. Điền thông tin:
   - Mô tả công việc
   - Hạn hoàn thành
   - Mức độ ưu tiên
   - Hướng dẫn thực hiện
   - Ghi chú
5. Click "Giao việc"

### 2. Quản lý công việc

Truy cập trang "Quản lý công việc" để:

- Xem danh sách công việc được giao cho mình
- Xem danh sách công việc mình đã giao cho người khác
- Cập nhật trạng thái công việc
- Tìm kiếm và lọc công việc
- Xem thống kê

### 3. Cập nhật trạng thái

Người được giao việc có thể:
- Bắt đầu công việc (PENDING → IN_PROGRESS)
- Hoàn thành công việc (IN_PROGRESS → COMPLETED)

Người giao việc có thể:
- Hủy công việc (→ CANCELLED)

## Quyền hạn

### SYSTEM_ADMIN
- Có thể giao việc cho bất kỳ ai
- Có thể hủy bất kỳ công việc nào

### UNIVERSITY_LEADER
- Có thể giao việc cho DEPARTMENT_STAFF và CLERK
- Có thể hủy công việc mình đã giao

### DEPARTMENT_STAFF
- Có thể giao việc cho CLERK
- Có thể giao việc cho văn bản mình tạo
- Có thể hủy công việc mình đã giao

### CLERK
- Chỉ có thể nhận và thực hiện công việc được giao
- Có thể cập nhật trạng thái công việc của mình

## GraphQL API

### Mutations

```graphql
# Giao việc
mutation AssignTask($assignTaskInput: AssignTaskInput!) {
  assignTask(assignTaskInput: $assignTaskInput) {
    metadata { statusCode message }
    data { id status assignedAt }
  }
}

# Cập nhật trạng thái
mutation UpdateTaskStatus($taskId: Int!, $status: TaskStatus!) {
  updateTaskStatus(taskId: $taskId, status: $status) {
    metadata { statusCode message }
    data { id status updatedAt }
  }
}

# Hủy công việc
mutation CancelTask($taskId: Int!) {
  cancelTask(taskId: $taskId) {
    metadata { statusCode message }
    data { id status updatedAt }
  }
}
```

### Queries

```graphql
# Lấy công việc được giao cho tôi
query GetMyAssignedTasks {
  myAssignedTasks {
    metadata { statusCode message }
    data { id document { title } status assignedAt }
  }
}

# Lấy công việc tôi đã giao
query GetTasksAssignedByMe {
  tasksAssignedByMe {
    metadata { statusCode message }
    data { id document { title } status assignedAt }
  }
}

# Thống kê công việc
query GetTaskStatistics {
  taskStatistics {
    metadata { statusCode message }
    data { total pending inProgress completed cancelled }
  }
}

# Tìm kiếm công việc
query SearchTasks($searchTerm: String, $status: TaskStatus) {
  searchTasks(searchTerm: $searchTerm, status: $status) {
    metadata { statusCode message }
    data { id document { title } status assignedAt }
  }
}
```

## Tính năng nâng cao

### 1. Thông báo
- Thông báo khi có công việc mới được giao
- Thông báo khi deadline sắp đến
- Thông báo khi công việc được hoàn thành

### 2. Báo cáo
- Báo cáo hiệu suất công việc
- Báo cáo công việc quá hạn
- Báo cáo phân bổ công việc

### 3. Tích hợp Workflow
- Tích hợp với workflow approval
- Tự động giao việc theo workflow
- Cập nhật trạng thái document theo task

## Troubleshooting

### Lỗi thường gặp

1. **"You do not have permission to assign this task"**
   - Kiểm tra quyền hạn của user
   - Đảm bảo user có role phù hợp

2. **"Document not found"**
   - Kiểm tra documentId có tồn tại không
   - Đảm bảo user có quyền truy cập document

3. **"User not found"**
   - Kiểm tra assignedToUserId có tồn tại không
   - Đảm bảo user có role phù hợp để được giao việc

### Debug

1. Kiểm tra logs backend:
```bash
cd apps/backend
npm run start:dev
```

2. Kiểm tra logs frontend:
```bash
cd apps/frontend
npm run start
```

3. Kiểm tra GraphQL schema:
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```
