# Workflow Update Debug Complete

## Vấn đề

Dựa trên phân tích của user, lỗi xảy ra:

```
UPDATE `workflow_action_log` SET `instanceId` = NULL WHERE `id` = 10
Column 'instanceId' cannot be null
```

**Nguyên nhân**: Có một UPDATE query đang cố gắng set `instanceId` thành `undefined` (sau đó thành `NULL` trong database).

## Phân tích của User

### 1. Ý nghĩa lỗi
- Trong bảng `workflow_action_log`, cột `instanceId` **NOT NULL**
- Khi thực thi query update, giá trị truyền vào là `undefined` → biến thành `NULL` trong DB

### 2. Nguyên nhân thường gặp
1. **TypeORM update**: Trường `instanceId` không được gán giá trị hợp lệ
2. **Logic query sai**: Object không có field `instanceId`
3. **Timing issue**: `instanceId` chưa được gán khi approve workflow

### 3. Hướng xử lý
- Debug giá trị `instanceId` trước khi update
- Đảm bảo entity `WorkflowActionLog` khai báo đúng
- Xem xét business logic có cho phép `nullable: true` không

## Giải pháp Debug

### 1. Thêm Logging vào Update Method

**File**: `apps/backend/src/modules/workflow/workflow-action-logs/workflow-action-logs.service.ts`

```typescript
async update(
  id: number,
  updateWorkflowActionLogInput: UpdateWorkflowActionLogInput,
): Promise<WorkflowActionLog> {
  console.log('=== UPDATE WORKFLOW ACTION LOG ===');
  console.log('Update called for ID:', id);
  console.log('Update input:', updateWorkflowActionLogInput);
  
  const log = await this.findOne(id);
  console.log('Found log before update:', {
    id: log.id,
    instanceId: log.instanceId,
    stepId: log.stepId,
    actionType: log.actionType
  });

  // ... rest of the method with detailed logging
}
```

### 2. Thêm Logging vào Resolver

**File**: `apps/backend/src/modules/workflow/workflow-action-logs/workflow-action-logs.resolver.ts`

```typescript
@Mutation(() => WorkflowActionLog)
updateWorkflowActionLog(
  @Args('updateWorkflowActionLogInput')
  updateWorkflowActionLogInput: UpdateWorkflowActionLogInput,
) {
  console.log('=== UPDATE WORKFLOW ACTION LOG MUTATION ===');
  console.log('Mutation called with input:', updateWorkflowActionLogInput);
  console.log('Calling service update method...');
  
  const result = this.workflowActionLogsService.update(
    updateWorkflowActionLogInput.id,
    updateWorkflowActionLogInput,
  );
  
  console.log('Service update method called');
  console.log('=== MUTATION COMPLETE ===');
  
  return result;
}
```

### 3. Thêm Logging vào FindOne Method

```typescript
async findOne(id: number): Promise<WorkflowActionLog> {
  console.log('=== FIND ONE WORKFLOW ACTION LOG ===');
  console.log('Finding log with ID:', id);
  
  const log = await this.repository.findOne({
    where: { id },
    relations: ['instance', 'step', 'actionByUser'],
  });

  console.log('Found log:', {
    id: log.id,
    instanceId: log.instanceId,
    stepId: log.stepId,
    actionType: log.actionType,
    hasInstance: !!log.instance,
    hasStep: !!log.step,
    hasActionByUser: !!log.actionByUser
  });
  console.log('=== FIND ONE COMPLETE ===');

  return log;
}
```

## Debug Strategy

### 1. Monitor Update Calls
Với logging đã thêm, chúng ta sẽ thấy:
- Có mutation nào gọi `updateWorkflowActionLog` không
- Input data có `instanceId: undefined` không
- Entity state trước và sau khi update

### 2. Expected Log Output
```
=== UPDATE WORKFLOW ACTION LOG MUTATION ===
Mutation called with input: { id: 10, note: "Updated note" }
Calling service update method...
=== UPDATE WORKFLOW ACTION LOG ===
Update called for ID: 10
Update input: { id: 10, note: "Updated note" }
=== FIND ONE WORKFLOW ACTION LOG ===
Finding log with ID: 10
Found log: { id: 10, instanceId: 3, stepId: 2, ... }
=== FIND ONE COMPLETE ===
Found log before update: { id: 10, instanceId: 3, ... }
Final update data: { note: "Updated note" }
Log before Object.assign: { id: 10, instanceId: 3, ... }
Log after Object.assign: { id: 10, instanceId: 3, ... }
Log saved successfully: { id: 10, instanceId: 3, ... }
=== UPDATE COMPLETE ===
Service update method called
=== MUTATION COMPLETE ===
```

### 3. If Error Occurs
Nếu có lỗi, chúng ta sẽ thấy:
- Chính xác mutation nào được gọi
- Input data có vấn đề gì
- Entity state bị thay đổi như thế nào

## Potential Root Causes

### 1. GraphQL Mutation Call
Có thể có frontend code đang gọi:
```graphql
mutation UpdateWorkflowActionLog($input: UpdateWorkflowActionLogInput!) {
  updateWorkflowActionLog(updateWorkflowActionLogInput: $input) {
    id
    instanceId
  }
}
```

Với input:
```json
{
  "input": {
    "id": 10,
    "instanceId": null  // ← This causes the error
  }
}
```

### 2. TypeORM Relations Loading
Khi load relations, TypeORM có thể trigger update:
```typescript
const log = await this.repository.findOne({
  where: { id },
  relations: ['instance', 'step', 'actionByUser'],  // ← May trigger updates
});
```

### 3. Entity State Management
Entity có thể bị modified và auto-saved:
```typescript
const log = await this.repository.findOne({ where: { id: 10 } });
log.instance = undefined;  // ← This may trigger update
```

## Next Steps

1. **Run test** - Thực hiện workflow action để xem logs
2. **Identify mutation** - Xác định mutation nào gây lỗi
3. **Fix input data** - Sửa input data nếu cần
4. **Review business logic** - Kiểm tra logic có đúng không

## Prevention

### 1. Input Validation
```typescript
// Validate input before update
if (updateData.instanceId === undefined || updateData.instanceId === null) {
  console.warn('Attempted to update instanceId to null/undefined, ignoring');
  delete updateData.instanceId;
}
```

### 2. Entity Constraints
```typescript
@Column({ nullable: false })
instanceId: number;  // Ensure this is never null
```

### 3. Business Logic Review
```typescript
// Only allow updating safe fields
@InputType()
export class UpdateWorkflowActionLogInput {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  note?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  metadata?: string;
  
  // Note: instanceId, stepId, actionType are NOT included
}
```

## Kết luận

Với logging đã thêm, chúng ta sẽ có thể:
- ✅ **Identify root cause** - Xác định chính xác nguyên nhân
- ✅ **Track data flow** - Theo dõi data từ input đến database
- ✅ **Prevent future errors** - Ngăn chặn lỗi tương tự
- ✅ **Improve debugging** - Debug dễ dàng hơn

Hệ thống debug đã sẵn sàng! 🚀
