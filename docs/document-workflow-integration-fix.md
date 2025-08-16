# Document Workflow Integration Fix

## Tổng quan

Cải thiện hệ thống tích hợp giữa **Document Management** và **Workflow Processing** để tạo ra một quy trình xử lý văn bản hoàn chỉnh và tự động.

## Vấn đề trước đây

1. **Tách biệt giữa Document và Workflow**: Document và Workflow hoạt động độc lập
2. **Thiếu tự động hóa**: Phải gán workflow thủ công cho từng document
3. **Validation không đầy đủ**: Thiếu kiểm tra quyền và validation
4. **UI chưa hoàn thiện**: Thiếu giao diện để gán workflow

## Giải pháp đã thực hiện

### 1. Cải thiện DocumentsService

**File**: `apps/backend/src/modules/dispatch/documents/documents.service.ts`

#### a) Tích hợp với WorkflowInstancesService
```typescript
constructor(
  // ... existing dependencies
  private readonly workflowInstancesService: WorkflowInstancesService,
) {}
```

#### b) Auto-create workflow cho document
```typescript
// Auto-create workflow if document type requires it
if (this.shouldCreateWorkflow(documentWithRelations)) {
  console.log('Auto-creating workflow for document...');
  try {
    await this.createWorkflowForDocument(documentWithRelations, user);
    console.log('Workflow created successfully');
  } catch (workflowError) {
    console.error('Error creating workflow:', workflowError);
    // Don't fail document creation if workflow creation fails
  }
}
```

#### c) Validation và error handling
```typescript
// Validate required fields
if (!createDocumentInput.title?.trim()) {
  throw new BadRequestException('Document title is required');
}

if (!createDocumentInput.documentType) {
  throw new BadRequestException('Document type is required');
}

if (!createDocumentInput.documentCategoryId) {
  throw new BadRequestException('Document category is required');
}
```

### 2. Tạo DocumentWorkflowService

**File**: `apps/backend/src/modules/dispatch/documents/document-workflow.service.ts`

#### a) Gán workflow cho document
```typescript
async assignWorkflowToDocument(
  input: AssignWorkflowInput,
  user: User,
): Promise<any> {
  // Validate document exists
  // Check if document already has an active workflow
  // Validate template exists and is active
  // Check user permissions for this template
  // Create workflow instance
  // Update document status to 'processing'
}
```

#### b) Quản lý workflow của document
```typescript
async getDocumentWorkflow(documentId: number): Promise<DocumentWorkflowInfo | null>
async getDocumentsNeedingWorkflow(): Promise<Document[]>
async getSuitableTemplates(documentType: string): Promise<any[]>
async removeWorkflowFromDocument(documentId: number, user: User): Promise<any>
```

### 3. Tạo DocumentWorkflowResolver

**File**: `apps/backend/src/modules/dispatch/documents/document-workflow.resolver.ts`

#### a) GraphQL mutations và queries
```typescript
@Mutation(() => String)
async assignWorkflowToDocument(
  @Args('documentId', { type: () => Int }) documentId: number,
  @Args('templateId', { type: () => Int }) templateId: number,
  @Args('notes', { nullable: true }) notes?: string,
  @CurrentUser() user?: User,
): Promise<string>

@Query(() => [Object])
async documentsNeedingWorkflow(@CurrentUser() user?: User): Promise<any[]>

@Query(() => Object)
async documentWorkflowInfo(
  @Args('documentId', { type: () => Int }) documentId: number,
  @CurrentUser() user?: User,
): Promise<any>
```

### 4. Cập nhật DocumentsResolver

**File**: `apps/backend/src/modules/dispatch/documents/documents.resolver.ts`

#### a) Thêm authentication và authorization
```typescript
@UseGuards(GqlAuthGuard)
export class DocumentsResolver {
  @Mutation(() => GetDocumentResponse)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
    @CurrentUser() user?: User,
  ): Promise<GetDocumentResponse> {
    // Validate user permissions
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if user has permission to create documents
    const allowedRoles = ['CLERK', 'DEPARTMENT_STAFF', 'SYSTEM_ADMIN'];
    if (!allowedRoles.some(role => user.roles.includes(role))) {
      throw new Error('User does not have permission to create documents');
    }
  }
}
```

### 5. Tạo Frontend Component

**File**: `apps/frontend/src/app/features/user/document-form/assign-workflow-modal.component.ts`

#### a) Modal để gán workflow
```typescript
@Component({
  selector: 'app-assign-workflow-modal',
  template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <!-- Document info -->
        <!-- Workflow form -->
        <!-- Action buttons -->
      </div>
    </div>
  `
})
export class AssignWorkflowModalComponent {
  // Form handling
  // Template loading
  // Workflow assignment
}
```

### 6. Cập nhật Module Dependencies

**File**: `apps/backend/src/modules/dispatch/documents/documents.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    FilesModule,
    GoogleDriveModule,
    DocumentCategoryModule,
    WorkflowInstancesModule,
    WorkflowTemplatesModule,
  ],
  providers: [
    DocumentsResolver, 
    DocumentsService,
    DocumentWorkflowResolver,
    DocumentWorkflowService,
  ],
  exports: [DocumentsService, DocumentWorkflowService],
})
export class DocumentsModule {}
```

## Quy trình hoạt động mới

### 1. Tạo Document
```
User tạo document → Validation → Save document → Auto-create workflow (nếu cần)
```

### 2. Gán Workflow thủ công
```
User chọn document → Chọn workflow template → Validate permissions → Create workflow instance
```

### 3. Xử lý Workflow
```
Document có workflow → User xử lý từng bước → Update document status → Complete workflow
```

## Business Logic

### 1. Auto-create Workflow Rules
```typescript
private shouldCreateWorkflow(document: Document): boolean {
  // Auto-create workflow for OUTGOING documents
  return document.documentType === 'OUTGOING' && document.status === 'pending';
}
```

### 2. Template Mapping
```typescript
private async getDefaultWorkflowTemplate(documentType: string): Promise<number | null> {
  const templateMap = {
    'OUTGOING': 1, // Default template for outgoing documents
    'INCOMING': 2, // Default template for incoming documents
    'INTERNAL': 3, // Default template for internal documents
  };
  
  return templateMap[documentType] || null;
}
```

### 3. Permission Rules
```typescript
private getTemplateAllowedRoles(templateName: string): string[] {
  const templateRoleMap: Record<string, string[]> = {
    'Quy trình phê duyệt văn bản thông thường': ['CLERK', 'DEPARTMENT_STAFF', 'SYSTEM_ADMIN'],
    'Quy trình xử lý văn bản đến': ['CLERK', 'SYSTEM_ADMIN'],
    'Quy trình nội bộ': ['DEPARTMENT_STAFF', 'SYSTEM_ADMIN'],
  };

  return templateRoleMap[templateName] || ['SYSTEM_ADMIN'];
}
```

## Testing

### 1. Test Document Creation with Auto-workflow
```bash
# Create OUTGOING document
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createDocument(createDocumentInput: { title: \"Test Document\", documentType: OUTGOING, documentCategoryId: 1, status: \"pending\" }) { data { document { id title status } } } }"
  }'
```

### 2. Test Manual Workflow Assignment
```bash
# Assign workflow to document
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { assignWorkflowToDocument(documentId: 1, templateId: 1, notes: \"Test assignment\") }"
  }'
```

### 3. Test Document Workflow Info
```bash
# Get document workflow info
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { documentWorkflowInfo(documentId: 1) { documentId documentTitle hasActiveWorkflow workflowStatus } }"
  }'
```

## Kết quả

1. **Tích hợp hoàn chỉnh**: Document và Workflow hoạt động như một hệ thống thống nhất
2. **Tự động hóa**: Auto-create workflow cho các document phù hợp
3. **Validation đầy đủ**: Kiểm tra quyền, validation dữ liệu
4. **UI hoàn thiện**: Giao diện để gán và quản lý workflow
5. **Error handling**: Xử lý lỗi tốt hơn, không fail document creation nếu workflow creation fails
6. **Logging chi tiết**: Tracking đầy đủ quá trình tạo document và workflow

## Lưu ý

- **Backward compatible**: Không ảnh hưởng đến existing functionality
- **Role-based access**: Kiểm tra quyền theo role của user
- **Flexible workflow assignment**: Có thể gán workflow thủ công hoặc tự động
- **Status management**: Tự động update document status khi workflow thay đổi
