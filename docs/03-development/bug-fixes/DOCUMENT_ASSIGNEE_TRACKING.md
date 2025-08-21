# Tracking Người Xử Lý Document

## 🎯 Vấn đề đã được giải quyết

Trước đây, hệ thống không có cách để theo dõi chính xác "ai đang xử lý tài liệu hiện tại", chỉ có:
- `document.assignedToUserId` - người được giao ban đầu
- `workflow_step.assignedRole` - vai trò được giao cho step

Điều này gây nhầm lẫn khi transfer document vì không biết ai đang thực sự xử lý.

## ✅ Giải pháp đã thực hiện

### 1. **Thêm trường `currentAssigneeUserId` vào `workflow_instance`**

**Migration:** `apps/backend/database/migrations/migration-add-current-assignee.sql`

```sql
-- Thêm trường mới
ALTER TABLE `workflow_instance` 
ADD COLUMN `currentAssigneeUserId` INT NULL AFTER `currentStepId`;

-- Thêm foreign key constraint
ALTER TABLE `workflow_instance` 
ADD CONSTRAINT `FK_workflow_instance_currentAssigneeUserId` 
FOREIGN KEY (`currentAssigneeUserId`) REFERENCES `user` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Thêm index
CREATE INDEX `IDX_workflow_instance_currentAssigneeUserId` 
ON `workflow_instance` (`currentAssigneeUserId`);
```

### 2. **Cập nhật Entity**

**File:** `apps/backend/src/modules/workflow/workflow-instances/entities/workflow-instance.entity.ts`

```typescript
@Field(() => Int, { nullable: true })
@Column({ nullable: true })
currentAssigneeUserId?: number;

@Field(() => User, { nullable: true })
@ManyToOne(() => User, { nullable: true })
@JoinColumn({ name: 'currentAssigneeUserId' })
currentAssigneeUser?: User;
```

### 3. **Cập nhật Logic Transfer**

**File:** `apps/backend/src/modules/dispatch/documents/document-processing.service.ts`

```typescript
// Cập nhật currentStepId và currentAssigneeUserId của workflow instance
await this.workflowInstancesService.updateCurrentStepAndAssignee(
  document.workflowInstance.id,
  nextStep.id,
  transferToUserId
);
```

### 4. **Thêm Method mới**

**File:** `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.service.ts`

```typescript
async updateCurrentStepAndAssignee(
  instanceId: number, 
  newStepId: number, 
  newAssigneeUserId: number
): Promise<WorkflowInstance> {
  const updateData = {
    currentStepId: newStepId,
    currentAssigneeUserId: newAssigneeUserId,
    updatedAt: new Date()
  };
  
  await this.repository.update(instanceId, updateData);
  return this.findOne(instanceId);
}
```

## 📊 Sự khác biệt giữa các trường

### **1. `document.assignedToUserId`**
- **Mục đích**: Người được giao ban đầu
- **Thay đổi**: Có thể thay đổi khi transfer
- **Sử dụng**: Để biết ai được giao document

### **2. `workflow_instance.currentAssigneeUserId`** ⭐ **MỚI**
- **Mục đích**: Người đang thực sự xử lý document hiện tại
- **Thay đổi**: Cập nhật mỗi khi có action (transfer, approve)
- **Sử dụng**: Để biết ai đang xử lý document

### **3. `workflow_step.assignedRole`**
- **Mục đích**: Vai trò được giao cho step
- **Thay đổi**: Không thay đổi (định nghĩa workflow)
- **Sử dụng**: Để biết vai trò nào cần xử lý step

### **4. `workflow_instance.createdByUserId`**
- **Mục đích**: Người tạo workflow
- **Thay đổi**: Không thay đổi
- **Sử dụng**: Để biết ai tạo workflow

## 🔄 Logic cập nhật `currentAssigneeUserId`

### **Khi tạo workflow instance:**
```typescript
currentAssigneeUserId = user.id; // Người tạo workflow
```

### **Khi transfer document:**
```typescript
currentAssigneeUserId = transferToUserId; // Người được transfer
```

### **Khi approve document:**
```typescript
currentAssigneeUserId = user.id; // Người approve
```

## 🧪 Test và Verification

### **1. Kiểm tra Database**
```sql
-- Kiểm tra workflow instances với currentAssigneeUserId
SELECT 
    wi.id,
    wi.documentId,
    wi.currentStepId,
    wi.currentAssigneeUserId,
    wi.status,
    u.fullName as currentAssigneeName
FROM workflow_instance wi
LEFT JOIN user u ON wi.currentAssigneeUserId = u.id
ORDER BY wi.id DESC;
```

### **2. Test Transfer**
1. **Trước transfer**: `currentAssigneeUserId = 1` (người tạo)
2. **Sau transfer**: `currentAssigneeUserId = 2` (người được transfer)
3. **Verify**: Cả `currentStepId` và `currentAssigneeUserId` đều được cập nhật

### **3. Test Approve**
1. **Trước approve**: `currentAssigneeUserId = 2`
2. **Sau approve**: `currentAssigneeUserId = 3` (người approve)
3. **Verify**: Cả `currentStepId` và `currentAssigneeUserId` đều được cập nhật

## 📈 Lợi ích

### **1. Tracking chính xác**
- Biết chính xác ai đang xử lý document
- Không bị nhầm lẫn giữa người giao và người xử lý

### **2. Audit trail**
- Theo dõi được lịch sử ai đã xử lý document
- Có thể tạo báo cáo về workload của từng user

### **3. Workflow management**
- Hiển thị chính xác người đang xử lý trong UI
- Có thể gửi notification cho đúng người

### **4. Performance**
- Index trên `currentAssigneeUserId` giúp query nhanh hơn
- Có thể filter documents theo người xử lý

## 🔍 Monitoring và Debug

### **1. Console Logs**
```
=== Processing workflow transfer ===
Document workflow instance: {id: 4, currentStepId: 1, currentAssigneeUserId: 1}
Current step ID: 1
Transfer to user ID: 2
Next step found: {id: 2, name: "Tạo văn bản"}
Updating workflow instance to step: 2 with assignee: 2
Workflow step and assignee updated successfully
```

### **2. Database Queries**
```sql
-- Kiểm tra người đang xử lý document
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

## 🚀 Các bước tiếp theo

### **1. Cập nhật Frontend**
- Hiển thị `currentAssigneeUser` trong UI
- Thêm filter theo người xử lý
- Cập nhật notifications

### **2. Thêm Reports**
- Báo cáo workload theo user
- Thống kê thời gian xử lý
- Audit trail chi tiết

### **3. Optimize Queries**
- Thêm indexes cho performance
- Cache thông tin user
- Batch updates cho multiple documents
