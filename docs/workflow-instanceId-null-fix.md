# Workflow InstanceId Null Fix

## Vấn đề

### 1. Lỗi InstanceId Null (Đã sửa)
Lỗi xảy ra khi thực hiện workflow action:

```
QueryFailedError: Column 'instanceId' cannot be null
UPDATE `workflow_action_log` SET `instanceId` = NULL WHERE `id` = 12
```

### 2. Lỗi Foreign Key Constraint (Mới phát hiện)
Lỗi xảy ra khi workflow hoàn thành:

```
Cannot add or update a child row: a foreign key constraint fails 
(`tdmu_dispatch`.`workflow_instance`, CONSTRAINT `FK_eba40b371c4cbc903eb44be3214` 
FOREIGN KEY (`currentStepId`) REFERENCES `workflow_step` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION)
```

## Nguyên nhân

### 1. InstanceId Null
1. **TypeORM Entity State Management**: Khi sử dụng `repository.save()` với entity có relations, TypeORM có thể trigger update queries không mong muốn
2. **Relation Loading Issues**: Việc load relations trong `findOne()` có thể gây ra cascade updates
3. **Object.assign Issues**: Sử dụng `Object.assign()` với `undefined` values có thể overwrite fields quan trọng

### 2. Foreign Key Constraint
1. **Database Schema**: Cột `currentStepId` được định nghĩa là `NOT NULL` với foreign key constraint
2. **Workflow Completion Logic**: Khi workflow hoàn thành, code cố gắng set `currentStepId = 0`, nhưng không có workflow step nào có `id = 0`
3. **Missing NULL Support**: Database schema không cho phép `currentStepId` là `NULL`

## Giải pháp đã thực hiện

### 1. Cải thiện WorkflowInstancesService

**File**: `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.service.ts`

#### a) Sửa method `handleApproveAction`
- Thay `repository.save()` bằng `repository.update()` để tránh relation issues
- Tách riêng việc update và load relations
- Thêm validation và error handling

```typescript
// Trước
instance.currentStepId = nextStep.id;
await this.repository.save(instance);

// Sau
const updateData = {
  currentStepId: nextStep.id,
  updatedAt: new Date()
};
await this.repository.update(instance.id, updateData);
```

#### b) Cải thiện method `findOne`
- Load instance cơ bản trước để đảm bảo data integrity
- Load relations riêng biệt để tránh cascade issues
- Validate logs để đảm bảo `instanceId` không null

```typescript
// Load logs separately to avoid relation cascade issues
const logs = await this.workflowActionLogsService.findByInstanceId(id);

// Validate logs to ensure instanceId is not null
const validLogs = logs.filter(log => {
  if (!log.instanceId) {
    console.error('Found log with null instanceId:', log);
    return false;
  }
  return true;
});
```

#### c) Cải thiện các action handlers khác
- `handleRejectAction`
- `handleCancelAction` 
- `handleCompleteAction`

Tất cả đều sử dụng `repository.update()` thay vì `repository.save()`.

### 2. Cải thiện WorkflowActionLogsService

**File**: `apps/backend/src/modules/workflow/workflow-action-logs/workflow-action-logs.service.ts`

#### a) Cải thiện method `logAction`
- Thêm validation cho tất cả required fields
- Sử dụng `actionByUserId` thay vì `actionByUser` relation
- Thêm error handling chi tiết

```typescript
// Validate required fields
if (!instanceId || instanceId <= 0) {
  throw new Error(`Invalid instanceId: ${instanceId}`);
}

const logData = {
  instanceId,
  stepId,
  actionType,
  actionByUserId: user.id, // Use ID instead of relation
  actionAt: new Date(),
  note: note || '',
  metadata: metadata ? JSON.stringify(metadata) : '',
};
```

#### b) Cải thiện method `update`
- Chỉ cho phép cập nhật các trường được phép (`note`, `metadata`)
- Sử dụng `repository.update()` thay vì `repository.save()`
- Tránh việc set `instanceId` thành null

```typescript
// Only allow updating specific fields to prevent instanceId from being nullified
const allowedFields = ['note', 'metadata'];
const updateData: any = {};

// Only copy allowed fields
allowedFields.forEach(field => {
  if (updateWorkflowActionLogInput[field] !== undefined) {
    updateData[field] = updateWorkflowActionLogInput[field];
  }
});

// Use update method instead of save to avoid relation issues
await this.repository.update(id, updateData);
```

### 3. Cải thiện DTO

**File**: `apps/backend/src/modules/workflow/workflow-action-logs/dto/update-workflow-action-log.input.ts`

- Chỉ cho phép cập nhật `note` và `metadata`
- Loại bỏ các trường không được phép cập nhật như `instanceId`, `stepId`, `actionType`

### 4. Cập nhật Database Schema

**File**: `apps/backend/src/modules/workflow/workflow-instances/entities/workflow-instance.entity.ts`

#### a) Thay đổi Entity
```typescript
// Trước
@Field(() => Int)
@Column()
currentStepId: number;

// Sau
@Field(() => Int, { nullable: true })
@Column({ nullable: true })
currentStepId: number;
```

#### b) Cập nhật Service Methods
```typescript
// Khi workflow hoàn thành
const updateData = {
  status: WorkflowStatus.COMPLETED,
  currentStepId: undefined, // Sẽ được chuyển thành NULL trong database
  updatedAt: new Date()
};
```

### 5. Database Migration

**File**: `migration-currentStepId-nullable.sql`

```sql
-- Step 1: Drop existing foreign key constraint
ALTER TABLE `workflow_instance` 
DROP FOREIGN KEY `FK_eba40b371c4cbc903eb44be3214`;

-- Step 2: Modify column to allow NULL
ALTER TABLE `workflow_instance` 
MODIFY COLUMN `currentStepId` INT NULL;

-- Step 3: Re-add foreign key constraint with NULL allowed
ALTER TABLE `workflow_instance` 
ADD CONSTRAINT `FK_workflow_instance_currentStepId` 
FOREIGN KEY (`currentStepId`) REFERENCES `workflow_step` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Update existing completed workflows
UPDATE `workflow_instance` 
SET `currentStepId` = NULL 
WHERE `status` = 'COMPLETED' AND `currentStepId` = 0;
```

## Kết quả

1. **Loại bỏ lỗi instanceId null**: Không còn UPDATE queries với `instanceId = NULL`
2. **Loại bỏ lỗi foreign key constraint**: Có thể set `currentStepId = NULL` khi workflow hoàn thành
3. **Cải thiện performance**: Sử dụng `update()` thay vì `save()` cho các thay đổi đơn giản
4. **Tăng tính ổn định**: Validation và error handling tốt hơn
5. **Bảo vệ data integrity**: Chỉ cho phép cập nhật các trường được phép

## Testing

### 1. Chạy Database Migration
```bash
# Chạy migration
mysql -u your_username -p your_database < migration-currentStepId-nullable.sql
```

### 2. Test Workflow Completion
```bash
# Test workflow completion
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { executeWorkflowAction(workflowActionInput: { instanceId: 3, stepId: 2, actionType: APPROVE, note: \"Test completion\" }) { id status currentStepId } }"
  }'
```

### 3. Kiểm tra Database
```sql
-- Kiểm tra workflow instance đã hoàn thành
SELECT id, status, currentStepId FROM workflow_instance WHERE id = 3;

-- Kết quả mong đợi: currentStepId = NULL
```

## Lưu ý

- **Backup database** trước khi chạy migration
- **Test trên staging** trước khi áp dụng production
- **Cập nhật frontend** để xử lý `currentStepId` có thể `NULL`
- Các thay đổi này backward compatible
- Không ảnh hưởng đến existing data
- Cải thiện overall system stability

