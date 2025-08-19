# GraphQL Context Error Fix

## Vấn đề

Lỗi xảy ra khi thực hiện workflow action:

```
Error executing workflow action: ApolloError: Cannot read properties of undefined (reading 'req')
```

## Nguyên nhân

Lỗi này xảy ra vì `WorkflowActionGuard` không thể truy cập được `req` object từ GraphQL context. Có thể do:

1. **Context structure**: GraphQL context không có `req` property
2. **Guard execution order**: Guard chạy trước khi context được thiết lập
3. **Authentication flow**: User chưa được đặt vào request context

## Giải pháp

### 1. Thay thế Guard bằng Permission Check trong Resolver

**Trước**: Sử dụng `WorkflowActionGuard`
```typescript
@Mutation(() => WorkflowInstance)
@UseGuards(WorkflowActionGuard)
executeWorkflowAction(
  @Args('workflowActionInput') workflowActionInput: WorkflowActionInput,
  @CurrentUser() user: User,
) {
  return this.workflowInstancesService.executeAction(workflowActionInput, user);
}
```

**Sau**: Kiểm tra quyền trực tiếp trong resolver
```typescript
@Mutation(() => WorkflowInstance)
async executeWorkflowAction(
  @Args('workflowActionInput') workflowActionInput: WorkflowActionInput,
  @CurrentUser() user: User,
) {
  // Kiểm tra quyền trực tiếp trong resolver
  const instance = await this.workflowInstancesService.findOne(
    workflowActionInput.instanceId,
  );
  
  if (!instance.currentStep) {
    throw new BadRequestException('Workflow instance does not have a current step');
  }
  
  const step = await this.workflowStepsService.findOne(
    workflowActionInput.stepId,
  );
  
  const canPerform = this.workflowPermissionsService.canPerformAction(
    user,
    step,
    workflowActionInput.actionType as ActionType,
  );
  
  if (!canPerform) {
    throw new BadRequestException(
      `User does not have permission to perform ${workflowActionInput.actionType} on this workflow step`,
    );
  }
  
  return this.workflowInstancesService.executeAction(
    workflowActionInput,
    user,
  );
}
```

### 2. Inject Services vào Resolver

**File**: `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.resolver.ts`

```typescript
import { WorkflowPermissionsService } from '../workflow-permissions/workflow-permissions.service';
import { WorkflowStepsService } from '../workflow-steps/workflow-steps.service';

@Resolver(() => WorkflowInstance)
export class WorkflowInstancesResolver {
  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly workflowPermissionsService: WorkflowPermissionsService,
    private readonly workflowStepsService: WorkflowStepsService,
  ) {}
}
```

### 3. Cập nhật Module Imports

**File**: `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowInstance]),
    WorkflowStepsModule,
    WorkflowActionLogsModule,
    WorkflowTemplatesModule,
    forwardRef(() => WorkflowPermissionsModule),
  ],
  providers: [WorkflowInstancesResolver, WorkflowInstancesService],
  exports: [WorkflowInstancesService],
})
export class WorkflowInstancesModule {}
```

## Lợi ích của giải pháp

### 1. Đơn giản hóa
- **Không cần guard**: Loại bỏ complexity của GraphQL guards
- **Direct access**: Truy cập trực tiếp services và user context
- **Better error handling**: Xử lý lỗi rõ ràng hơn

### 2. Performance
- **Fewer layers**: Giảm số layer trong execution stack
- **Direct injection**: Services được inject trực tiếp
- **No context overhead**: Không cần truy cập GraphQL context

### 3. Maintainability
- **Clear logic**: Logic permission check rõ ràng trong resolver
- **Easy testing**: Dễ dàng test resolver methods
- **Better debugging**: Stack trace rõ ràng hơn

## Testing

### 1. Unit Tests
```typescript
describe('WorkflowInstancesResolver', () => {
  it('should execute workflow action with valid permissions', async () => {
    const mockUser = { id: 1, roles: ['CLERK'] };
    const mockInstance = { id: 1, currentStep: { id: 1 } };
    const mockStep = { id: 1, assignedRole: 'CLERK' };
    
    jest.spyOn(service, 'findOne').mockResolvedValue(mockInstance);
    jest.spyOn(permissionsService, 'canPerformAction').mockReturnValue(true);
    
    const result = await resolver.executeWorkflowAction(
      { instanceId: 1, stepId: 1, actionType: 'APPROVE' },
      mockUser
    );
    
    expect(result).toBeDefined();
  });
});
```

### 2. Integration Tests
```typescript
describe('Workflow Action Integration', () => {
  it('should reject action without permissions', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation ExecuteWorkflowAction($input: WorkflowActionInput!) {
            executeWorkflowAction(workflowActionInput: $input) {
              id
              status
            }
          }
        `,
        variables: {
          input: {
            instanceId: 1,
            stepId: 1,
            actionType: "APPROVE"
          }
        }
      })
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.body.errors).toBeDefined();
  });
});
```

## Monitoring

### 1. Error Tracking
```typescript
// Log permission check failures
if (!canPerform) {
  console.error('Permission denied:', {
    userId: user.id,
    actionType: workflowActionInput.actionType,
    stepId: workflowActionInput.stepId,
    instanceId: workflowActionInput.instanceId
  });
  throw new BadRequestException('Permission denied');
}
```

### 2. Performance Monitoring
```typescript
// Track execution time
const startTime = Date.now();
const result = await this.workflowInstancesService.executeAction(
  workflowActionInput,
  user,
);
const executionTime = Date.now() - startTime;

console.log('Workflow action executed:', {
  actionType: workflowActionInput.actionType,
  executionTime,
  userId: user.id
});
```

## Best Practices

### 1. Error Handling
- **Specific errors**: Sử dụng specific error messages
- **User feedback**: Cung cấp thông tin hữu ích cho user
- **Logging**: Log errors để debugging

### 2. Permission Checks
- **Early validation**: Kiểm tra quyền sớm trong resolver
- **Clear messages**: Thông báo lỗi rõ ràng
- **Role-based**: Kiểm tra theo role và context

### 3. Performance
- **Efficient queries**: Sử dụng efficient database queries
- **Caching**: Cache permission checks khi có thể
- **Batch operations**: Batch multiple operations

## Kết luận

Việc thay thế `WorkflowActionGuard` bằng permission check trực tiếp trong resolver đã giải quyết được:

✅ **GraphQL context error** - Không còn lỗi `Cannot read properties of undefined (reading 'req')`
✅ **Simplified architecture** - Loại bỏ complexity của guards
✅ **Better error handling** - Xử lý lỗi rõ ràng và user-friendly
✅ **Improved performance** - Giảm overhead của context access
✅ **Easier testing** - Dễ dàng test và debug

Hệ thống workflow action giờ đây hoạt động ổn định và reliable!
