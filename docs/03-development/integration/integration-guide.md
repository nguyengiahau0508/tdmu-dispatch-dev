# Hướng dẫn Tích hợp Task Assignment

## 🎯 Tình trạng hiện tại

✅ **Backend**: Đang chạy tại `http://localhost:3000/graphql`  
✅ **Frontend**: Đang chạy tại `http://localhost:4200`  
✅ **Database**: Bảng `task_assignment` đã được tạo  
✅ **GraphQL Schema**: TaskStatus enum đã được load  

## 🚀 Tích hợp vào ứng dụng

### 1. Thêm Button Giao việc vào Document Detail

**File**: `apps/frontend/src/app/features/user/document-processing/document-details.component.ts`

```typescript
// Import component
import { TaskAssignmentButtonComponent } from '../../task-assignment/task-assignment-button.component';

// Thêm vào component
export class DocumentDetailsComponent {
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
}
```

**Template**: `document-details.component.html`

```html
<!-- Thêm button giao việc -->
<div class="action-buttons">
  <app-task-assignment-button 
    [documentId]="document.id"
    [documentTitle]="document.title"
    (assignTaskClicked)="openAssignTaskModal()">
  </app-task-assignment-button>
</div>

<!-- Thêm modal giao việc -->
<app-simple-task-assignment-modal
  *ngIf="showAssignTaskModal"
  [documentId]="document.id"
  [documentTitle]="document.title"
  (closeModal)="closeAssignTaskModal()"
  (taskAssigned)="onTaskAssigned($event)">
</app-simple-task-assignment-modal>
```

### 2. Thêm Menu Quản lý Công việc

**File**: `apps/frontend/src/app/layouts/main-layout/main-layout.component.html`

```html
<!-- Thêm vào navigation menu -->
<li class="nav-item">
  <a class="nav-link" routerLink="/task-management" routerLinkActive="active">
    <i class="fas fa-tasks"></i>
    Quản lý công việc
  </a>
</li>
```

### 3. Thêm Route

**File**: `apps/frontend/src/app/app.routes.ts`

```typescript
import { TaskManagementComponent } from './features/user/task-assignment/task-management.component';

export const routes: Routes = [
  // ... existing routes
  {
    path: 'task-management',
    component: TaskManagementComponent,
    canActivate: [AuthGuard]
  }
];
```

### 4. Import Components

**File**: `apps/frontend/src/app/app.config.ts`

```typescript
import { TaskAssignmentButtonComponent } from './features/user/task-assignment/task-assignment-button.component';
import { SimpleTaskAssignmentModalComponent } from './features/user/task-assignment/simple-task-assignment-modal.component';
import { TaskManagementComponent } from './features/user/task-assignment/task-management.component';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    importProvidersFrom(
      // ... existing imports
      TaskAssignmentButtonComponent,
      SimpleTaskAssignmentModalComponent,
      TaskManagementComponent
    )
  ]
};
```

## 🧪 Test chức năng

### 1. Test GraphQL API

```bash
# Test TaskStatus enum
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"TaskStatus\") { enumValues { name } } }"}'

# Test assignTask mutation
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { assignTask(assignTaskInput: { documentId: 1, assignedToUserId: 2, taskDescription: \"Test task\" }) { metadata { statusCode message } data { id status } } }"}'
```

### 2. Test Frontend

1. Mở `http://localhost:4200`
2. Đăng nhập với user có quyền giao việc
3. Mở một document
4. Click "Giao việc"
5. Điền form và submit
6. Kiểm tra trang "Quản lý công việc"

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **"Cannot find module"**
   ```bash
   # Kiểm tra import paths
   # Đảm bảo components được import đúng
   ```

2. **"GraphQL error"**
   ```bash
   # Kiểm tra backend logs
   # Đảm bảo GraphQL schema đã load
   ```

3. **"Permission denied"**
   ```bash
   # Kiểm tra user roles
   # Đảm bảo user có quyền giao việc
   ```

### Debug Commands:

```bash
# Backend logs
cd apps/backend && npm run start:dev

# Frontend logs
cd apps/frontend && npm run start

# Check GraphQL schema
curl -s http://localhost:3000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | grep -i task
```

## 📋 Checklist Tích hợp

- [ ] Import TaskAssignmentButtonComponent
- [ ] Import SimpleTaskAssignmentModalComponent  
- [ ] Import TaskManagementComponent
- [ ] Thêm button vào document detail
- [ ] Thêm modal vào document detail
- [ ] Thêm route cho task management
- [ ] Thêm menu item
- [ ] Test GraphQL API
- [ ] Test frontend functionality
- [ ] Test permissions

## 🎉 Hoàn thành!

Sau khi hoàn thành checklist, chức năng giao việc sẽ hoạt động đầy đủ:

- ✅ Giao việc cho nhân viên
- ✅ Theo dõi tiến độ công việc
- ✅ Cập nhật trạng thái
- ✅ Thống kê công việc
- ✅ Quản lý deadline
- ✅ Phân quyền theo role

