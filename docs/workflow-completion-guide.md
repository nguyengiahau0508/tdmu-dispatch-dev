# Workflow Completion Guide

## Tổng quan

Hướng dẫn hoàn thiện hệ thống workflow với Apollo Client và GraphQL cho TDMU Dispatch.

## Các thành phần đã hoàn thiện

### 1. Backend GraphQL

#### Workflow Permissions
- **DTOs**: `WorkflowPermissionDto`, `WorkflowViewPermissionDto`, `AvailableActionsDto`
- **Resolver**: `WorkflowPermissionsResolver` với các queries:
  - `checkWorkflowPermission`
  - `checkWorkflowViewPermission`
  - `workflowRoles`
  - `workflowActionTypes`

#### Workflow Instances
- **Service**: `WorkflowInstancesService` với relations đầy đủ
- **Resolver**: Các queries và mutations cho workflow instances
- **Entity**: `WorkflowActionLog` với nullable `actionByUser`

### 2. Frontend Apollo Client

#### Services
- **WorkflowApolloService**: GraphQL operations với Apollo Client
- **WorkflowNavigationService**: Navigation management
- **WorkflowNotificationService**: Real-time notifications

#### Components
- **WorkflowOverviewComponent**: Tab navigation tổng quan
- **PendingDocumentsComponent**: Văn bản cần xử lý
- **WorkflowActionComponent**: Form thực hiện action
- **WorkflowInstanceDetailComponent**: Chi tiết workflow
- **WorkflowBreadcrumbComponent**: Breadcrumb navigation
- **WorkflowProcessPageComponent**: Trang xử lý workflow
- **WorkflowDetailPageComponent**: Trang chi tiết workflow

#### Models
- **WorkflowInstance**: Interface cho workflow instance
- **WorkflowActionInput**: Interface cho action input
- **WorkflowActionLog**: Interface với nullable actionByUser

### 3. Routing

#### URL Structure
```
/workflow                    # Trang tổng quan
/workflow/dashboard         # Dashboard
/workflow/pending           # Văn bản cần xử lý
/workflow/123              # Chi tiết workflow #123
/workflow/123/process      # Xử lý workflow #123
/workflow/123/details      # Chi tiết workflow #123
/workflow/notifications    # Thông báo
```

#### Route Configuration
```typescript
// apps/frontend/src/app/features/user/workflow/workflow.routes.ts
export const WORKFLOW_ROUTES: Routes = [
  {
    path: '',
    component: WorkflowOverviewComponent,
    title: 'Quản lý Quy trình Văn bản'
  },
  {
    path: 'dashboard',
    component: WorkflowDashboardComponent,
    title: 'Dashboard Quy trình'
  },
  {
    path: 'pending',
    component: PendingDocumentsComponent,
    title: 'Văn bản cần xử lý'
  },
  {
    path: ':id',
    component: WorkflowDetailPageComponent,
    title: 'Chi tiết Workflow'
  },
  {
    path: ':id/process',
    component: WorkflowProcessPageComponent,
    title: 'Xử lý Workflow'
  },
  {
    path: ':id/details',
    component: WorkflowDetailPageComponent,
    title: 'Chi tiết Workflow'
  },
  {
    path: 'notifications',
    component: WorkflowNotificationsComponent,
    title: 'Thông báo'
  }
];
```

## Tính năng chính

### 1. Role-Based Access Control
- **CLERK**: Văn bản cần tạo/chuyển tiếp
- **DEPARTMENT_STAFF**: Văn bản cần phê duyệt
- **UNIVERSITY_LEADER**: Văn bản cần phê duyệt cuối cùng
- **SYSTEM_ADMIN**: Tất cả văn bản

### 2. Real-time Notifications
- **Auto-refresh**: Mỗi 30 giây
- **Browser notifications**: Desktop notifications
- **In-app notifications**: Panel slide-in
- **Badge count**: Số lượng pending

### 3. Workflow Actions
- **APPROVE**: Phê duyệt
- **REJECT**: Từ chối
- **TRANSFER**: Chuyển tiếp
- **CANCEL**: Hủy bỏ
- **START**: Bắt đầu
- **COMPLETE**: Hoàn thành

### 4. Navigation
- **Breadcrumb**: Hiển thị vị trí hiện tại
- **Tab navigation**: Chuyển đổi giữa các view
- **Action buttons**: Xử lý ngay, Chi tiết, Quay lại

## Cách sử dụng

### 1. Truy cập Workflow
```
http://localhost:4200/workflow
```

### 2. Xem văn bản cần xử lý
```
http://localhost:4200/workflow/pending
```

### 3. Xử lý workflow
```
http://localhost:4200/workflow/123/process
```

### 4. Xem chi tiết workflow
```
http://localhost:4200/workflow/123/details
```

## GraphQL Queries

### 1. Lấy văn bản cần xử lý
```graphql
query GetMyPendingWorkflows {
  myPendingWorkflows {
    id
    template {
      name
      description
    }
    currentStep {
      name
      assignedRole
    }
    createdByUser {
      fullName
    }
    createdAt
    status
  }
}
```

### 2. Thực hiện action
```graphql
mutation ExecuteWorkflowAction($input: WorkflowActionInput!) {
  executeWorkflowAction(workflowActionInput: $input) {
    id
    status
    currentStep {
      name
      assignedRole
    }
  }
}
```

### 3. Kiểm tra quyền
```graphql
query CheckWorkflowPermission($input: CheckWorkflowPermissionInput!) {
  checkWorkflowPermission(input: $input) {
    canPerform
    reason
  }
}
```

## Error Handling

### 1. GraphQL Errors
- **Nullable fields**: Handle null values gracefully
- **Network errors**: User-friendly error messages
- **Permission errors**: Clear feedback về quyền

### 2. Loading States
- **Spinner**: Hiển thị khi đang tải
- **Skeleton**: Placeholder cho content
- **Disabled buttons**: Prevent multiple submissions

### 3. Validation
- **Form validation**: Required fields
- **Business rules**: Role-based permissions
- **Data integrity**: Foreign key constraints

## Performance Optimization

### 1. Apollo Client
- **Caching**: Automatic cache management
- **Optimistic updates**: Better UX
- **Query batching**: Reduce network requests

### 2. Lazy Loading
- **Route-based**: Load components on demand
- **Code splitting**: Reduce bundle size
- **Preloading**: Smart preloading strategies

### 3. Real-time Updates
- **Polling**: Auto-refresh every 30 seconds
- **WebSocket**: Future implementation
- **Cache invalidation**: Smart cache updates

## Testing

### 1. Unit Tests
```typescript
describe('WorkflowApolloService', () => {
  it('should get pending workflows', () => {
    service.getMyPendingWorkflows().subscribe(result => {
      expect(result).toBeDefined();
    });
  });
});
```

### 2. Integration Tests
```typescript
describe('PendingDocumentsComponent', () => {
  it('should load pending documents on init', () => {
    component.ngOnInit();
    expect(service.getMyPendingWorkflows).toHaveBeenCalled();
  });
});
```

### 3. E2E Tests
```typescript
describe('Workflow E2E', () => {
  it('should process workflow', () => {
    cy.visit('/workflow/pending');
    cy.get('[data-testid="process-button"]').first().click();
    cy.get('[data-testid="action-form"]').should('be.visible');
  });
});
```

## Monitoring

### 1. Error Tracking
- **Console logs**: Development debugging
- **Error boundaries**: React error handling
- **APM tools**: Production monitoring

### 2. Performance Monitoring
- **Bundle size**: Track bundle growth
- **Load times**: Monitor page performance
- **User interactions**: Track user behavior

### 3. Business Metrics
- **Workflow completion rate**: Success metrics
- **Processing time**: Efficiency metrics
- **User satisfaction**: Feedback collection

## Deployment

### 1. Build Process
```bash
# Frontend
npm run build

# Backend
npm run build
```

### 2. Environment Configuration
```typescript
// environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/graphql'
};
```

### 3. Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./apps/frontend
    ports:
      - "4200:80"
  
  backend:
    build: ./apps/backend
    ports:
      - "3000:3000"
```

## Kết luận

Hệ thống workflow đã được hoàn thiện với:

✅ **Backend GraphQL** với permissions và validation
✅ **Frontend Apollo Client** với real-time updates
✅ **Role-based access control** theo yêu cầu
✅ **Navigation system** hoàn chỉnh
✅ **Error handling** robust
✅ **Performance optimization** tốt
✅ **Documentation** đầy đủ

Hệ thống sẵn sàng cho production use!
