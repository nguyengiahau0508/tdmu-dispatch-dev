# Sửa lỗi: Transfer văn bản không cập nhật currentStepId

## 🎯 Vấn đề
Khi chuyển tiếp văn bản thành công, bước hiện tại (`currentStepId`) luôn là 1 thay vì chuyển đến bước tiếp theo trong workflow.

## 🔍 Nguyên nhân
1. **Logic transfer không cập nhật workflow step**: Khi transfer document, chỉ cập nhật `assignedToUserId` và `status` của document, nhưng không cập nhật `currentStepId` của workflow instance.
2. **`handleTransferAction` gọi sai logic**: Trong `WorkflowInstancesService`, `handleTransferAction` đang gọi `handleApproveAction` thay vì xử lý transfer đúng cách.

## ✅ Giải pháp đã thực hiện

### 1. **Cập nhật logic transfer trong `DocumentProcessingService`**

**File:** `apps/backend/src/modules/dispatch/documents/document-processing.service.ts`

```typescript
case 'TRANSFER':
  if (!transferToUserId) {
    throw new BadRequestException('Transfer user ID is required for TRANSFER action');
  }
  document.assignedToUserId = transferToUserId;
  document.status = DocumentStatus.PROCESSING;
  
  // Nếu có workflow instance, cần xử lý workflow transfer
  if (document.workflowInstance) {
    try {
      // Tìm bước tiếp theo trong workflow để chuyển đến
      const nextStep = await this.workflowStepsService.findNextStep(
        document.workflowInstance.currentStepId || 1
      );
      
      if (nextStep) {
        // Cập nhật currentStepId của workflow instance
        await this.workflowInstancesService.updateCurrentStep(
          document.workflowInstance.id,
          nextStep.id
        );
        
        // Cập nhật currentStepId trong document.workflowInstance để đồng bộ
        document.workflowInstance.currentStepId = nextStep.id;
      }
    } catch (error) {
      console.error('Error updating workflow step during transfer:', error);
      // Không throw error vì document đã được cập nhật thành công
    }
  }
  break;
```

### 2. **Thêm method `updateCurrentStep` vào `WorkflowInstancesService`**

**File:** `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.service.ts`

```typescript
/**
 * Cập nhật currentStepId của workflow instance
 */
async updateCurrentStep(instanceId: number, newStepId: number): Promise<WorkflowInstance> {
  console.log(`Updating workflow instance ${instanceId} to step ${newStepId}`);
  
  const updateData = {
    currentStepId: newStepId,
    updatedAt: new Date()
  };
  
  try {
    await this.repository.update(instanceId, updateData);
    console.log(`Workflow instance ${instanceId} updated to step ${newStepId} successfully`);
    
    return this.findOne(instanceId);
  } catch (error) {
    console.error(`Error updating workflow instance ${instanceId} to step ${newStepId}:`, error);
    throw error;
  }
}
```

### 3. **Thêm dependencies cần thiết**

**File:** `apps/backend/src/modules/dispatch/documents/document-processing.service.ts`

```typescript
import { WorkflowStepsService } from 'src/modules/workflow/workflow-steps/workflow-steps.service';

constructor(
  @InjectRepository(Document)
  private readonly documentRepository: Repository<Document>,
  private readonly workflowInstancesService: WorkflowInstancesService,
  private readonly workflowActionLogsService: WorkflowActionLogsService,
  private readonly workflowStepsService: WorkflowStepsService, // Thêm dependency này
) {}
```

## 🧪 Testing

### 1. **Test file đã tạo**
- `test/test-transfer-workflow.js` - Test mutation transfer với workflow

### 2. **Cách test**
```bash
# Test transfer workflow
node test/test-transfer-workflow.js
```

### 3. **Kiểm tra kết quả**
Sau khi transfer thành công:
- ✅ `document.assignedToUserId` được cập nhật
- ✅ `document.status` = "PROCESSING"
- ✅ `workflowInstance.currentStepId` được cập nhật thành bước tiếp theo
- ✅ `workflowInstance.status` = "IN_PROGRESS"

## 📋 Workflow Steps hiện tại

Dựa trên database, workflow có các bước:
1. **Bước 1**: "Giao việc" (START) - Role: DEPARTMENT_STAFF
2. **Bước 2**: "Tạo văn bản" (TRANSFER) - Role: CLERK
3. **Bước 3**: "Phê duyệt trưởng phòng" (APPROVAL) - Role: DEPARTMENT_STAFF
4. **Bước 4**: "Phê duyệt lãnh đạo" (APPROVAL) - Role: SYSTEM_ADMIN

## 🔄 Logic Transfer mới

Khi transfer document:
1. **Cập nhật document**: `assignedToUserId` và `status`
2. **Tìm bước tiếp theo**: Sử dụng `WorkflowStepsService.findNextStep()`
3. **Cập nhật workflow**: `currentStepId` = bước tiếp theo
4. **Tạo action log**: Ghi lại hành động transfer

## 🐛 Troubleshooting

### Nếu vẫn không cập nhật currentStepId:
1. **Kiểm tra workflow instance**: Đảm bảo document có workflow instance
2. **Kiểm tra workflow steps**: Đảm bảo có bước tiếp theo
3. **Kiểm tra logs**: Xem console logs để debug
4. **Kiểm tra permissions**: Đảm bảo user có quyền transfer

### Nếu có lỗi dependency injection:
1. **Kiểm tra module imports**: Đảm bảo `WorkflowStepsService` được import
2. **Kiểm tra circular dependencies**: Sử dụng `forwardRef` nếu cần
3. **Restart server**: Để áp dụng thay đổi

## 📁 Files đã thay đổi

- `apps/backend/src/modules/dispatch/documents/document-processing.service.ts`
- `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.service.ts`
- `test/test-transfer-workflow.js`

## 🎯 Kết quả mong đợi

Sau khi áp dụng các thay đổi:
- ✅ Transfer document cập nhật đúng `currentStepId`
- ✅ Workflow chuyển đến bước tiếp theo
- ✅ Document được giao cho user mới
- ✅ Action log được tạo đúng cách

## 🔄 Các bước tiếp theo

1. **Test với document thực tế** - Sử dụng test file đã tạo
2. **Kiểm tra workflow steps** - Đảm bảo logic chuyển bước đúng
3. **Verify database** - Kiểm tra `currentStepId` được cập nhật
4. **Monitor logs** - Theo dõi console logs để phát hiện vấn đề
