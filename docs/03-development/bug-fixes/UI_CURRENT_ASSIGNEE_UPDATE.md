# Cập nhật UI hiển thị người đang xử lý Document

## 🎯 Mục tiêu
Cập nhật UI để hiển thị thông tin "ai đang xử lý document hiện tại" thay vì chỉ hiển thị người được giao ban đầu.

## ✅ Thay đổi đã thực hiện

### 1. **Cập nhật Interface `DocumentProcessingInfo`**
**File:** `apps/frontend/src/app/features/user/document-processing/services/document-processing-apollo.service.ts`

Thêm các trường mới:
```typescript
export interface DocumentProcessingInfo {
  // ... existing fields
  // Thông tin người đang xử lý
  currentAssigneeUserId?: number;
  currentAssigneeName?: string;
  currentAssigneeEmail?: string;
}
```

### 2. **Cập nhật GraphQL Queries**
Thêm các trường mới vào query:
```graphql
query {
  documentsForProcessing {
    documents {
      # ... existing fields
      currentAssigneeUserId
      currentAssigneeName
      currentAssigneeEmail
    }
  }
}
```

### 3. **Cập nhật Backend Mapping**
**File:** `apps/backend/src/modules/dispatch/documents/documents.resolver.ts`

Cập nhật logic mapping để trả về thông tin người đang xử lý:
```typescript
return {
  // ... existing fields
  // Thông tin người đang xử lý
  currentAssigneeUserId: workflowInstance?.currentAssigneeUserId,
  currentAssigneeName: workflowInstance?.currentAssigneeUser?.fullName,
  currentAssigneeEmail: workflowInstance?.currentAssigneeUser?.email,
};
```

### 4. **Cập nhật Backend Relations**
**File:** `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.service.ts`

Thêm relation `currentAssigneeUser`:
```typescript
async findByDocumentId(documentId: number): Promise<WorkflowInstance[]> {
  return this.repository.find({
    where: { documentId },
    relations: ['template', 'currentStep', 'createdByUser', 'currentAssigneeUser', 'logs', 'logs.actionByUser'],
    order: { createdAt: 'DESC' },
  });
}
```

### 5. **Cập nhật UI Template**
**File:** `apps/frontend/src/app/features/user/document-processing/document-processing.component.ts`

Thêm hiển thị người đang xử lý trong document cards:
```html
<div class="info-row" *ngIf="doc.currentAssigneeName">
  <span class="label">Đang xử lý bởi:</span>
  <span class="value assignee-info">
    <span class="assignee-name">{{ doc.currentAssigneeName }}</span>
    <span class="assignee-email">({{ doc.currentAssigneeEmail }})</span>
  </span>
</div>
```

### 6. **Thêm CSS Styling**
Thêm styles cho assignee info:
```css
.assignee-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.assignee-name {
  font-weight: 600;
  color: var(--color-primary);
}

.assignee-email {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 400;
}
```

## 🧪 Test Steps

### **Bước 1: Kiểm tra Database**
```sql
-- Kiểm tra workflow instances có currentAssigneeUserId
SELECT 
    wi.id,
    wi.documentId,
    wi.currentStepId,
    wi.currentAssigneeUserId,
    u.fullName as currentAssigneeName
FROM workflow_instance wi
LEFT JOIN user u ON wi.currentAssigneeUserId = u.id
ORDER BY wi.id DESC;
```

### **Bước 2: Test trong Frontend**
1. **Mở browser**: `http://localhost:4200`
2. **Đăng nhập**: Với tài khoản có quyền xem document processing
3. **Vào Document Processing**: Điều hướng đến trang xử lý văn bản
4. **Kiểm tra các tab**:
   - Tab "Cần xử lý": Hiển thị người đang xử lý
   - Tab "Đang xử lý": Hiển thị người đang xử lý
   - Tab "Đã xử lý": Hiển thị người cuối cùng xử lý

### **Bước 3: Kiểm tra hiển thị**
Trong mỗi document card, kiểm tra:
- ✅ Hiển thị "Đang xử lý bởi: [Tên người dùng]"
- ✅ Hiển thị email trong ngoặc đơn
- ✅ Tên người dùng có màu primary
- ✅ Email có màu secondary và font nhỏ hơn

### **Bước 4: Test Transfer**
1. **Chọn document**: Click vào document để xem chi tiết
2. **Thực hiện transfer**: Chọn user khác và transfer
3. **Kiểm tra cập nhật**: 
   - UI cập nhật người đang xử lý mới
   - Database cập nhật `currentAssigneeUserId`

## 🔍 Debug và Monitoring

### **1. Console Logs**
Mở Developer Tools (F12) và xem Console:
```
=== Processing workflow transfer ===
Document workflow instance: {id: 4, currentStepId: 1, currentAssigneeUserId: 1}
Current step ID: 1
Transfer to user ID: 2
Next step found: {id: 2, name: "Tạo văn bản"}
Updating workflow instance to step: 2 with assignee: 2
Workflow step and assignee updated successfully
```

### **2. Network Tab**
- Tìm request `documentsForProcessing`
- Kiểm tra response có `currentAssigneeUserId`, `currentAssigneeName`, `currentAssigneeEmail`
- Verify data mapping đúng

### **3. Database Verification**
```sql
-- Kiểm tra sau transfer
SELECT 
    d.id as documentId,
    d.title,
    d.status,
    d.assignedToUserId as originalAssignee,
    wi.currentAssigneeUserId as currentAssignee,
    u.fullName as currentAssigneeName
FROM document d
JOIN workflow_instance wi ON d.workflowInstanceId = wi.id
LEFT JOIN user u ON wi.currentAssigneeUserId = u.id
WHERE d.id = 11;
```

## ✅ Kết quả mong đợi

### **Trước khi transfer:**
- UI hiển thị: "Đang xử lý bởi: Admin System (admin@tdmu.edu.vn)"
- `currentAssigneeUserId` = 1

### **Sau khi transfer:**
- UI hiển thị: "Đang xử lý bởi: Nguyễn Văn Hiệu Trưởng (hieutruong@tdmu.edu.vn)"
- `currentAssigneeUserId` = 2
- UI cập nhật real-time

## 🐛 Troubleshooting

### **Nếu không hiển thị người đang xử lý:**
1. **Kiểm tra GraphQL query**: Đảm bảo có `currentAssigneeUserId`, `currentAssigneeName`, `currentAssigneeEmail`
2. **Kiểm tra backend mapping**: Đảm bảo logic mapping trả về đúng data
3. **Kiểm tra relations**: Đảm bảo `currentAssigneeUser` được load
4. **Kiểm tra database**: Đảm bảo `currentAssigneeUserId` có giá trị

### **Nếu hiển thị sai thông tin:**
1. **Kiểm tra user data**: Đảm bảo user có `fullName` và `email`
2. **Kiểm tra computed field**: Đảm bảo `fullName` được tính đúng
3. **Kiểm tra template binding**: Đảm bảo binding đúng trong template

### **Nếu UI không cập nhật sau transfer:**
1. **Kiểm tra GraphQL mutation**: Đảm bảo `processDocumentAction` thành công
2. **Kiểm tra refetch**: Đảm bảo data được refresh sau transfer
3. **Kiểm tra cache**: Clear Apollo cache nếu cần

## 📈 Lợi ích

### **1. Tracking chính xác**
- Biết chính xác ai đang xử lý document
- Không bị nhầm lẫn giữa người giao và người xử lý

### **2. UX tốt hơn**
- Hiển thị thông tin rõ ràng về người đang xử lý
- Giúp user hiểu workflow hiện tại

### **3. Workflow management**
- Có thể liên hệ đúng người đang xử lý
- Có thể gửi notification cho đúng người

### **4. Audit trail**
- Theo dõi được lịch sử ai đã xử lý
- Có thể tạo báo cáo về workload

## 🚀 Các bước tiếp theo

### **1. Cập nhật các component khác**
- Document details component
- Workflow detail component
- Dashboard component

### **2. Thêm filter theo người xử lý**
- Filter documents theo `currentAssigneeUserId`
- Search theo tên người xử lý

### **3. Thêm notifications**
- Gửi notification cho người đang xử lý
- Reminder cho documents chưa được xử lý

### **4. Thêm reports**
- Báo cáo workload theo user
- Thống kê thời gian xử lý
