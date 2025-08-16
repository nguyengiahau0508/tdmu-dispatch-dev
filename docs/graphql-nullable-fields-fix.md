# GraphQL Nullable Fields Fix

## Vấn đề

Lỗi GraphQL xảy ra khi backend trả về `null` cho field được định nghĩa là non-nullable trong schema:

```
[GraphQL error]: Message: Cannot return null for non-nullable field WorkflowActionLog.actionByUser.
```

## Nguyên nhân

1. **Database có dữ liệu null**: Một số `WorkflowActionLog` records có `actionByUserId` nhưng user đã bị xóa
2. **Schema mismatch**: GraphQL schema định nghĩa `actionByUser` là non-nullable nhưng thực tế có thể null
3. **Missing relations**: Backend không load đầy đủ relations

## Giải pháp

### 1. Cập nhật GraphQL Schema

**File**: `apps/backend/src/modules/workflow/workflow-action-logs/entities/workflow-action-log.entity.ts`

```typescript
// Trước
@Field(() => User)
@ManyToOne(() => User)
@JoinColumn({ name: 'actionByUserId' })
actionByUser: User;

// Sau
@Field(() => User, { nullable: true })
@ManyToOne(() => User)
@JoinColumn({ name: 'actionByUserId' })
actionByUser: User;
```

### 2. Cập nhật Frontend Model

**File**: `apps/frontend/src/app/features/user/workflow/models/workflow-instance.model.ts`

```typescript
// Trước
export interface WorkflowActionLog {
  id: number;
  actionType: string;
  actionByUser: {
    id: number;
    fullName: string;
  };
  actionAt: string;
  note?: string;
  createdAt: string;
}

// Sau
export interface WorkflowActionLog {
  id: number;
  actionType: string;
  actionByUser?: {
    id: number;
    fullName: string;
  };
  actionAt: string;
  note?: string;
  createdAt: string;
}
```

### 3. Cập nhật Backend Relations

**File**: `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.service.ts`

```typescript
// Thêm 'logs.actionByUser' vào tất cả relations
async findAll(): Promise<WorkflowInstance[]> {
  return this.repository.find({
    relations: [
      'template', 
      'currentStep', 
      'createdByUser', 
      'logs', 
      'logs.actionByUser'  // Thêm dòng này
    ],
    order: { createdAt: 'DESC' },
  });
}

async findByUser(userId: number): Promise<WorkflowInstance[]> {
  return this.repository.find({
    where: { createdByUserId: userId },
    relations: [
      'template', 
      'currentStep', 
      'createdByUser', 
      'logs', 
      'logs.actionByUser'  // Thêm dòng này
    ],
    order: { createdAt: 'DESC' },
  });
}

async findByCurrentStepAssignee(assignedRole: string): Promise<WorkflowInstance[]> {
  return this.repository
    .createQueryBuilder('instance')
    .leftJoinAndSelect('instance.template', 'template')
    .leftJoinAndSelect('instance.currentStep', 'currentStep')
    .leftJoinAndSelect('instance.createdByUser', 'createdByUser')
    .leftJoinAndSelect('instance.logs', 'logs')
    .leftJoinAndSelect('logs.actionByUser', 'actionByUser')  // Thêm dòng này
    .where('currentStep.assignedRole = :assignedRole', { assignedRole })
    .andWhere('instance.status = :status', {
      status: WorkflowStatus.IN_PROGRESS,
    })
    .orderBy('instance.createdAt', 'DESC')
    .getMany();
}
```

### 4. Cập nhật Frontend Template

**File**: `apps/frontend/src/app/features/user/workflow/components/workflow-instance-detail/workflow-instance-detail.ts`

```typescript
// Trước
<p class="action-user">{{ log.actionByUser.fullName }}</p>

// Sau
<p class="action-user">{{ log.actionByUser ? log.actionByUser.fullName : 'Không xác định' }}</p>
```

## Các bước kiểm tra

### 1. Kiểm tra Database

```sql
-- Kiểm tra logs có actionByUserId nhưng user không tồn tại
SELECT wl.id, wl.actionByUserId, u.id as user_id
FROM workflow_action_logs wl
LEFT JOIN users u ON wl.actionByUserId = u.id
WHERE wl.actionByUserId IS NOT NULL AND u.id IS NULL;
```

### 2. Kiểm tra GraphQL Schema

```graphql
# Kiểm tra schema đã được cập nhật
query IntrospectionQuery {
  __schema {
    types {
      name
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
}
```

### 3. Test API

```bash
# Test query với Apollo Client
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { myPendingWorkflows { id logs { id actionByUser { id fullName } } } }"
  }'
```

## Best Practices

### 1. Database Constraints

```sql
-- Thêm foreign key constraint với CASCADE DELETE
ALTER TABLE workflow_action_logs 
ADD CONSTRAINT fk_action_by_user 
FOREIGN KEY (actionByUserId) 
REFERENCES users(id) 
ON DELETE SET NULL;
```

### 2. GraphQL Schema Design

```typescript
// Luôn cân nhắc nullable cho optional relationships
@Field(() => User, { nullable: true })
@ManyToOne(() => User)
@JoinColumn({ name: 'actionByUserId' })
actionByUser: User;

// Sử dụng non-nullable chỉ cho required fields
@Field(() => Int)
@Column()
actionByUserId: number;
```

### 3. Frontend Error Handling

```typescript
// Handle null values gracefully
getActionUserDisplay(log: WorkflowActionLog): string {
  if (!log.actionByUser) {
    return 'Không xác định';
  }
  return log.actionByUser.fullName || 'Người dùng không tên';
}
```

### 4. TypeScript Strict Mode

```typescript
// Sử dụng strict null checks
interface WorkflowActionLog {
  id: number;
  actionType: string;
  actionByUser?: {  // Optional field
    id: number;
    fullName: string;
  };
  actionAt: string;
  note?: string;
  createdAt: string;
}
```

## Monitoring

### 1. GraphQL Error Logging

```typescript
// Log GraphQL errors
apollo.watchQuery<any>({
  query: GET_MY_PENDING_WORKFLOWS
}).valueChanges.pipe(
  catchError((error: any) => {
    console.error('GraphQL Error:', error);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err: any) => {
        console.error('GraphQL Error Details:', err.message, err.path);
      });
    }
    return throwError(() => error);
  })
);
```

### 2. Database Monitoring

```sql
-- Monitor orphaned records
SELECT COUNT(*) as orphaned_logs
FROM workflow_action_logs wl
LEFT JOIN users u ON wl.actionByUserId = u.id
WHERE wl.actionByUserId IS NOT NULL AND u.id IS NULL;
```

## Kết luận

Việc sửa lỗi GraphQL nullable fields cần:

1. **Cập nhật schema** để phản ánh đúng thực tế dữ liệu
2. **Load đầy đủ relations** trong backend queries
3. **Handle null values** trong frontend templates
4. **Sử dụng TypeScript strict mode** để catch errors sớm
5. **Monitor và log errors** để phát hiện vấn đề kịp thời

Điều này đảm bảo hệ thống hoạt động ổn định và user experience tốt hơn.
