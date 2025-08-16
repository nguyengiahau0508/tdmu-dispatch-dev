# Workflow Module

Module quản lý quy trình xử lý văn bản theo vai trò (role-based workflow management).

## Tổng quan

Workflow module cung cấp các chức năng để quản lý quy trình xử lý văn bản trong hệ thống TDMU Dispatch. Mỗi người dùng chỉ có thể thực hiện các hành động phù hợp với vai trò của mình.

## Cấu trúc thư mục

```
workflow/
├── components/
│   ├── workflow-dashboard/          # Dashboard tổng quan
│   ├── pending-documents/           # Văn bản cần xử lý
│   ├── workflow-overview/           # Component tổng hợp
│   ├── workflow-action/             # Form thực hiện action
│   └── workflow-notifications/      # Panel thông báo
├── services/
│   ├── workflow-instances.service.ts    # API calls
│   └── workflow-notification.service.ts # Thông báo & auto-refresh
├── models/
│   ├── workflow-instance.model.ts       # Interface cho workflow instance
│   └── workflow-action-input.model.ts   # Interface cho action input
└── index.ts                            # Export tất cả
```

## Components

### 1. WorkflowDashboardComponent
- **Mục đích**: Hiển thị dashboard tổng quan với thống kê
- **Tính năng**: 
  - Thống kê workflow (chờ xử lý, của tôi, đã hoàn thành)
  - Danh sách workflow cần xử lý
  - Danh sách workflow của user

### 2. PendingDocumentsComponent
- **Mục đích**: Hiển thị văn bản cần xử lý theo role
- **Tính năng**:
  - Chỉ hiển thị văn bản đang ở bước của user
  - Phân loại độ ưu tiên (cao, trung bình, thấp)
  - Actions: Xử lý ngay, Xem chi tiết

### 3. WorkflowOverviewComponent
- **Mục đích**: Component tổng hợp với tab navigation
- **Tính năng**:
  - Tab "Tổng quan" và "Văn bản cần xử lý"
  - Badge hiển thị số lượng pending
  - Responsive design

### 4. WorkflowActionComponent
- **Mục đích**: Form để thực hiện action trên workflow
- **Tính năng**:
  - Hiển thị bước hiện tại
  - Danh sách actions có thể thực hiện
  - Form nhập ghi chú

### 5. WorkflowNotificationsComponent
- **Mục đích**: Panel thông báo slide-in
- **Tính năng**:
  - Danh sách thông báo
  - Đánh dấu đã đọc
  - Click để chuyển đến workflow

## Services

### 1. WorkflowInstancesService
```typescript
// API calls cho workflow instances
export class WorkflowInstancesService {
  // Lấy workflow instances của user
  getMyWorkflowInstances(): Observable<WorkflowInstance[]>
  
  // Lấy văn bản cần xử lý
  getMyPendingWorkflows(): Observable<WorkflowInstance[]>
  
  // Thực hiện action
  executeWorkflowAction(actionInput: WorkflowActionInput): Observable<WorkflowInstance>
  
  // Lấy actions có thể thực hiện
  getAvailableActions(instanceId: number): Observable<string[]>
}
```

### 2. WorkflowNotificationService
```typescript
// Quản lý thông báo và auto-refresh
export class WorkflowNotificationService {
  // Auto-refresh mỗi 30 giây
  private startAutoRefresh(): void
  
  // Browser notifications
  private showBrowserNotification(notifications: WorkflowNotification[]): void
  
  // Quản lý thông báo
  markAsRead(notificationId: number): void
  markAllAsRead(): void
  removeNotification(notificationId: number): void
}
```

## Models

### 1. WorkflowInstance
```typescript
export interface WorkflowInstance {
  id: number;
  templateId: number;
  template: {
    id: number;
    name: string;
    description?: string;
  };
  currentStep?: {
    id: number;
    name: string;
    description?: string;
    type: string;
    assignedRole: string;
    orderNumber: number;
  };
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  createdByUser: {
    id: number;
    fullName: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  logs: WorkflowActionLog[];
}
```

### 2. WorkflowActionInput
```typescript
export interface WorkflowActionInput {
  instanceId: number;
  stepId: number;
  actionType: 'APPROVE' | 'REJECT' | 'TRANSFER' | 'CANCEL' | 'START' | 'COMPLETE';
  note?: string;
  metadata?: string;
}
```

## Cách sử dụng

### 1. Import module
```typescript
import { 
  WorkflowOverviewComponent,
  WorkflowInstancesService,
  WorkflowNotificationService 
} from './workflow';
```

### 2. Sử dụng trong component
```typescript
@Component({
  selector: 'app-my-component',
  template: `
    <app-workflow-overview></app-workflow-overview>
  `
})
export class MyComponent {
  constructor(
    private workflowService: WorkflowInstancesService,
    private notificationService: WorkflowNotificationService
  ) {}
}
```

### 3. Subscribe to notifications
```typescript
ngOnInit() {
  this.notificationService.pendingCount$.subscribe(count => {
    this.pendingCount = count;
  });
}
```

## Quyền theo Role

### CLERK (Văn thư)
- Xem văn bản cần tạo hoặc chuyển tiếp
- Thực hiện actions: START, TRANSFER, COMPLETE

### DEPARTMENT_STAFF (Chuyên viên)
- Xem văn bản cần phê duyệt
- Thực hiện actions: APPROVE, REJECT, TRANSFER

### UNIVERSITY_LEADER (Lãnh đạo)
- Xem văn bản cần phê duyệt cuối cùng
- Thực hiện actions: APPROVE, REJECT, COMPLETE

### SYSTEM_ADMIN (Quản trị viên)
- Xem tất cả văn bản
- Thực hiện tất cả actions

## API Endpoints

### Queries
- `myWorkflowInstances`: Lấy workflow của user
- `myPendingWorkflows`: Lấy văn bản cần xử lý
- `availableActions`: Lấy actions có thể thực hiện

### Mutations
- `executeWorkflowAction`: Thực hiện action
- `createWorkflowInstance`: Tạo workflow mới

## Tính năng nâng cao

### 1. Auto-refresh
- Tự động cập nhật mỗi 30 giây
- Có thể cấu hình thời gian refresh

### 2. Real-time notifications
- Browser notifications
- In-app notifications
- Badge count

### 3. Priority system
- Phân loại độ ưu tiên dựa trên thời gian chờ
- Color coding: đỏ (cao), cam (trung bình), xanh (thấp)

### 4. Responsive design
- Desktop: Grid layout
- Mobile: Single column
- Tablet: Adaptive grid

## Troubleshooting

### 1. Không hiển thị văn bản
- Kiểm tra role của user
- Kiểm tra API response
- Kiểm tra console errors

### 2. Thông báo không hoạt động
- Kiểm tra quyền notification
- Kiểm tra browser support
- Kiểm tra network connectivity

### 3. Auto-refresh không hoạt động
- Kiểm tra interval configuration
- Kiểm tra subscription lifecycle
- Kiểm tra memory leaks

## Cấu hình

### 1. Environment variables
```typescript
// apps/frontend/src/environments/environment.ts
export const environment = {
  apiBaseUrl: 'http://localhost:3000',
  // ...
};
```

### 2. Notification settings
```typescript
// Có thể cấu hình trong service
private refreshInterval = 30000; // 30 giây
```

## Kết luận

Workflow module cung cấp một hệ thống hoàn chỉnh để quản lý quy trình xử lý văn bản với:
- **Bảo mật cao** theo role
- **Giao diện thân thiện** và responsive
- **Real-time updates** với auto-refresh
- **Thông báo thông minh** cho người dùng
- **Dễ dàng mở rộng** và tùy chỉnh
