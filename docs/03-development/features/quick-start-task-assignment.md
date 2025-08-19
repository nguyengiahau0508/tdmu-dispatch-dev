# Hướng dẫn Sử dụng Nhanh - Chức năng Giao việc

## 🚀 Khởi động nhanh

### 1. Chạy Migration Database
```sql
-- Copy và chạy trong MySQL
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

## 📋 Sử dụng Components

### 1. Thêm Button Giao việc vào Document Detail

```typescript
// Trong document-detail.component.ts
import { TaskAssignmentButtonComponent } from '../task-assignment/task-assignment-button.component';

// Thêm vào template
<app-task-assignment-button 
  [documentId]="document.id"
  [documentTitle]="document.title"
  (assignTaskClicked)="openAssignTaskModal()">
</app-task-assignment-button>
```

### 2. Thêm Modal Giao việc

```typescript
// Trong component
import { SimpleTaskAssignmentModalComponent } from '../task-assignment/simple-task-assignment-modal.component';

showAssignTaskModal = false;

openAssignTaskModal() {
  this.showAssignTaskModal = true;
}

closeAssignTaskModal() {
  this.showAssignTaskModal = false;
}

onTaskAssigned(result: any) {
  if (result.success) {
    alert(result.message);
    this.closeAssignTaskModal();
  } else {
    alert('Lỗi: ' + result.message);
  }
}

// Trong template
<app-simple-task-assignment-modal
  *ngIf="showAssignTaskModal"
  [documentId]="document.id"
  [documentTitle]="document.title"
  (closeModal)="closeAssignTaskModal()"
  (taskAssigned)="onTaskAssigned($event)">
</app-simple-task-assignment-modal>
```

### 3. Thêm Trang Quản lý Công việc

```typescript
// Trong routing
{
  path: 'task-management',
  component: TaskManagementComponent
}

// Trong menu
<a routerLink="/task-management">Quản lý công việc</a>
```

## 🔧 API Endpoints

### GraphQL Mutations
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
```

### GraphQL Queries
```graphql
# Lấy công việc được giao cho tôi
query GetMyAssignedTasks {
  myAssignedTasks {
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
```

## 🎯 Quyền hạn

- **SYSTEM_ADMIN**: Giao việc cho tất cả
- **UNIVERSITY_LEADER**: Giao việc cho DEPARTMENT_STAFF và CLERK
- **DEPARTMENT_STAFF**: Giao việc cho CLERK
- **CLERK**: Chỉ nhận và thực hiện công việc

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **"Cannot find module"**
   - Kiểm tra đường dẫn import
   - Đảm bảo component được import đúng

2. **"Object is of type 'unknown'"**
   - Thêm type annotation cho variables
   - Sử dụng type assertion khi cần thiết

3. **"You do not have permission"**
   - Kiểm tra role của user
   - Đảm bảo user có quyền giao việc

### Debug:
```bash
# Backend logs
cd apps/backend && npm run start:dev

# Frontend logs  
cd apps/frontend && npm run start

# Check GraphQL schema
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

## 📝 Ví dụ Sử dụng

### 1. Giao việc cho nhân viên
1. Mở văn bản cần giao việc
2. Click "Giao việc"
3. Chọn nhân viên từ dropdown
4. Điền mô tả công việc
5. Set deadline
6. Click "Giao việc"

### 2. Theo dõi tiến độ
1. Vào "Quản lý công việc"
2. Xem danh sách công việc được giao
3. Cập nhật trạng thái: PENDING → IN_PROGRESS → COMPLETED

### 3. Thống kê
- Xem số lượng công việc theo trạng thái
- Theo dõi deadline và công việc quá hạn
- Báo cáo hiệu suất

## 🎨 Customization

### Thay đổi màu sắc
```css
.status-pending { background: #fff3cd; color: #856404; }
.status-in_progress { background: #d1ecf1; color: #0c5460; }
.status-completed { background: #d4edda; color: #155724; }
.status-cancelled { background: #f8d7da; color: #721c24; }
```

### Thêm validation
```typescript
// Trong task-assignment-modal.component.ts
this.taskForm = this.fb.group({
  assignedToUserId: ['', Validators.required],
  taskDescription: ['', Validators.minLength(10)],
  deadline: ['', Validators.required],
  // ...
});
```

### Thêm notification
```typescript
// Sử dụng toast hoặc alert
onTaskAssigned(result: any) {
  if (result.success) {
    this.toast.success(result.message);
  } else {
    this.toast.error(result.message);
  }
}
```
