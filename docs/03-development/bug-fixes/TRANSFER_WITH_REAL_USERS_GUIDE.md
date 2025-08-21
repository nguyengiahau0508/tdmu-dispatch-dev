# Hướng dẫn Test Transfer với Users Thực tế

## 🎯 Mục tiêu
Test chức năng transfer văn bản với danh sách users thực tế từ hệ thống thay vì mock data.

## ✅ Thay đổi đã thực hiện

### 1. **Cập nhật UsersService**
**File:** `apps/frontend/src/app/core/services/users.service.ts`

Thêm method `getAllUsers()` để lấy tất cả users từ backend:
```typescript
getAllUsers(): Observable<IUser[]> {
  return this.apollo.query<{
    users: IUser[]
  }>({
    query: gql`
      query GetAllUsers {
        users {
          id
          fullName
          email
          roles
          isActive
        }
      }
    `,
    fetchPolicy: 'network-only'
  }).pipe(
    map(result => result.data.users)
  );
}
```

### 2. **Cập nhật DocumentActionDialogComponent**
**File:** `apps/frontend/src/app/features/user/document-processing/document-action-dialog.component.ts`

- Thay thế mock data bằng users thực tế
- Thêm loading state
- Implement lifecycle methods để load users

```typescript
export class DocumentActionDialogComponent implements OnInit, OnDestroy {
  // Users thực tế từ hệ thống
  availableUsers: IUser[] = [];
  isLoadingUsers = false;
  private destroy$ = new Subject<void>();

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadAvailableUsers();
  }

  private loadAvailableUsers(): void {
    this.isLoadingUsers = true;
    this.usersService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          // Lọc chỉ những user active
          this.availableUsers = users.filter(user => user.isActive);
          this.isLoadingUsers = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoadingUsers = false;
        }
      });
  }
}
```

### 3. **Cập nhật Template**
Thêm loading state và sử dụng `fullName`:
```html
<select 
  id="transferUser"
  class="form-select" 
  [(ngModel)]="selectedTransferUserId"
  [disabled]="isLoadingUsers">
  <option value="">-- Chọn người dùng --</option>
  <option *ngIf="isLoadingUsers" value="" disabled>Đang tải danh sách người dùng...</option>
  <option *ngFor="let user of availableUsers" [value]="user.id">
    {{ user.fullName }} ({{ user.email }})
  </option>
</select>
<div *ngIf="isLoadingUsers" class="loading-indicator">
  <span class="loading-spinner">⏳</span> Đang tải danh sách người dùng...
</div>
```

## 🧪 Test Steps

### **Bước 1: Kiểm tra Users trong Database**
```sql
-- Kiểm tra users có sẵn
SELECT id, firstName, lastName, email, isActive FROM user WHERE isActive = 1;

-- Kết quả mong đợi:
-- ID 1: Admin System (admin@tdmu.edu.vn)
-- ID 2: Nguyễn Văn Hiệu Trưởng (hieutruong@tdmu.edu.vn)
-- ID 3: Trần Thị Phó Hiệu Trưởng (phohieutruong@tdmu.edu.vn)
-- ID 4: Lê Văn Đào Tạo (daotao@tdmu.edu.vn)
-- ID 5: Phạm Thị Tài Chính (taichinh@tdmu.edu.vn)
```

### **Bước 2: Test trong Frontend**
1. **Mở browser**: `http://localhost:4200`
2. **Đăng nhập**: Với tài khoản có quyền transfer
3. **Vào Document Processing**: Tìm document để transfer
4. **Click Transfer**: Mở dialog transfer
5. **Kiểm tra danh sách users**:
   - ✅ Hiển thị "Đang tải danh sách người dùng..." ban đầu
   - ✅ Load được users thực tế từ database
   - ✅ Hiển thị `fullName` và `email` đúng format
   - ✅ Không hiển thị users không active

### **Bước 3: Thực hiện Transfer**
1. **Chọn user**: Chọn một user từ danh sách (ví dụ: ID 2 - Hiệu Trưởng)
2. **Nhập ghi chú**: "Chuyển cho Hiệu Trưởng xử lý"
3. **Click Xác nhận**: Thực hiện transfer
4. **Kiểm tra kết quả**:
   - ✅ `assignedToUserId` = 2
   - ✅ `currentStepId` chuyển từ 1 → 2
   - ✅ `status` = "PROCESSING"

## 🔍 Debug và Monitoring

### **1. Console Logs**
Mở Developer Tools (F12) và xem Console:
```
=== Processing workflow transfer ===
Document workflow instance: {id: 4, currentStepId: 1, ...}
Current step ID: 1
Next step found: {id: 2, name: "Tạo văn bản", ...}
Updating workflow instance to step: 2
Workflow step updated successfully
```

### **2. Network Tab**
- Tìm request `GetAllUsers` query
- Kiểm tra response có users data
- Tìm request `processDocumentAction` mutation
- Kiểm tra transfer data

### **3. Database Verification**
```sql
-- Kiểm tra sau transfer
SELECT id, title, status, assignedToUserId, workflowInstanceId 
FROM document WHERE id = 11;

SELECT id, documentId, currentStepId, status, updatedAt 
FROM workflow_instance WHERE documentId = 11;

-- Kiểm tra action logs
SELECT id, instanceId, stepId, actionType, note, createdAt 
FROM workflow_action_log 
WHERE instanceId = 4 
ORDER BY createdAt DESC 
LIMIT 5;
```

## ✅ Kết quả mong đợi

### **Trước khi transfer:**
- `document.status` = "DRAFT"
- `document.assignedToUserId` = NULL
- `workflow_instance.currentStepId` = 1
- Dialog hiển thị danh sách users thực tế

### **Sau khi transfer:**
- `document.status` = "PROCESSING" ✅
- `document.assignedToUserId` = 2 (hoặc user ID được chọn) ✅
- `workflow_instance.currentStepId` = 2 ✅
- Có action log mới với `actionType` = "TRANSFER" ✅
- Dialog đóng và hiển thị thông báo thành công ✅

## 🐛 Troubleshooting

### **Nếu không load được users:**
1. **Kiểm tra GraphQL query**: Đảm bảo `GetAllUsers` query hoạt động
2. **Kiểm tra permissions**: Đảm bảo user có quyền truy cập users
3. **Kiểm tra network**: Xem có lỗi network không
4. **Kiểm tra console**: Xem có lỗi JavaScript không

### **Nếu users không hiển thị:**
1. **Kiểm tra filter**: Đảm bảo `user.isActive = true`
2. **Kiểm tra data**: Đảm bảo users có `fullName` và `email`
3. **Kiểm tra template**: Đảm bảo binding đúng

### **Nếu transfer không hoạt động:**
1. **Kiểm tra user ID**: Đảm bảo `selectedTransferUserId` có giá trị
2. **Kiểm tra permissions**: Đảm bảo user có quyền transfer
3. **Kiểm tra workflow**: Đảm bảo document có workflow instance

## 📝 Ghi chú

- **Users thực tế**: Lấy từ database thay vì mock data
- **Loading state**: Hiển thị khi đang tải users
- **Error handling**: Xử lý lỗi khi load users
- **Filtering**: Chỉ hiển thị users active
- **Full name**: Sử dụng computed field `fullName` từ backend

## 🔄 Test Cases

### **Test Case 1: Load Users**
- ✅ Dialog mở → Hiển thị loading → Load users thành công
- ✅ Hiển thị danh sách users với fullName và email

### **Test Case 2: Transfer to Different Users**
- ✅ Transfer cho User ID 2 (Hiệu Trưởng)
- ✅ Transfer cho User ID 3 (Phó Hiệu Trưởng)
- ✅ Transfer cho User ID 4 (Đào Tạo)

### **Test Case 3: Error Handling**
- ✅ Network error khi load users
- ✅ Empty users list
- ✅ Invalid user selection
