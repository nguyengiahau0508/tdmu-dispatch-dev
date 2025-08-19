# Workflow Template Selection for Document Creation

## 🎯 Vấn đề gặp phải

Khi tạo văn bản, user không có nơi để chọn quy trình xét duyệt (workflow template). Hệ thống chỉ tự động tạo workflow cho OUTGOING documents mà không cho phép user chọn quy trình cụ thể.

## 🛠️ Giải pháp đã thực hiện

### 1. **Backend Changes**

#### **Cập nhật CreateDocumentInput**
```typescript
// apps/backend/src/modules/dispatch/documents/dto/create-document.input.ts
export class CreateDocumentInput {
  @Field(() => String, { description: 'Tiêu đề văn bản' })
  title: string;

  @Field(() => String, { nullable: true, description: 'Nội dung' })
  content?: string;

  @Field(() => DocumentTypeEnum, { description: 'Loại văn bản' })
  documentType: DocumentTypeEnum;

  @Field(() => Int, { description: 'ID nhóm văn bản' })
  documentCategoryId: number;

  @Field(() => Int, { nullable: true, description: 'ID file đính kèm' })
  fileId?: number;

  @Field(() => String, { nullable: true, description: 'Trạng thái' })
  status?: string;

  @Field(() => Int, { nullable: true, description: 'ID workflow template' })
  workflowTemplateId?: number; // ✅ Thêm field mới
}
```

#### **Cập nhật DocumentsService**
```typescript
// apps/backend/src/modules/dispatch/documents/documents.service.ts

// Cập nhật logic tạo workflow
private shouldCreateWorkflow(document: Document, workflowTemplateId?: number): boolean {
  // Create workflow if:
  // 1. User specified a workflow template, OR
  // 2. Document is OUTGOING and status is pending
  return !!workflowTemplateId || (document.documentType === DocumentTypeEnum.OUTGOING && document.status === 'pending');
}

private async createWorkflowForDocument(document: Document, user?: User, workflowTemplateId?: number): Promise<void> {
  if (!user) {
    console.log('No user provided, skipping workflow creation');
    return;
  }

  let templateId: number;

  if (workflowTemplateId) {
    // Use user-specified template
    templateId = workflowTemplateId;
    console.log('Using user-specified workflow template:', templateId);
  } else {
    // Get default workflow template for document type
    const defaultTemplateId = await this.getDefaultWorkflowTemplate(document.documentType);
    
    if (!defaultTemplateId) {
      console.log('No default workflow template found for document type:', document.documentType);
      return;
    }
    templateId = defaultTemplateId;
    console.log('Using default workflow template:', templateId);
  }

  const workflowInput = {
    templateId: templateId,
    documentId: document.id,
    notes: `Auto-created workflow for document: ${document.title}`,
  };

  await this.workflowInstancesService.create(workflowInput, user);
}
```

### 2. **Frontend Changes**

#### **Tạo WorkflowTemplatesService**
```typescript
// apps/frontend/src/app/core/services/dispatch/workflow-templates.service.ts
@Injectable({
  providedIn: 'root'
})
export class WorkflowTemplatesService {

  constructor(private apollo: Apollo) {}

  getWorkflowTemplates(): Observable<WorkflowTemplate[]> {
    return this.apollo.query<{ workflowTemplates: ApiResponse<WorkflowTemplate[]> }>({
      query: GET_WORKFLOW_TEMPLATES
    }).pipe(
      map(result => result.data.workflowTemplates.data)
    );
  }

  getActiveWorkflowTemplates(): Observable<WorkflowTemplate[]> {
    return this.apollo.query<{ activeWorkflowTemplates: ApiResponse<WorkflowTemplate[]> }>({
      query: GET_ACTIVE_WORKFLOW_TEMPLATES
    }).pipe(
      map(result => result.data.activeWorkflowTemplates.data)
    );
  }
}
```

#### **Cập nhật DocumentFormComponent**
```typescript
// apps/frontend/src/app/features/user/document-form/document-form.component.ts

// Thêm properties
workflowTemplates: WorkflowTemplate[] = [];
isLoadingTemplates = false;

// Thêm vào constructor
constructor(
  private fb: FormBuilder,
  private documentsService: DocumentsService,
  private documentCategoryService: DocumentCategoryService,
  private workflowTemplatesService: WorkflowTemplatesService, // ✅ Thêm service
  private fileService: FileService
) {
  this.documentForm = this.fb.group({
    title: ['', Validators.required],
    documentType: ['', Validators.required],
    documentCategoryId: ['', Validators.required],
    content: [''],
    status: ['draft'],
    workflowTemplateId: [''] // ✅ Thêm field
  });
}

// Thêm method load workflow templates
loadWorkflowTemplates(): void {
  this.isLoadingTemplates = true;
  this.workflowTemplatesService.getActiveWorkflowTemplates().subscribe({
    next: (templates) => {
      this.workflowTemplates = templates || [];
      console.log('Loaded workflow templates:', this.workflowTemplates);
      this.isLoadingTemplates = false;
    },
    error: (error: any) => {
      console.error('Error loading workflow templates:', error);
      this.workflowTemplates = [];
      this.isLoadingTemplates = false;
    }
  });
}
```

#### **Thêm UI cho Workflow Template Selection**
```html
<!-- apps/frontend/src/app/features/user/document-form/document-form.component.ts -->
<div class="form-group">
  <label for="workflowTemplateId">Quy trình xét duyệt</label>
  @if (isLoadingTemplates) {
    <div class="loading-templates">Đang tải quy trình...</div>
  } @else {
    <select 
      id="workflowTemplateId"
      formControlName="workflowTemplateId"
      class="form-control"
    >
      <option value="">Chọn quy trình xét duyệt (tùy chọn)</option>
      @for (template of workflowTemplates; track template.id) {
        <option [value]="template.id">{{ template.name }}</option>
      }
      @if (workflowTemplates.length === 0) {
        <option value="" disabled>Không có quy trình nào</option>
      }
    </select>
  }
  <small class="form-text">Nếu không chọn, hệ thống sẽ tự động chọn quy trình mặc định</small>
</div>
```

### 3. **Cập nhật Interface**
```typescript
// apps/frontend/src/app/core/services/dispatch/documents.service.ts
export interface CreateDocumentInput {
  title: string;
  content?: string;
  documentType: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  documentCategoryId: number;
  fileId?: number;
  status?: string;
  workflowTemplateId?: number; // ✅ Thêm field
}
```

## 📊 Workflow Creation Logic

### **Logic mới:**
1. **User chọn workflow template** → Sử dụng template đó
2. **User không chọn** → Sử dụng template mặc định theo document type
3. **Không có template mặc định** → Không tạo workflow

### **Template Mapping:**
```typescript
const templateMap = {
  [DocumentTypeEnum.OUTGOING]: 1, // Default template for outgoing documents
  [DocumentTypeEnum.INCOMING]: 2, // Default template for incoming documents
  [DocumentTypeEnum.INTERNAL]: 3, // Default template for internal documents
};
```

## 🎯 User Experience

### **Form tạo văn bản mới có:**
- ✅ **Field chọn quy trình xét duyệt** (tùy chọn)
- ✅ **Loading state** khi tải danh sách quy trình
- ✅ **Fallback message** khi không có quy trình nào
- ✅ **Help text** giải thích logic mặc định

### **Workflow Creation:**
- ✅ **User-specified template** được ưu tiên
- ✅ **Auto-fallback** sang template mặc định
- ✅ **Logging chi tiết** cho debugging
- ✅ **Error handling** không làm fail document creation

## 🚀 Benefits

### ✅ **Flexibility**
- User có thể chọn quy trình phù hợp
- Hỗ trợ nhiều loại quy trình khác nhau
- Tùy chọn tùy theo document type

### ✅ **User Experience**
- UI rõ ràng và dễ hiểu
- Loading states và error handling
- Help text giải thích logic

### ✅ **Backward Compatibility**
- Vẫn hoạt động với documents không chọn template
- Auto-creation cho OUTGOING documents
- Không break existing functionality

### ✅ **Maintainability**
- Code được tổ chức tốt
- Separation of concerns
- Proper error handling

## 🔧 Next Steps

### 1. **Testing**
- Test với real workflow templates
- Verify template selection logic
- Check auto-creation fallback

### 2. **Enhancements**
- Template preview/description
- Template recommendations
- Template validation

### 3. **Production**
- Add template permissions
- Template versioning
- Template analytics

**Workflow template selection đã được thêm vào form tạo văn bản!** 🎉

User giờ đây có thể:
- Chọn quy trình xét duyệt khi tạo văn bản
- Hệ thống tự động tạo workflow với template đã chọn
- Fallback sang template mặc định nếu không chọn
