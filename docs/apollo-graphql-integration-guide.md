# Apollo GraphQL Integration Guide

## Tổng quan

Hướng dẫn tích hợp Apollo Client với GraphQL cho workflow module trong hệ thống TDMU Dispatch.

## Cấu trúc Backend GraphQL

### 1. Workflow Permissions DTOs

```typescript
// apps/backend/src/modules/workflow/workflow-permissions/dto/workflow-permission.dto.ts

@ObjectType()
export class WorkflowPermissionDto {
  @Field(() => Int)
  instanceId: number;

  @Field(() => Int)
  stepId: number;

  @Field()
  actionType: string;

  @Field()
  canPerform: boolean;

  @Field({ nullable: true })
  reason?: string;
}

@ObjectType()
export class WorkflowViewPermissionDto {
  @Field(() => Int)
  instanceId: number;

  @Field()
  canView: boolean;

  @Field({ nullable: true })
  reason?: string;
}

@ObjectType()
export class AvailableActionsDto {
  @Field(() => Int)
  stepId: number;

  @Field(() => [String])
  availableActions: string[];
}
```

### 2. Workflow Permissions Resolver

```typescript
// apps/backend/src/modules/workflow/workflow-permissions/workflow-permissions.resolver.ts

@Resolver()
@UseGuards(GqlAuthGuard)
export class WorkflowPermissionsResolver {
  @Query(() => WorkflowPermissionDto, {
    name: 'checkWorkflowPermission',
    description: 'Kiểm tra user có thể thực hiện action trên workflow step không',
  })
  async checkWorkflowPermission(
    @Args('input') input: CheckWorkflowPermissionInput,
    @CurrentUser() user: User,
  ): Promise<WorkflowPermissionDto> {
    const step = await this.workflowStepsService.findOne(input.stepId);
    const canPerform = this.workflowPermissionsService.canPerformAction(user, step, input.actionType as ActionType);
    
    return {
      instanceId: input.instanceId,
      stepId: input.stepId,
      actionType: input.actionType,
      canPerform,
      reason: canPerform ? undefined : 'Không có quyền thực hiện hành động này'
    };
  }

  @Query(() => [String], {
    name: 'workflowRoles',
    description: 'Lấy danh sách các vai trò có thể gán cho workflow step',
  })
  getRoles() {
    return [
      'SYSTEM_ADMIN',
      'UNIVERSITY_LEADER',
      'DEPARTMENT_HEAD',
      'DEPARTMENT_STAFF',
      'CLERK',
      'DEGREE_MANAGER',
      'BASIC_USER',
    ];
  }

  @Query(() => [String], {
    name: 'workflowActionTypes',
    description: 'Lấy danh sách các loại hành động trong workflow',
  })
  getActionTypes() {
    return Object.values(ActionType);
  }
}
```

## Frontend Apollo Client Integration

### 1. WorkflowApolloService

```typescript
// apps/frontend/src/app/features/user/workflow/services/workflow-apollo.service.ts

@Injectable({
  providedIn: 'root'
})
export class WorkflowApolloService {
  constructor(private apollo: Apollo) {}

  // Workflow Instances
  getMyPendingWorkflows(): Observable<WorkflowInstance[]> {
    return this.apollo.watchQuery<any>({
      query: GET_MY_PENDING_WORKFLOWS
    }).valueChanges.pipe(
      map(result => result.data.myPendingWorkflows)
    );
  }

  // Workflow Actions
  executeWorkflowAction(actionInput: WorkflowActionInput): Observable<WorkflowInstance> {
    return this.apollo.mutate<any>({
      mutation: EXECUTE_WORKFLOW_ACTION,
      variables: { input: actionInput }
    }).pipe(
      map(result => result.data.executeWorkflowAction)
    );
  }

  // Workflow Permissions
  checkWorkflowPermission(input: {
    instanceId: number;
    stepId: number;
    actionType: string;
  }): Observable<{
    instanceId: number;
    stepId: number;
    actionType: string;
    canPerform: boolean;
    reason?: string;
  }> {
    return this.apollo.watchQuery<any>({
      query: CHECK_WORKFLOW_PERMISSION,
      variables: { input }
    }).valueChanges.pipe(
      map(result => result.data.checkWorkflowPermission)
    );
  }
}
```

### 2. GraphQL Queries

```typescript
// GraphQL Queries
const GET_MY_PENDING_WORKFLOWS = gql`
  query GetMyPendingWorkflows {
    myPendingWorkflows {
      id
      templateId
      template {
        id
        name
        description
      }
      documentId
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
        orderNumber
      }
      status
      createdByUserId
      createdByUser {
        id
        fullName
        email
      }
      notes
      createdAt
      updatedAt
      logs {
        id
        actionType
        actionByUser {
          id
          fullName
        }
        actionAt
        note
        createdAt
      }
    }
  }
`;

const CHECK_WORKFLOW_PERMISSION = gql`
  query CheckWorkflowPermission($input: CheckWorkflowPermissionInput!) {
    checkWorkflowPermission(input: $input) {
      instanceId
      stepId
      actionType
      canPerform
      reason
    }
  }
`;
```

### 3. GraphQL Mutations

```typescript
// GraphQL Mutations
const EXECUTE_WORKFLOW_ACTION = gql`
  mutation ExecuteWorkflowAction($input: WorkflowActionInput!) {
    executeWorkflowAction(workflowActionInput: $input) {
      id
      status
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
      }
      logs {
        id
        actionType
        actionByUser {
          id
          fullName
        }
        actionAt
        note
        createdAt
      }
    }
  }
`;

const CREATE_WORKFLOW_INSTANCE = gql`
  mutation CreateWorkflowInstance($input: CreateWorkflowInstanceInput!) {
    createWorkflowInstance(createWorkflowInstanceInput: $input) {
      id
      templateId
      template {
        id
        name
        description
      }
      documentId
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
      }
      status
      createdByUserId
      createdByUser {
        id
        fullName
        email
      }
      notes
      createdAt
      updatedAt
    }
  }
`;
```

## Sử dụng trong Components

### 1. PendingDocumentsComponent

```typescript
@Component({
  selector: 'app-pending-documents',
  standalone: true,
  imports: [CommonModule],
  providers: [WorkflowApolloService],
  // ...
})
export class PendingDocumentsComponent implements OnInit {
  pendingDocuments: WorkflowInstance[] = [];
  isLoading = true;

  constructor(
    private workflowApolloService: WorkflowApolloService,
    private router: Router,
    private navigationService: WorkflowNavigationService
  ) {}

  ngOnInit(): void {
    this.loadPendingDocuments();
  }

  async loadPendingDocuments(): Promise<void> {
    this.isLoading = true;
    try {
      this.workflowApolloService.getMyPendingWorkflows().subscribe({
        next: (workflows: WorkflowInstance[]) => {
          console.log(workflows);
          this.pendingDocuments = workflows;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading pending documents:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error loading pending documents:', error);
      this.isLoading = false;
    }
  }
}
```

### 2. WorkflowActionComponent

```typescript
@Component({
  // ...
})
export class WorkflowActionComponent implements OnInit {
  @Input() workflowInstance?: WorkflowInstance;
  @Output() actionCompleted = new EventEmitter<WorkflowInstance>();
  @Output() actionCancelled = new EventEmitter<void>();
  
  actionForm: FormGroup;
  availableActions: string[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private workflowApolloService: WorkflowApolloService
  ) {
    this.actionForm = this.fb.group({
      actionType: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    if (this.workflowInstance) {
      this.loadAvailableActions();
    }
  }

  loadAvailableActions(): Promise<void> {
    if (!this.workflowInstance?.currentStepId) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.workflowApolloService.getAvailableActions(this.workflowInstance!.id).subscribe({
        next: (actions: string[]) => {
          this.availableActions = actions;
          resolve();
        },
        error: (error) => {
          console.error('Error loading available actions:', error);
          reject(error);
        }
      });
    });
  }

  onSubmit(): Promise<void> {
    if (this.actionForm.invalid || !this.workflowInstance) {
      return Promise.resolve();
    }

    this.isSubmitting = true;
    const formValue = this.actionForm.value;

    const actionInput: WorkflowActionInput = {
      instanceId: this.workflowInstance.id,
      stepId: this.workflowInstance.currentStepId!,
      actionType: formValue.actionType,
      note: formValue.note,
      metadata: ''
    };

    return new Promise((resolve, reject) => {
      this.workflowApolloService.executeWorkflowAction(actionInput).subscribe({
        next: (updatedInstance: WorkflowInstance) => {
          this.isSubmitting = false;
          this.actionCompleted.emit(updatedInstance);
          resolve();
        },
        error: (error) => {
          console.error('Error executing workflow action:', error);
          this.isSubmitting = false;
          reject(error);
        }
      });
    });
  }
}
```

## Cache Management

### 1. Refetch Queries

```typescript
// Refetch specific queries
refetchMyPendingWorkflows(): void {
  this.apollo.client.refetchQueries({
    include: ['GetMyPendingWorkflows']
  });
}

refetchMyWorkflowInstances(): void {
  this.apollo.client.refetchQueries({
    include: ['GetMyWorkflowInstances']
  });
}
```

### 2. Update Cache

```typescript
// Update cache after mutation
executeWorkflowAction(actionInput: WorkflowActionInput): Observable<WorkflowInstance> {
  return this.apollo.mutate<any>({
    mutation: EXECUTE_WORKFLOW_ACTION,
    variables: { input: actionInput },
    update: (cache, { data }) => {
      // Update cache manually if needed
      const existingData = cache.readQuery<any>({
        query: GET_MY_PENDING_WORKFLOWS
      });
      
      if (existingData) {
        cache.writeQuery({
          query: GET_MY_PENDING_WORKFLOWS,
          data: {
            myPendingWorkflows: existingData.myPendingWorkflows.filter(
              (workflow: WorkflowInstance) => workflow.id !== data.executeWorkflowAction.id
            )
          }
        });
      }
    }
  }).pipe(
    map(result => result.data.executeWorkflowAction)
  );
}
```

## Error Handling

### 1. GraphQL Errors

```typescript
// Handle GraphQL errors
getMyPendingWorkflows(): Observable<WorkflowInstance[]> {
  return this.apollo.watchQuery<any>({
    query: GET_MY_PENDING_WORKFLOWS
  }).valueChanges.pipe(
    map(result => result.data.myPendingWorkflows),
    catchError((error: any) => {
      console.error('GraphQL error:', error);
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach((err: any) => {
          console.error('GraphQL Error:', err.message);
        });
      }
      if (error.networkError) {
        console.error('Network Error:', error.networkError);
      }
      return throwError(() => error);
    })
  );
}
```

### 2. Network Errors

```typescript
// Handle network errors
executeWorkflowAction(actionInput: WorkflowActionInput): Observable<WorkflowInstance> {
  return this.apollo.mutate<any>({
    mutation: EXECUTE_WORKFLOW_ACTION,
    variables: { input: actionInput }
  }).pipe(
    map(result => result.data.executeWorkflowAction),
    catchError((error: any) => {
      if (error.networkError) {
        console.error('Network error:', error.networkError);
        // Show user-friendly error message
        return throwError(() => new Error('Không thể kết nối đến máy chủ'));
      }
      return throwError(() => error);
    })
  );
}
```

## Loading States

### 1. Query Loading States

```typescript
// Track loading state
getMyPendingWorkflows(): Observable<{ data: WorkflowInstance[]; loading: boolean }> {
  return this.apollo.watchQuery<any>({
    query: GET_MY_PENDING_WORKFLOWS
  }).valueChanges.pipe(
    map(result => ({
      data: result.data.myPendingWorkflows,
      loading: result.loading
    }))
  );
}
```

### 2. Component Loading States

```typescript
@Component({
  // ...
})
export class PendingDocumentsComponent implements OnInit {
  pendingDocuments: WorkflowInstance[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadPendingDocuments();
  }

  loadPendingDocuments(): void {
    this.isLoading = true;
    this.error = null;

    this.workflowApolloService.getMyPendingWorkflows().subscribe({
      next: (workflows: WorkflowInstance[]) => {
        this.pendingDocuments = workflows;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading pending documents:', error);
        this.error = 'Không thể tải danh sách văn bản';
        this.isLoading = false;
      }
    });
  }
}
```

## Optimistic Updates

### 1. Optimistic Response

```typescript
// Optimistic update for better UX
executeWorkflowAction(actionInput: WorkflowActionInput): Observable<WorkflowInstance> {
  return this.apollo.mutate<any>({
    mutation: EXECUTE_WORKFLOW_ACTION,
    variables: { input: actionInput },
    optimisticResponse: {
      executeWorkflowAction: {
        __typename: 'WorkflowInstance',
        id: actionInput.instanceId,
        status: 'IN_PROGRESS',
        currentStepId: actionInput.stepId,
        currentStep: {
          __typename: 'WorkflowStep',
          id: actionInput.stepId,
          name: 'Processing...',
          description: 'Đang xử lý...',
          type: 'APPROVAL',
          assignedRole: 'CURRENT_USER'
        },
        logs: []
      }
    }
  }).pipe(
    map(result => result.data.executeWorkflowAction)
  );
}
```

## Best Practices

### 1. Query Organization
- Tách queries thành constants riêng biệt
- Sử dụng descriptive names cho queries
- Group related queries together

### 2. Error Handling
- Handle GraphQL errors và network errors riêng biệt
- Provide user-friendly error messages
- Log errors for debugging

### 3. Loading States
- Show loading indicators cho tất cả async operations
- Disable buttons during mutations
- Provide feedback cho user actions

### 4. Cache Management
- Use refetchQueries cho data updates
- Update cache manually khi cần thiết
- Clear cache khi logout

### 5. Type Safety
- Define TypeScript interfaces cho GraphQL responses
- Use strict typing cho variables
- Validate data trước khi sử dụng

## Testing

### 1. Unit Testing

```typescript
describe('WorkflowApolloService', () => {
  let service: WorkflowApolloService;
  let apollo: Apollo;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowApolloService,
        {
          provide: Apollo,
          useValue: {
            watchQuery: jasmine.createSpy('watchQuery').and.returnValue({
              valueChanges: of({
                data: {
                  myPendingWorkflows: []
                }
              })
            }),
            mutate: jasmine.createSpy('mutate').and.returnValue(
              of({
                data: {
                  executeWorkflowAction: {}
                }
              })
            )
          }
        }
      ]
    });
    service = TestBed.inject(WorkflowApolloService);
    apollo = TestBed.inject(Apollo);
  });

  it('should get pending workflows', () => {
    service.getMyPendingWorkflows().subscribe(result => {
      expect(result).toEqual([]);
    });
  });
});
```

### 2. Integration Testing

```typescript
describe('PendingDocumentsComponent', () => {
  let component: PendingDocumentsComponent;
  let fixture: ComponentFixture<PendingDocumentsComponent>;
  let workflowService: jasmine.SpyObj<WorkflowApolloService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('WorkflowApolloService', ['getMyPendingWorkflows']);
    spy.getMyPendingWorkflows.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PendingDocumentsComponent],
      providers: [
        { provide: WorkflowApolloService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingDocumentsComponent);
    component = fixture.componentInstance;
    workflowService = TestBed.inject(WorkflowApolloService) as jasmine.SpyObj<WorkflowApolloService>;
  });

  it('should load pending documents on init', () => {
    component.ngOnInit();
    expect(workflowService.getMyPendingWorkflows).toHaveBeenCalled();
  });
});
```

## Kết luận

Apollo Client integration cung cấp:
- **Type-safe GraphQL operations** với TypeScript
- **Automatic caching** và cache management
- **Real-time updates** với subscriptions
- **Error handling** tốt
- **Loading states** management
- **Optimistic updates** cho better UX
- **Testing support** đầy đủ
