# Workflow Main Layout Integration

## Tổng quan

Hướng dẫn tích hợp hệ thống workflow vào main layout và đặt làm trang dashboard mặc định.

## Các thay đổi đã thực hiện

### 1. Main Layout Component

#### Cập nhật TypeScript
**File**: `apps/frontend/src/app/layouts/main-layout/main-layout.ts`

```typescript
import { WorkflowApolloService } from '../../features/user/workflow/services/workflow-apollo.service';

export class MainLayout implements OnInit, OnDestroy {
  // ... existing properties
  pendingWorkflowCount = 0;
  
  constructor(
    // ... existing dependencies
    private workflowApolloService: WorkflowApolloService
  ) {
    // ... existing constructor logic
  }

  ngOnInit(): void {
    this.loadPendingWorkflowCount();
    
    // Auto-refresh pending workflow count every 30 seconds
    setInterval(() => {
      this.loadPendingWorkflowCount();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadPendingWorkflowCount(): void {
    this.subscriptions.add(
      this.workflowApolloService.getMyPendingWorkflows().subscribe({
        next: (workflows) => {
          this.pendingWorkflowCount = workflows.length;
        },
        error: (error) => {
          console.error('Error loading pending workflows:', error);
          this.pendingWorkflowCount = 0;
        }
      })
    );
  }

  refreshPendingWorkflowCount(): void {
    this.loadPendingWorkflowCount();
  }
}
```

#### Cập nhật HTML Template
**File**: `apps/frontend/src/app/layouts/main-layout/main-layout.html`

```html
<div class="sidebar__menu-item" routerLink="/workflow" routerLinkActive="active" (click)="refreshPendingWorkflowCount()">
  <img src="/icons/conversion_path.svg" alt="" title="Quy trình xử lý">
  <span class="sidebar__tooltip">Quy trình xử lý</span>
  @if (pendingWorkflowCount > 0) {
    <span class="notification-badge">{{ pendingWorkflowCount }}</span>
  }
</div>
```

#### Cập nhật CSS
**File**: `apps/frontend/src/app/layouts/main-layout/main-layout.css`

```css
/* Menu item với position relative */
.sidebar__menu-item {
  /* ... existing styles */
  position: relative;
}

/* Notification badge */
.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

### 2. Routing Configuration

#### Cập nhật User Routes
**File**: `apps/frontend/src/app/features/user/user.routes.ts`

```typescript
export const USER_ROUTES: Routes = [
  // ... existing routes
  {
    path: 'workflow',
    children: WORKFLOW_ROUTES,
    title: 'Quy trình xử lý'
  },
  {
    path: '',
    redirectTo: 'workflow',  // Thay đổi từ 'all-documents' thành 'workflow'
    pathMatch: 'full'
  }
];
```

## Tính năng mới

### 1. Notification Badge
- **Hiển thị số lượng**: Số văn bản cần xử lý
- **Vị trí**: Góc trên bên phải của menu item
- **Màu sắc**: Đỏ (#ef4444) để thu hút sự chú ý
- **Animation**: Box shadow để tạo độ nổi

### 2. Auto-refresh
- **Tần suất**: Mỗi 30 giây
- **Manual refresh**: Khi click vào menu item
- **Error handling**: Reset về 0 nếu có lỗi

### 3. Dashboard Default
- **Redirect**: Tự động chuyển đến `/workflow` khi vào hệ thống
- **User experience**: Người dùng thấy ngay văn bản cần xử lý

## URL Structure

### Trước khi thay đổi
```
/ → /all-documents
/workflow → /workflow (nếu truy cập trực tiếp)
```

### Sau khi thay đổi
```
/ → /workflow (redirect mặc định)
/workflow → /workflow (trang tổng quan workflow)
/workflow/pending → Văn bản cần xử lý
/workflow/123/process → Xử lý workflow #123
```

## User Experience

### 1. Khi đăng nhập
1. User được chuyển đến `/workflow`
2. Thấy tổng quan workflow với tabs
3. Có thể chuyển đến "Văn bản cần xử lý"

### 2. Notification Badge
1. Hiển thị số lượng văn bản cần xử lý
2. Auto-refresh mỗi 30 giây
3. Click để refresh ngay lập tức

### 3. Navigation
1. Menu item "Quy trình xử lý" có badge
2. Click để chuyển đến workflow
3. Badge được refresh khi click

## Performance Considerations

### 1. Auto-refresh
- **Interval**: 30 giây (có thể điều chỉnh)
- **Memory leak**: Sử dụng `ngOnDestroy` để cleanup
- **Network**: Chỉ load khi cần thiết

### 2. Caching
- **Apollo Client**: Tự động cache GraphQL queries
- **Optimistic updates**: Better UX
- **Error handling**: Graceful degradation

### 3. Bundle Size
- **Lazy loading**: Workflow module được load khi cần
- **Tree shaking**: Chỉ import những gì cần thiết
- **Code splitting**: Tách biệt workflow code

## Testing

### 1. Unit Tests
```typescript
describe('MainLayout', () => {
  it('should load pending workflow count on init', () => {
    component.ngOnInit();
    expect(service.getMyPendingWorkflows).toHaveBeenCalled();
  });

  it('should refresh count when workflow menu is clicked', () => {
    component.refreshPendingWorkflowCount();
    expect(service.getMyPendingWorkflows).toHaveBeenCalled();
  });
});
```

### 2. Integration Tests
```typescript
describe('Workflow Integration', () => {
  it('should redirect to workflow on root path', () => {
    cy.visit('/');
    cy.url().should('include', '/workflow');
  });

  it('should show notification badge with count', () => {
    cy.visit('/workflow');
    cy.get('.notification-badge').should('be.visible');
  });
});
```

## Monitoring

### 1. Performance Metrics
- **Load time**: Thời gian load workflow page
- **API calls**: Số lượng GraphQL queries
- **User engagement**: Thời gian sử dụng workflow

### 2. Error Tracking
- **GraphQL errors**: Log errors từ Apollo Client
- **Network errors**: Handle offline scenarios
- **User feedback**: Collect user experience data

### 3. Business Metrics
- **Workflow completion rate**: Tỷ lệ hoàn thành
- **Processing time**: Thời gian xử lý trung bình
- **User satisfaction**: Feedback từ người dùng

## Future Enhancements

### 1. Real-time Updates
- **WebSocket**: Thay thế polling bằng WebSocket
- **Push notifications**: Browser push notifications
- **Live updates**: Real-time UI updates

### 2. Advanced Notifications
- **Sound alerts**: Audio notifications
- **Desktop notifications**: Native OS notifications
- **Email notifications**: Backup notification method

### 3. Smart Routing
- **Role-based routing**: Redirect theo role
- **Context-aware**: Remember user preferences
- **Progressive enhancement**: Better UX for power users

## Kết luận

Việc tích hợp workflow vào main layout đã hoàn thành với:

✅ **Notification badge** hiển thị số văn bản cần xử lý
✅ **Auto-refresh** mỗi 30 giây
✅ **Dashboard default** redirect đến workflow
✅ **User-friendly navigation** với visual feedback
✅ **Performance optimization** với caching và lazy loading
✅ **Error handling** robust

Hệ thống workflow giờ đây là trung tâm của ứng dụng và cung cấp trải nghiệm người dùng tốt hơn!
