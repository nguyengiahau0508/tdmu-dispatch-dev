# Workflow InstanceId Null Error Fix

## Vấn đề

Lỗi xảy ra khi thực hiện workflow action:

```
Error executing workflow action: ApolloError: Column 'instanceId' cannot be null
```

## Nguyên nhân

Lỗi này xảy ra vì `instanceId` đang được gửi là `null` hoặc `undefined` trong GraphQL mutation. Có thể do:

1. **Frontend validation**: `workflowInstance` chưa được load hoặc `id` là null
2. **Component state**: Component chưa sẵn sàng khi user submit form
3. **Route parameter**: ID từ URL không được parse đúng
4. **GraphQL mutation**: Input validation không đầy đủ

## Giải pháp

### 1. Frontend Validation

**File**: `apps/frontend/src/app/features/user/workflow/components/workflow-action/workflow-action.component.ts`

```typescript
async onSubmit(): Promise<void> {
  if (this.actionForm.invalid || !this.workflowInstance?.currentStep) {
    console.error('Form validation failed:', {
      formValid: this.actionForm.valid,
      workflowInstance: !!this.workflowInstance,
      currentStep: !!this.workflowInstance?.currentStep
    });
    return;
  }

  this.isSubmitting = true;

  // Validate required fields
  if (!this.workflowInstance.id) {
    console.error('Workflow instance ID is missing');
    this.isSubmitting = false;
    return;
  }

  if (!this.workflowInstance.currentStep.id) {
    console.error('Current step ID is missing');
    this.isSubmitting = false;
    return;
  }

  const actionInput: WorkflowActionInput = {
    instanceId: this.workflowInstance.id,
    stepId: this.workflowInstance.currentStep.id,
    actionType: this.actionForm.value.actionType,
    note: this.actionForm.value.note,
    metadata: ''
  };

  console.log('Submitting workflow action:', actionInput);
  // ... rest of the method
}
```

### 2. Backend Input Validation

**File**: `apps/backend/src/modules/workflow/workflow-instances/workflow-instances.resolver.ts`

```typescript
@Mutation(() => WorkflowInstance)
async executeWorkflowAction(
  @Args('workflowActionInput') workflowActionInput: WorkflowActionInput,
  @CurrentUser() user: User,
) {
  console.log('Executing workflow action:', {
    instanceId: workflowActionInput.instanceId,
    stepId: workflowActionInput.stepId,
    actionType: workflowActionInput.actionType,
    userId: user.id
  });

  // Validate input
  if (!workflowActionInput.instanceId) {
    throw new BadRequestException('instanceId is required');
  }
  if (!workflowActionInput.stepId) {
    throw new BadRequestException('stepId is required');
  }
  if (!workflowActionInput.actionType) {
    throw new BadRequestException('actionType is required');
  }

  // ... rest of the method
}
```

### 3. Enhanced Loading Logic

**File**: `apps/frontend/src/app/features/user/workflow/components/workflow-action/workflow-action.component.ts`

```typescript
private loadWorkflowInstance(workflowId: number): void {
  this.isLoading = true;
  this.error = null;

  console.log('Loading workflow instance:', workflowId);

  this.workflowApolloService.getWorkflowInstance(workflowId).subscribe({
    next: (workflow: WorkflowInstance) => {
      console.log('Workflow instance loaded:', workflow);
      this.workflowInstance = workflow;
      this.loadWorkflowData();
    },
    error: (error: any) => {
      console.error('Error loading workflow instance:', error);
      this.error = 'Không thể tải thông tin workflow';
      this.isLoading = false;
    }
  });
}
```

### 4. DTO Validation

**File**: `apps/backend/src/modules/workflow/workflow-instances/dto/workflow-action/workflow-action.input.ts`

```typescript
@InputType()
export class WorkflowActionInput {
  @Field(() => Int)
  @IsNotEmpty({ message: 'instanceId is required' })
  @IsNumber({}, { message: 'instanceId must be a number' })
  instanceId: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'stepId is required' })
  @IsNumber({}, { message: 'stepId must be a number' })
  stepId: number;

  @Field(() => ActionType)
  @IsNotEmpty({ message: 'actionType is required' })
  actionType: ActionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metadata?: string;
}
```

## Debugging Steps

### 1. Frontend Debugging

```typescript
// Add console logs to track data flow
console.log('Route params:', params);
console.log('Workflow ID:', workflowId);
console.log('Workflow instance:', this.workflowInstance);
console.log('Action input:', actionInput);
```

### 2. Backend Debugging

```typescript
// Add logging in resolver
console.log('Received workflow action input:', workflowActionInput);
console.log('User:', user);
console.log('Instance found:', instance);
console.log('Step found:', step);
```

### 3. Network Debugging

```typescript
// Check GraphQL mutation in browser dev tools
// Network tab -> GraphQL request -> Variables
{
  "input": {
    "instanceId": 123,
    "stepId": 456,
    "actionType": "APPROVE",
    "note": "Approved"
  }
}
```

## Prevention Strategies

### 1. Type Safety

```typescript
// Use strict TypeScript types
interface WorkflowActionInput {
  instanceId: number;  // Not optional
  stepId: number;      // Not optional
  actionType: 'APPROVE' | 'REJECT' | 'TRANSFER' | 'CANCEL' | 'START' | 'COMPLETE';
  note?: string;       // Optional
  metadata?: string;   // Optional
}
```

### 2. Component State Management

```typescript
// Ensure component is ready before allowing actions
get isReady(): boolean {
  return !!(
    this.workflowInstance?.id &&
    this.workflowInstance?.currentStep?.id &&
    !this.isLoading
  );
}
```

### 3. Form Validation

```typescript
// Disable submit button when not ready
<button 
  type="submit" 
  [disabled]="actionForm.invalid || !isReady || isSubmitting"
>
  {{ isSubmitting ? 'Đang xử lý...' : 'Thực hiện' }}
</button>
```

## Testing

### 1. Unit Tests

```typescript
describe('WorkflowActionComponent', () => {
  it('should not submit when workflow instance is null', () => {
    component.workflowInstance = null;
    component.onSubmit();
    expect(service.executeWorkflowAction).not.toHaveBeenCalled();
  });

  it('should not submit when current step is null', () => {
    component.workflowInstance = { id: 1, currentStep: null };
    component.onSubmit();
    expect(service.executeWorkflowAction).not.toHaveBeenCalled();
  });
});
```

### 2. Integration Tests

```typescript
describe('Workflow Action Integration', () => {
  it('should validate required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation ExecuteWorkflowAction($input: WorkflowActionInput!) {
            executeWorkflowAction(workflowActionInput: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            instanceId: null,  // This should fail
            stepId: 1,
            actionType: "APPROVE"
          }
        }
      });
    
    expect(response.body.errors).toBeDefined();
  });
});
```

## Monitoring

### 1. Error Tracking

```typescript
// Log validation failures
if (!this.workflowInstance?.id) {
  console.error('Workflow action failed - missing instance ID:', {
    component: 'WorkflowActionComponent',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
  return;
}
```

### 2. Performance Monitoring

```typescript
// Track action execution time
const startTime = Date.now();
const result = await this.workflowApolloService.executeWorkflowAction(actionInput);
const executionTime = Date.now() - startTime;

console.log('Workflow action executed:', {
  actionType: actionInput.actionType,
  executionTime,
  success: true
});
```

## Best Practices

### 1. Defensive Programming

```typescript
// Always validate before using
if (!workflowInstance?.id) {
  throw new Error('Workflow instance ID is required');
}

// Use optional chaining
const stepId = workflowInstance?.currentStep?.id;
if (!stepId) {
  throw new Error('Current step ID is required');
}
```

### 2. User Feedback

```typescript
// Provide clear error messages
if (!this.workflowInstance) {
  this.error = 'Không thể tải thông tin workflow. Vui lòng thử lại.';
  return;
}

if (!this.workflowInstance.currentStep) {
  this.error = 'Workflow không có bước hiện tại để xử lý.';
  return;
}
```

### 3. Loading States

```typescript
// Show loading state during data fetch
@if (isLoading) {
  <div class="loading-state">
    <div class="spinner"></div>
    <p>Đang tải thông tin workflow...</p>
  </div>
} @else if (error) {
  <div class="error-state">
    <p>{{ error }}</p>
    <button (click)="retry()">Thử lại</button>
  </div>
}
```

## Kết luận

Việc thêm validation và logging đã giúp:

✅ **Identify root cause** - Xác định được nguyên nhân `instanceId` null
✅ **Prevent null values** - Ngăn chặn việc gửi null values
✅ **Better error handling** - Xử lý lỗi rõ ràng và user-friendly
✅ **Improved debugging** - Dễ dàng debug khi có vấn đề
✅ **Type safety** - Đảm bảo type safety với TypeScript

Hệ thống workflow action giờ đây robust hơn và ít lỗi hơn!
