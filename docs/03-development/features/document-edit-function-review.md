# Đánh giá Chức Năng Chỉnh Sửa Văn Bản

## 📋 Tổng quan

Báo cáo này đánh giá chi tiết chức năng chỉnh sửa văn bản trong hệ thống TDMU Dispatch, bao gồm cả backend và frontend.

## 🔍 Phân tích Backend

### 1. DocumentsService.update()

**File**: `apps/backend/src/modules/dispatch/documents/documents.service.ts`

#### ✅ Điểm mạnh:
- Validation đầy đủ cho documentCategoryId
- Cập nhật từng field riêng biệt (partial update)
- Load relations sau khi update
- Error handling cơ bản

#### ❌ Vấn đề phát hiện:

**1. Thiếu validation cho file upload trong update**
```typescript
// Hiện tại chỉ hỗ trợ update fileId, không hỗ trợ upload file mới
if (updateDocumentInput.fileId !== undefined) {
  entity.fileId = updateDocumentInput.fileId;
}
```

**2. Thiếu audit trail**
- Không lưu thông tin ai update, khi nào update
- Không có version control cho document

**3. Thiếu business logic validation**
- Không kiểm tra quyền chỉnh sửa dựa trên trạng thái document
- Không validate workflow constraints

**4. Thiếu rollback mechanism**
- Không có transaction để đảm bảo tính nhất quán

### 2. UpdateDocumentInput DTO

**File**: `apps/backend/src/modules/dispatch/documents/dto/update-document/update-document.input.ts`

#### ✅ Điểm mạnh:
- Validation decorators đầy đủ
- Optional fields cho partial update
- Type safety với GraphQL

#### ❌ Vấn đề phát hiện:

**1. Thiếu field cho file upload**
```typescript
// Cần thêm
@Field(() => GraphQLUpload, { nullable: true })
file?: FileUpload;
```

**2. Thiếu validation business rules**
```typescript
// Cần thêm custom validators
@ValidateIf((o) => o.status === 'APPROVED')
@IsNotEmpty()
approvalNote?: string;
```

### 3. DocumentsResolver.updateDocument()

**File**: `apps/backend/src/modules/dispatch/documents/documents.resolver.ts`

#### ✅ Điểm mạnh:
- Role-based access control
- Error handling với metadata
- GraphQL response format chuẩn

#### ❌ Vấn đề phát hiện:

**1. Thiếu file upload support**
```typescript
// Hiện tại chỉ nhận UpdateDocumentInput, không có file parameter
async updateDocument(
  @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
  @CurrentUser() user?: User,
): Promise<DocumentResponse>
```

**2. Thiếu audit logging**
- Không log ai thực hiện update
- Không log thay đổi gì

## 🔍 Phân tích Frontend

### 1. DocumentFormComponent

**File**: `apps/frontend/src/app/features/user/document-form/document-form.component.ts`

#### ✅ Điểm mạnh:
- Form validation đầy đủ
- UI/UX tốt với loading states
- Support cả create và edit mode
- File upload integration

#### ❌ Vấn đề phát hiện:

**1. Thiếu file upload trong edit mode**
```typescript
// Trong onSubmit() - chỉ xử lý text fields
if (this.isEditMode && this.document) {
  const updateInput: UpdateDocumentInput = {
    id: this.document.id,
    ...this.documentForm.value
  };
  // Không có xử lý file upload
}
```

**2. Thiếu validation cho edit permissions**
- Không kiểm tra user có quyền edit document không
- Không disable form dựa trên document status

**3. Thiếu confirmation cho changes**
- Không có confirm dialog khi có thay đổi quan trọng
- Không có unsaved changes warning

### 2. DocumentsService (Frontend)

**File**: `apps/frontend/src/app/core/services/dispatch/documents.service.ts`

#### ✅ Điểm mạnh:
- GraphQL integration tốt
- Type safety với interfaces
- Error handling

#### ❌ Vấn đề phát hiện:

**1. UpdateDocumentInput interface thiếu fields**
```typescript
export interface UpdateDocumentInput {
  id: number;
  title?: string;
  content?: string;
  documentType?: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  documentCategoryId?: number;
  fileId?: number; // Chỉ có fileId, không có file upload
  status?: string;
  // Thiếu các fields khác
}
```

## 🚨 Vấn đề nghiêm trọng

### 1. File Upload trong Edit Mode
**Mức độ**: 🔴 Critical
**Mô tả**: Không thể upload file mới khi chỉnh sửa văn bản
**Tác động**: Giảm tính năng của hệ thống

### 2. Thiếu Audit Trail
**Mức độ**: 🟡 Medium
**Mô tả**: Không lưu lịch sử thay đổi
**Tác động**: Khó debug và compliance

### 3. Thiếu Business Logic Validation
**Mức độ**: 🟡 Medium
**Mô tả**: Không validate quyền và workflow constraints
**Tác động**: Có thể gây lỗi business logic

## 🔧 Đề xuất cải thiện

### 1. Backend Improvements

#### A. Thêm file upload support cho update
```typescript
async update(
  id: number,
  updateDocumentInput: UpdateDocumentInput,
  file?: FileUpload,
  user?: User,
): Promise<Document> {
  // Xử lý file upload nếu có
  if (file) {
    const uploadedId = await this.googleDriveService.uploadFile(file);
    const fileEntityData = {
      driveFileId: uploadedId,
      originalName: file.filename,
      mimeType: file.mimetype,
      isPublic: false,
    };
    const savedFileEntity = await this.fileRepository.save(fileEntityData);
    updateDocumentInput.fileId = savedFileEntity.id;
  }
  
  // Validate business rules
  await this.validateUpdatePermissions(id, user);
  
  // Update với transaction
  return await this.dataSource.transaction(async (manager) => {
    const entity = await manager.findOne(Document, { where: { id } });
    // ... update logic
    return await manager.save(Document, entity);
  });
}
```

#### B. Thêm audit trail
```typescript
// Tạo DocumentHistory entity
@Entity('document_history')
export class DocumentHistory {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  documentId: number;
  
  @Column()
  actionType: string; // 'UPDATE', 'STATUS_CHANGE', etc.
  
  @Column('json')
  changes: any; // Lưu thay đổi
  
  @Column()
  updatedByUserId: number;
  
  @Column()
  updatedAt: Date;
}
```

#### C. Thêm business validation
```typescript
private async validateUpdatePermissions(documentId: number, user: User): Promise<void> {
  const document = await this.findOne(documentId);
  
  // Kiểm tra quyền edit
  if (document.createdByUserId !== user.id && !this.hasEditPermission(user, document)) {
    throw new ForbiddenException('Không có quyền chỉnh sửa văn bản này');
  }
  
  // Kiểm tra trạng thái
  if (document.status === 'APPROVED' || document.status === 'COMPLETED') {
    throw new BadRequestException('Không thể chỉnh sửa văn bản đã được phê duyệt');
  }
}
```

### 2. Frontend Improvements

#### A. Thêm file upload trong edit mode
```typescript
async onSubmit(): Promise<void> {
  if (this.isEditMode && this.document) {
    const updateInput: UpdateDocumentInput = {
      id: this.document.id,
      ...this.documentForm.value
    };
    
    // Xử lý file upload nếu có
    if (this.selectedFile) {
      // Upload file và lấy fileId
      const fileId = await this.uploadFile(this.selectedFile);
      updateInput.fileId = fileId;
    }
    
    this.documentsService.updateDocument(updateInput).subscribe({
      // ... handle response
    });
  }
}
```

#### B. Thêm permission validation
```typescript
ngOnInit(): void {
  if (this.document) {
    this.checkEditPermissions();
    this.loadDocumentHistory();
  }
}

private checkEditPermissions(): void {
  const canEdit = this.documentService.canEditDocument(this.document, this.currentUser);
  if (!canEdit) {
    this.disableForm();
    this.showPermissionError();
  }
}
```

#### C. Thêm unsaved changes warning
```typescript
@HostListener('window:beforeunload', ['$event'])
onBeforeUnload(event: BeforeUnloadEvent): void {
  if (this.documentForm.dirty) {
    event.preventDefault();
    event.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi?';
  }
}
```

## 📊 Đánh giá tổng thể

| Tiêu chí | Điểm | Ghi chú |
|----------|------|---------|
| **Functionality** | 6/10 | Thiếu file upload trong edit mode |
| **Security** | 7/10 | Có RBAC nhưng thiếu business validation |
| **User Experience** | 7/10 | UI tốt nhưng thiếu confirmations |
| **Maintainability** | 6/10 | Thiếu audit trail, khó debug |
| **Performance** | 8/10 | Tốt, không có vấn đề lớn |
| **Error Handling** | 7/10 | Cơ bản tốt, cần cải thiện |

**Điểm tổng thể**: 6.8/10

## 🎯 Kế hoạch cải thiện

### Phase 1 (Ưu tiên cao)
1. ✅ Thêm file upload support cho update
2. ✅ Thêm business logic validation
3. ✅ Cải thiện error handling

### Phase 2 (Ưu tiên trung bình)
1. ✅ Thêm audit trail
2. ✅ Thêm permission validation ở frontend
3. ✅ Thêm unsaved changes warning

### Phase 3 (Ưu tiên thấp)
1. ✅ Thêm document versioning
2. ✅ Thêm advanced validation rules
3. ✅ Thêm bulk update support

## 📝 Kết luận

Chức năng chỉnh sửa văn bản hiện tại hoạt động cơ bản tốt nhưng cần cải thiện đáng kể để đáp ứng yêu cầu business thực tế. Các vấn đề chính cần được ưu tiên giải quyết là file upload trong edit mode và business logic validation.
