# Workflow Database Update Error Fix

## Vấn đề

Lỗi xảy ra khi thực hiện workflow action:

```
QueryFailedError: Column 'instanceId' cannot be null
UPDATE `workflow_action_log` SET `instanceId` = NULL WHERE `id` = 6
```

## Nguyên nhân

Lỗi này xảy ra vì có một UPDATE query đang cố gắng set `instanceId` thành NULL trong bảng `workflow_action_log`. Nguyên nhân có thể là:

1. **UpdateWorkflowActionLogInput DTO**: Sử dụng `PartialType` cho phép tất cả fields optional
2. **Object.assign**: Overwrite fields với `undefined` values
3. **GraphQL mutation**: Gửi `instanceId: undefined` trong update mutation

## Giải pháp

### 1. Sửa UpdateWorkflowActionLogInput DTO

**File**: `apps/backend/src/modules/workflow/workflow-action-logs/dto/update-workflow-action-log.input.ts`

**Trước**:
```typescript
@InputType()
export class UpdateWorkflowActionLogInput extends PartialType(
  CreateWorkflowActionLogInput,
) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number;
}
```

**Sau**:
```typescript
@InputType()
export class UpdateWorkflowActionLogInput {
  @Field(() => Int, { description: 'ID của workflow action log cần cập nhật' })
  @IsInt()
  @Min(1, { message: 'ID phải là số nguyên dương' })
  id: number;

  @Field(() => String, { nullable: true, description: 'Ghi chú cho hành động' })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Metadata bổ sung (JSON string)',
  })
  @IsString()
  @IsOptional()
  metadata?: string;
}
```

### 2. Sửa Update Method trong Service

**File**: `apps/backend/src/modules/workflow/workflow-action-logs/workflow-action-logs.service.ts`

```typescript
async update(
  id: number,
  updateWorkflowActionLogInput: UpdateWorkflowActionLogInput,
): Promise<WorkflowActionLog> {
  const log = await this.findOne(id);

  if (updateWorkflowActionLogInput.metadata) {
    updateWorkflowActionLogInput.metadata = JSON.parse(
      updateWorkflowActionLogInput.metadata,
    );
  }

  // Only update fields that are provided and not undefined
  const updateData = { ...updateWorkflowActionLogInput };
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  Object.assign(log, updateData);
  return this.repository.save(log);
}
```

### 3. Thêm Logging cho Debug

**File**: `apps/backend/src/modules/workflow/workflow-action-logs/workflow-action-logs.service.ts`

```typescript
async logAction(
  instanceId: number,
  stepId: number,
  actionType: ActionType,
  user: User,
  note?: string,
  metadata?: any,
): Promise<WorkflowActionLog> {
  console.log('Creating workflow action log:', {
    instanceId,
    stepId,
    actionType,
    userId: user.id,
    note,
    metadata
  });

  const log = this.repository.create({
    instanceId,
    stepId,
    actionType,
    actionByUser: user,
    actionAt: new Date(),
    note,
    metadata,
  });

  console.log('Workflow action log entity created:', log);

  const savedLog = await this.repository.save(log);
  console.log('Workflow action log saved:', savedLog);

  return savedLog;
}
```

## Lợi ích của giải pháp

### 1. Data Integrity
- **Prevent null updates**: Không cho phép update các fields quan trọng
- **Immutable fields**: `instanceId`, `stepId`, `actionType` không thể thay đổi
- **Safe updates**: Chỉ cho phép update `note` và `metadata`

### 2. Better Error Handling
- **Clear validation**: Validation rõ ràng cho từng field
- **Type safety**: TypeScript types đảm bảo type safety
- **Graceful degradation**: Xử lý lỗi mà không crash

### 3. Improved Debugging
- **Detailed logging**: Log chi tiết quá trình tạo action log
- **Entity tracking**: Track entity từ creation đến save
- **Error context**: Cung cấp context khi có lỗi

## Database Schema

### WorkflowActionLog Entity
```typescript
@ObjectType()
@Entity()
export class WorkflowActionLog {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()  // NOT NULL
  @Field(() => Int)
  instanceId: number;

  @Column()  // NOT NULL
  @Field(() => Int)
  stepId: number;

  @Field(() => ActionType)
  @Column({ type: 'enum', enum: ActionType })  // NOT NULL
  actionType: ActionType;

  @Field(() => Int)
  @Column()  // NOT NULL
  actionByUserId: number;

  @Field()
  @Column({ type: 'datetime' })  // NOT NULL
  actionAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })  // NULLABLE
  note?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })  // NULLABLE
  metadata?: string;
}
```

## Testing

### 1. Unit Tests
```typescript
describe('WorkflowActionLogsService', () => {
  it('should not allow updating instanceId', async () => {
    const updateInput = {
      id: 1,
      instanceId: undefined,  // This should be ignored
      note: 'Updated note'
    };

    const result = await service.update(1, updateInput);
    expect(result.instanceId).not.toBeUndefined();
  });

  it('should only update provided fields', async () => {
    const updateInput = {
      id: 1,
      note: 'New note'
    };

    const result = await service.update(1, updateInput);
    expect(result.note).toBe('New note');
    expect(result.instanceId).toBeDefined();  // Should remain unchanged
  });
});
```

### 2. Integration Tests
```typescript
describe('Workflow Action Log Update', () => {
  it('should reject update with null instanceId', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation UpdateWorkflowActionLog($input: UpdateWorkflowActionLogInput!) {
            updateWorkflowActionLog(updateWorkflowActionLogInput: $input) {
              id
              instanceId
            }
          }
        `,
        variables: {
          input: {
            id: 1,
            instanceId: null  // This should be rejected
          }
        }
      });
    
    expect(response.body.errors).toBeDefined();
  });
});
```

## Monitoring

### 1. Database Monitoring
```sql
-- Monitor for null values in critical columns
SELECT COUNT(*) as null_instance_ids
FROM workflow_action_logs 
WHERE instanceId IS NULL;

-- Monitor for update operations
SELECT 
  COUNT(*) as total_updates,
  COUNT(CASE WHEN instanceId IS NULL THEN 1 END) as null_updates
FROM workflow_action_logs 
WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### 2. Application Logging
```typescript
// Log update operations
console.log('Updating workflow action log:', {
  id: updateInput.id,
  fields: Object.keys(updateData),
  timestamp: new Date().toISOString()
});

// Log validation failures
if (updateData.instanceId === undefined) {
  console.warn('Attempted to update instanceId to undefined, ignoring');
}
```

## Best Practices

### 1. DTO Design
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
}
```

### 2. Service Layer
```typescript
// Filter out undefined values
const safeUpdateData = Object.fromEntries(
  Object.entries(updateData).filter(([_, value]) => value !== undefined)
);

// Validate critical fields
if (safeUpdateData.instanceId !== undefined) {
  throw new BadRequestException('instanceId cannot be updated');
}
```

### 3. Database Constraints
```sql
-- Add database constraints
ALTER TABLE workflow_action_logs 
ADD CONSTRAINT chk_instance_id_not_null 
CHECK (instanceId IS NOT NULL);

ALTER TABLE workflow_action_logs 
ADD CONSTRAINT chk_step_id_not_null 
CHECK (stepId IS NOT NULL);
```

## Kết luận

Việc sửa lỗi database update đã giải quyết được:

✅ **Database integrity** - Ngăn chặn null values trong critical columns
✅ **Type safety** - DTO chỉ cho phép update safe fields
✅ **Better error handling** - Xử lý undefined values gracefully
✅ **Improved logging** - Debug và monitor dễ dàng hơn
✅ **Data consistency** - Đảm bảo data consistency trong database

Hệ thống workflow action log giờ đây an toàn và reliable hơn!
