# Workflow Routing Guide

## Tổng quan

Hướng dẫn cấu hình và sử dụng routing cho workflow module trong hệ thống TDMU Dispatch.

## Cấu trúc Routes

### 1. Main App Routes
```typescript
// apps/frontend/src/app/app.routes.ts
export const routes: Routes = [
  { path: 'auth', component: AuthLayout, children: authRoutes },
  {
    path: '', 
    component: MainLayout, 
    canActivate: [AuthGuard], 
    children: USER_ROUTES
  },
  // ...
];
```

### 2. User Routes
```typescript
// apps/frontend/src/app/features/user/user.routes.ts
export const USER_ROUTES: Routes = [
  // ... other routes
  {
    path: 'workflow',
    children: WORKFLOW_ROUTES,
    title: 'Quy trình xử lý'
  },
  // ...
];
```

### 3. Workflow Routes
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
    component: WorkflowActionComponent,
    title: 'Xử lý Workflow'
  },
  {
    path: ':id/process',
    component: WorkflowActionComponent,
    title: 'Xử lý Workflow'
  },
  {
    path: ':id/details',
    component: WorkflowActionComponent,
    title: 'Chi tiết Workflow'
  },
  {
    path: 'notifications',
    component: WorkflowNotificationsComponent,
    title: 'Thông báo'
  }
];
```

## URL Structure

### 1. Workflow Overview
```
/workflow
```
- **Component**: WorkflowOverviewComponent
- **Mô tả**: Trang tổng quan với tab navigation

### 2. Dashboard
```
/workflow/dashboard
```
- **Component**: WorkflowDashboardComponent
- **Mô tả**: Dashboard với thống kê workflow

### 3. Pending Documents
```
/workflow/pending
```
- **Component**: PendingDocumentsComponent
- **Mô tả**: Danh sách văn bản cần xử lý

### 4. Workflow Detail
```
/workflow/:id
```
- **Component**: WorkflowActionComponent
- **Mô tả**: Chi tiết workflow và form xử lý

### 5. Workflow Process
```
/workflow/:id/process
```
- **Component**: WorkflowActionComponent
- **Mô tả**: Form xử lý workflow

### 6. Workflow Details
```
/workflow/:id/details
```
- **Component**: WorkflowActionComponent
- **Mô tả**: Xem chi tiết workflow

### 7. Notifications
```
/workflow/notifications
```
- **Component**: WorkflowNotificationsComponent
- **Mô tả**: Panel thông báo

## Navigation Service

### 1. WorkflowNavigationService
```typescript
@Injectable({
  providedIn: 'root'
})
export class WorkflowNavigationService {
  // Chuyển đến trang tổng quan
  navigateToOverview(): void
  
  // Chuyển đến dashboard
  navigateToDashboard(): void
  
  // Chuyển đến văn bản cần xử lý
  navigateToPendingDocuments(): void
  
  // Chuyển đến xử lý workflow
  navigateToWorkflowProcess(workflowId: number): void
  
  // Chuyển đến chi tiết workflow
  navigateToWorkflowDetails(workflowId: number): void
  
  // Chuyển đến workflow
  navigateToWorkflow(workflowId: number): void
  
  // Chuyển đến thông báo
  navigateToNotifications(): void
  
  // Tạo workflow mới
  navigateToCreateWorkflow(): void
  
  // Quay lại
  goBack(): void
  
  // Trang chủ
  navigateToHome(): void
  
  // Trang tài liệu
  navigateToDocuments(): void
}
```

### 2. Sử dụng Navigation Service
```typescript
@Component({
  // ...
})
export class MyComponent {
  constructor(
    private navigationService: WorkflowNavigationService
  ) {}

  onProcessWorkflow(workflowId: number): void {
    this.navigationService.navigateToWorkflowProcess(workflowId);
  }

  onViewDetails(workflowId: number): void {
    this.navigationService.navigateToWorkflowDetails(workflowId);
  }

  onGoBack(): void {
    this.navigationService.goBack();
  }
}
```

## Breadcrumb Navigation

### 1. WorkflowBreadcrumbComponent
```typescript
@Component({
  selector: 'app-workflow-breadcrumb',
  template: `
    <nav class="breadcrumb-nav">
      <ol class="breadcrumb-list">
        @for (item of breadcrumbs; track item.url) {
          <li class="breadcrumb-item">
            @if (item.active) {
              <span class="breadcrumb-current">{{ item.label }}</span>
            } @else {
              <a [routerLink]="item.url">{{ item.label }}</a>
            }
          </li>
        }
      </ol>
    </nav>
  `
})
```

### 2. Breadcrumb Structure
```
Trang chủ / Quy trình xử lý / Dashboard
Trang chủ / Quy trình xử lý / Văn bản cần xử lý
Trang chủ / Quy trình xử lý / Workflow #123 / Xử lý
Trang chủ / Quy trình xử lý / Workflow #123 / Chi tiết
```

## Route Guards

### 1. AuthGuard
```typescript
// Đảm bảo user đã đăng nhập
canActivate: [AuthGuard]
```

### 2. RoleGuard (Có thể thêm)
```typescript
// Kiểm tra role có quyền truy cập workflow
canActivate: [AuthGuard, RoleGuard]
```

## Route Resolvers

### 1. WorkflowResolver (Có thể thêm)
```typescript
// Load workflow data trước khi component được khởi tạo
resolve: {
  workflow: WorkflowResolver
}
```

## Lazy Loading

### 1. Cấu hình Lazy Loading
```typescript
{
  path: 'workflow',
  loadChildren: () => import('./workflow/workflow.module').then(m => m.WorkflowModule),
  canActivate: [AuthGuard]
}
```

## URL Parameters

### 1. Workflow ID
```typescript
// Lấy workflow ID từ URL
constructor(
  private route: ActivatedRoute
) {}

ngOnInit() {
  this.route.params.subscribe(params => {
    const workflowId = +params['id']; // Convert to number
    this.loadWorkflow(workflowId);
  });
}
```

### 2. Query Parameters
```typescript
// Lấy query parameters
this.route.queryParams.subscribe(params => {
  const tab = params['tab'];
  const filter = params['filter'];
});
```

## Navigation Events

### 1. Router Events
```typescript
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

constructor(private router: Router) {}

ngOnInit() {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    // Handle navigation end
    this.updateActiveTab(event.url);
  });
}
```

### 2. Route Change Detection
```typescript
// Detect route changes
this.router.events.subscribe(event => {
  if (event instanceof NavigationEnd) {
    // Update breadcrumbs
    this.updateBreadcrumbs();
    
    // Update active tab
    this.updateActiveTab();
    
    // Load data if needed
    this.loadDataIfNeeded();
  }
});
```

## Error Handling

### 1. Route Not Found
```typescript
// 404 handling
{
  path: '**',
  component: NotFoundComponent
}
```

### 2. Invalid Workflow ID
```typescript
// Handle invalid workflow ID
ngOnInit() {
  this.route.params.subscribe(params => {
    const workflowId = +params['id'];
    if (isNaN(workflowId) || workflowId <= 0) {
      this.router.navigate(['/workflow']);
      return;
    }
    this.loadWorkflow(workflowId);
  });
}
```

## Best Practices

### 1. Route Organization
- Nhóm routes theo chức năng
- Sử dụng child routes cho sub-navigation
- Đặt tên routes có ý nghĩa

### 2. Navigation Service
- Tập trung logic navigation vào service
- Tránh hardcode URLs trong components
- Sử dụng type-safe navigation methods

### 3. Breadcrumb
- Hiển thị breadcrumb cho tất cả pages
- Cập nhật breadcrumb tự động
- Responsive design cho mobile

### 4. Route Guards
- Bảo vệ routes với guards
- Kiểm tra quyền truy cập
- Redirect nếu không có quyền

### 5. Error Handling
- Handle 404 errors
- Validate route parameters
- Show user-friendly error messages

## Testing

### 1. Route Testing
```typescript
describe('Workflow Routes', () => {
  it('should navigate to workflow overview', () => {
    router.navigate(['/workflow']);
    expect(location.path()).toBe('/workflow');
  });

  it('should navigate to workflow detail', () => {
    router.navigate(['/workflow', '123']);
    expect(location.path()).toBe('/workflow/123');
  });
});
```

### 2. Navigation Service Testing
```typescript
describe('WorkflowNavigationService', () => {
  it('should navigate to workflow process', () => {
    service.navigateToWorkflowProcess(123);
    expect(router.navigate).toHaveBeenCalledWith(['/workflow', 123, 'process']);
  });
});
```

## Kết luận

Routing system cho workflow module cung cấp:
- **Cấu trúc URL rõ ràng** và có ý nghĩa
- **Navigation service** tập trung và type-safe
- **Breadcrumb navigation** tự động
- **Route guards** bảo mật
- **Error handling** tốt
- **Testing** dễ dàng
