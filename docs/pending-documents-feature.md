# Chức năng Văn bản cần xử lý

## Tổng quan

Chức năng "Văn bản cần xử lý" cho phép văn thư và các role khác xem danh sách các văn bản đang chờ họ xử lý. Chức năng này chỉ hiển thị những văn bản đang ở bước mà người dùng có quyền xử lý.

## Tính năng chính

### 1. Hiển thị văn bản theo role
- **Văn thư (CLERK)**: Xem văn bản cần tạo hoặc chuyển tiếp
- **Trưởng phòng (DEPARTMENT_STAFF)**: Xem văn bản cần phê duyệt
- **Lãnh đạo (UNIVERSITY_LEADER)**: Xem văn bản cần phê duyệt cuối cùng
- **Quản trị viên (SYSTEM_ADMIN)**: Xem tất cả văn bản

### 2. Thông tin hiển thị
- **Loại văn bản**: Template name và mô tả
- **Người tạo**: Tên người tạo văn bản
- **Ngày tạo**: Thời gian tạo văn bản
- **Bước hiện tại**: Bước đang chờ xử lý
- **Độ ưu tiên**: Dựa trên thời gian chờ
- **Ghi chú**: Thông tin bổ sung

### 3. Hành động có thể thực hiện
- **Xử lý ngay**: Chuyển đến trang xử lý workflow
- **Xem chi tiết**: Xem thông tin chi tiết văn bản
- **Click vào card**: Xem tổng quan workflow

## Cấu trúc Component

### 1. PendingDocumentsComponent
```typescript
// Hiển thị danh sách văn bản cần xử lý
@Component({
  selector: 'app-pending-documents',
  template: `
    <div class="pending-documents">
      <!-- Header -->
      <div class="section-header">
        <h3>Văn bản cần xử lý</h3>
        <p>Danh sách văn bản đang chờ bạn xử lý</p>
      </div>

      <!-- Loading state -->
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải danh sách văn bản...</p>
        </div>
      }

      <!-- Documents grid -->
      @else if (pendingDocuments.length > 0) {
        <div class="documents-grid">
          @for (document of pendingDocuments; track document.id) {
            <div class="document-card">
              <!-- Document content -->
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @else {
        <div class="empty-state">
          <p>Không có văn bản nào cần xử lý</p>
        </div>
      }
    </div>
  `
})
```

### 2. WorkflowOverviewComponent
```typescript
// Component tổng hợp với tab navigation
@Component({
  selector: 'app-workflow-overview',
  template: `
    <div class="workflow-overview">
      <!-- Header -->
      <div class="overview-header">
        <h1>Quản lý Quy trình Văn bản</h1>
      </div>

      <!-- Tab navigation -->
      <div class="tab-navigation">
        <button [class.active]="activeTab === 'dashboard'">
          📊 Tổng quan
        </button>
        <button [class.active]="activeTab === 'pending'">
          📄 Văn bản cần xử lý
          @if (pendingCount > 0) {
            <span class="badge">{{ pendingCount }}</span>
          }
        </button>
      </div>

      <!-- Tab content -->
      <div class="tab-content">
        @if (activeTab === 'dashboard') {
          <app-workflow-dashboard></app-workflow-dashboard>
        } @else if (activeTab === 'pending') {
          <app-pending-documents></app-pending-documents>
        }
      </div>
    </div>
  `
})
```

### 3. WorkflowNotificationService
```typescript
// Service quản lý thông báo và auto-refresh
@Injectable({
  providedIn: 'root'
})
export class WorkflowNotificationService {
  private pendingCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<WorkflowNotification[]>([]);

  // Auto-refresh mỗi 30 giây
  private startAutoRefresh(): void {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.loadPendingCount())
      )
      .subscribe();
  }

  // Load số lượng pending documents
  async loadPendingCount(): Promise<void> {
    // Gọi API để lấy pending workflows
  }
}
```

## API Endpoints

### 1. Lấy văn bản cần xử lý
```graphql
query {
  myPendingWorkflows {
    id
    template {
      name
      description
    }
    currentStep {
      name
      description
      assignedRole
    }
    status
    createdByUser {
      fullName
    }
    notes
    createdAt
  }
}
```

### 2. Lấy số lượng pending
```graphql
query {
  myPendingWorkflows {
    id
  }
}
```

## Logic xử lý

### 1. Kiểm tra quyền
```typescript
// Chỉ hiển thị văn bản mà user có quyền xử lý
canViewWorkflow(user: User, instance: WorkflowInstance): boolean {
  // SYSTEM_ADMIN có thể xem tất cả
  if (user.roles.includes(Role.SYSTEM_ADMIN)) {
    return true;
  }

  // User có role phù hợp với step hiện tại có thể xem
  if (instance.currentStep && user.roles.includes(instance.currentStep.assignedRole as Role)) {
    return true;
  }

  return false;
}
```

### 2. Xác định độ ưu tiên
```typescript
getPriorityClass(document: WorkflowInstance): string {
  const createdAt = new Date(document.createdAt);
  const now = new Date();
  const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (diffHours > 48) return 'high';    // Đỏ - Cao
  if (diffHours > 24) return 'medium';  // Cam - Trung bình
  return 'low';                         // Xanh - Thấp
}
```

### 3. Auto-refresh
```typescript
// Tự động refresh mỗi 30 giây
interval(30000).subscribe(() => {
  this.loadPendingDocuments();
});
```

## Giao diện người dùng

### 1. Card văn bản
- **Header**: Loại văn bản và độ ưu tiên
- **Content**: Tiêu đề, mô tả, thông tin meta
- **Actions**: Nút "Xử lý ngay" và "Chi tiết"

### 2. Responsive design
- **Desktop**: Grid layout với nhiều cột
- **Mobile**: Single column layout
- **Tablet**: Adaptive grid

### 3. Loading states
- **Spinner**: Khi đang tải dữ liệu
- **Skeleton**: Placeholder cho content
- **Empty state**: Khi không có dữ liệu

## Thông báo

### 1. Browser notifications
```typescript
// Hiển thị thông báo trình duyệt
private showBrowserNotification(notifications: WorkflowNotification[]): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    notifications.forEach(notification => {
      new Notification('TDMU Dispatch', {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png'
      });
    });
  }
}
```

### 2. In-app notifications
- **Panel thông báo**: Slide-in từ bên phải
- **Badge count**: Hiển thị số lượng thông báo chưa đọc
- **Real-time updates**: Cập nhật tự động

## Cách sử dụng

### 1. Truy cập chức năng
```
/user/workflow → Tab "Văn bản cần xử lý"
```

### 2. Xử lý văn bản
1. Click vào card văn bản hoặc nút "Xử lý ngay"
2. Chuyển đến trang xử lý workflow
3. Thực hiện action phù hợp (APPROVE, REJECT, etc.)
4. Văn bản sẽ được chuyển sang bước tiếp theo

### 3. Quản lý thông báo
1. Click vào icon thông báo để mở panel
2. Xem danh sách thông báo
3. Đánh dấu đã đọc hoặc xóa thông báo
4. Click vào thông báo để chuyển đến văn bản

## Cấu hình

### 1. Refresh interval
```typescript
// Có thể thay đổi thời gian refresh
private refreshInterval = 30000; // 30 giây
```

### 2. Priority thresholds
```typescript
// Có thể điều chỉnh ngưỡng độ ưu tiên
if (diffHours > 48) return 'high';    // 48 giờ
if (diffHours > 24) return 'medium';  // 24 giờ
return 'low';                         // Dưới 24 giờ
```

### 3. Notification settings
```typescript
// Cấu hình thông báo
const notificationConfig = {
  autoRefresh: true,
  browserNotifications: true,
  soundEnabled: false,
  refreshInterval: 30000
};
```

## Troubleshooting

### 1. Không hiển thị văn bản
- Kiểm tra role của user
- Kiểm tra quyền truy cập
- Kiểm tra API response

### 2. Thông báo không hoạt động
- Kiểm tra quyền notification của trình duyệt
- Kiểm tra console errors
- Kiểm tra network connectivity

### 3. Auto-refresh không hoạt động
- Kiểm tra interval configuration
- Kiểm tra subscription lifecycle
- Kiểm tra memory leaks

## Kết luận

Chức năng "Văn bản cần xử lý" cung cấp:
- **Giao diện trực quan** cho việc quản lý workflow
- **Real-time updates** với auto-refresh
- **Thông báo thông minh** cho người dùng
- **Responsive design** cho mọi thiết bị
- **Bảo mật cao** với kiểm tra quyền theo role
