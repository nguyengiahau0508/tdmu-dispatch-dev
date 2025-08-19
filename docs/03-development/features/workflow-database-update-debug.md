# Workflow Database Update Debug

## Vấn đề

Lỗi xảy ra sau khi tạo action log thành công:

```
Workflow action log saved: WorkflowActionLog { id: 7, instanceId: 3, ... }
QueryFailedError: Column 'instanceId' cannot be null
UPDATE `workflow_action_log` SET `instanceId` = NULL WHERE `id` = 7
```

## Phân tích

### 1. Action Log Creation
- ✅ **Tạo thành công**: Action log được tạo với `id: 7`, `instanceId: 3`
- ✅ **Data đúng**: Tất cả fields đều có giá trị hợp lệ
- ✅ **Save thành công**: Record được lưu vào database

### 2. Update Query Problem
- ❌ **UPDATE query**: Có một UPDATE query khác đang set `instanceId = NULL`
- ❌ **Timing**: Xảy ra sau khi tạo action log thành công
- ❌ **Target**: Cùng record với `id = 7`

## Nguyên nhân có thể

### 1. TypeORM Relations Loading
```typescript
// Khi load relations, TypeORM có thể trigger update queries
const instance = await this.repository.findOne({
  where: { id },
  relations: [
    'template',
    'currentStep', 
    'createdByUser',
    'logs',           // ← Có thể gây vấn đề
    'logs.actionByUser',
    'logs.step',      // ← Có thể gây vấn đề
  ],
});
```

### 2. Cascade Operations
```typescript
// Entity relations có thể có cascade options
@ManyToOne(() => WorkflowInstance, (instance) => instance.logs)
@JoinColumn({ name: 'instanceId' })
instance: WorkflowInstance;
```

### 3. Entity State Management
```typescript
// Khi entity được load và modified, TypeORM có thể auto-save
const log = await this.repository.findOne({ where: { id: 7 } });
// Nếu log.instance được set thành undefined, có thể trigger update
```

## Giải pháp Debug

### 1. Thêm Logging vào findOne Method

**File**: `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.service.ts`

```typescript
async findOne(id: number): Promise<WorkflowInstance> {
  console.log('Finding workflow instance:', id);
  
  const instance = await this.repository.findOne({
    where: { id },
    relations: [
      'template',
      'currentStep',
      'createdByUser',
      'logs',
      'logs.actionByUser',
      'logs.step',
    ],
  });

  if (!instance) {
    throw new NotFoundException(`Workflow instance with ID ${id} not found`);
  }

  console.log('Found workflow instance:', {
    id: instance.id,
    logsCount: instance.logs?.length,
    logs: instance.logs?.map(log => ({
      id: log.id,
      instanceId: log.instanceId,
      stepId: log.stepId,
      actionType: log.actionType
    }))
  });

  return instance;
}
```

### 2. Thêm Logging vào handleApproveAction

```typescript
private async handleApproveAction(
  instance: WorkflowInstance,
  currentStep: any,
): Promise<WorkflowInstance> {
  console.log('Handling approve action for instance:', instance.id);
  
  // Find next step
  const nextStep = await this.workflowStepsService.findNextStep(
    currentStep.id,
  );

  console.log('Next step found:', nextStep?.id || 'No next step');

  if (nextStep) {
    // Move to next step
    console.log('Moving to next step:', nextStep.id);
    instance.currentStepId = nextStep.id;
    await this.repository.save(instance);
    console.log('Instance saved with new step');
  } else {
    // No next step, complete workflow
    console.log('Completing workflow');
    instance.status = WorkflowStatus.COMPLETED;
    instance.currentStepId = 0;
    await this.repository.save(instance);
    console.log('Instance saved as completed');
  }

  console.log('Returning updated instance');
  return this.findOne(instance.id);
}
```

### 3. Thêm Logging vào logAction Method

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

## Debugging Steps

### 1. Monitor Database Queries
```sql
-- Enable query logging in MySQL
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/query.log';

-- Monitor specific table
SELECT * FROM mysql.general_log 
WHERE argument LIKE '%workflow_action_log%' 
ORDER BY event_time DESC 
LIMIT 10;
```

### 2. TypeORM Query Logging
```typescript
// Enable TypeORM query logging
{
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'tdmu_dispatch',
  logging: true,  // ← Enable this
  logger: 'advanced-console'
}
```

### 3. Entity State Tracking
```typescript
// Track entity state changes
const log = await this.repository.findOne({ where: { id: 7 } });
console.log('Entity state before:', {
  id: log.id,
  instanceId: log.instanceId,
  hasInstance: !!log.instance
});

// After any operation
console.log('Entity state after:', {
  id: log.id,
  instanceId: log.instanceId,
  hasInstance: !!log.instance
});
```

## Potential Solutions

### 1. Disable Auto-Save
```typescript
// Use query builder to avoid auto-save
const instance = await this.repository
  .createQueryBuilder('instance')
  .leftJoinAndSelect('instance.logs', 'logs')
  .leftJoinAndSelect('logs.actionByUser', 'actionByUser')
  .leftJoinAndSelect('logs.step', 'step')
  .where('instance.id = :id', { id })
  .getOne();
```

### 2. Explicit Save Control
```typescript
// Only save when explicitly needed
const log = this.repository.create({...});
const savedLog = await this.repository.save(log);

// Don't let TypeORM auto-save relations
return savedLog;
```

### 3. Cascade Options
```typescript
// Review and fix cascade options in entities
@ManyToOne(() => WorkflowInstance, (instance) => instance.logs, {
  cascade: false,  // ← Disable cascade
  onDelete: 'CASCADE'
})
@JoinColumn({ name: 'instanceId' })
instance: WorkflowInstance;
```

## Testing Strategy

### 1. Isolate the Problem
```typescript
// Test only action log creation
const log = await this.workflowActionLogsService.logAction(
  instanceId,
  stepId,
  actionType,
  user,
  note,
  metadata
);
console.log('Log created successfully:', log.id);

// Test only instance loading
const instance = await this.workflowInstancesService.findOne(instanceId);
console.log('Instance loaded successfully:', instance.id);
```

### 2. Step-by-Step Execution
```typescript
// Execute each step separately
console.log('Step 1: Create action log');
const log = await this.logAction(...);

console.log('Step 2: Handle approve action');
const result = await this.handleApproveAction(...);

console.log('Step 3: Return instance');
return this.findOne(instanceId);
```

### 3. Database State Verification
```sql
-- Check database state after each step
SELECT id, instanceId, stepId, actionType 
FROM workflow_action_log 
WHERE id = 7;

-- Check for any pending transactions
SHOW ENGINE INNODB STATUS;
```

## Monitoring

### 1. Application Logs
```typescript
// Add comprehensive logging
console.log('=== Workflow Action Execution ===');
console.log('Input:', { instanceId, stepId, actionType, userId });
console.log('Step 1: Log action');
console.log('Step 2: Handle action');
console.log('Step 3: Return result');
console.log('=== Execution Complete ===');
```

### 2. Database Monitoring
```sql
-- Monitor for null updates
SELECT 
  COUNT(*) as total_updates,
  COUNT(CASE WHEN instanceId IS NULL THEN 1 END) as null_updates
FROM workflow_action_log 
WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### 3. Performance Monitoring
```typescript
// Track execution time
const startTime = Date.now();
const result = await this.executeAction(actionInput, user);
const executionTime = Date.now() - startTime;

console.log('Action execution time:', executionTime + 'ms');
```

## Next Steps

1. **Run with logging** - Test với logging để xác định chính xác step nào gây lỗi
2. **Isolate problem** - Tách riêng từng step để test
3. **Review entity relations** - Kiểm tra cascade options và relations
4. **Consider query builder** - Sử dụng query builder thay vì relations loading
5. **Add database constraints** - Thêm constraints để ngăn null values

## Expected Log Output

Với logging đã thêm, bạn sẽ thấy:

```
Creating workflow action log: { instanceId: 3, stepId: 2, actionType: 'APPROVE', userId: 5 }
Workflow action log entity created: WorkflowActionLog { id: undefined, instanceId: 3, ... }
Workflow action log saved: WorkflowActionLog { id: 7, instanceId: 3, ... }
Handling approve action for instance: 3
Next step found: 4
Moving to next step: 4
Instance saved with new step
Returning updated instance
Finding workflow instance: 3
Found workflow instance: { id: 3, logsCount: 1, logs: [{ id: 7, instanceId: 3, ... }] }
```

Nếu có lỗi, nó sẽ xảy ra sau các logs này và chúng ta sẽ biết chính xác step nào gây vấn đề.
