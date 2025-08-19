# Checklist Cải Thiện Chức Năng Update Document

## 🎯 Mục tiêu
Cải thiện chức năng chỉnh sửa văn bản để đáp ứng yêu cầu business thực tế và tăng tính bảo mật, khả năng theo dõi.

## 📋 Backend Improvements

### Phase 1: Critical Fixes (Ưu tiên cao)

#### 1.1 Thêm File Upload Support cho Update
- [ ] **Cập nhật UpdateDocumentInput DTO**
  ```typescript
  @Field(() => GraphQLUpload, { nullable: true })
  file?: FileUpload;
  ```
- [ ] **Cập nhật DocumentsResolver.updateDocument()**
  ```typescript
  async updateDocument(
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
    @Args('file', { type: () => GraphQLUpload, nullable: true }) file?: FileUpload,
    @CurrentUser() user?: User,
  ): Promise<DocumentResponse>
  ```
- [ ] **Cập nhật DocumentsService.update()**
  ```typescript
  async update(
    id: number,
    updateDocumentInput: UpdateDocumentInput,
    file?: FileUpload,
    user?: User,
  ): Promise<Document>
  ```
- [ ] **Thêm logic xử lý file upload trong update**
  ```typescript
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
  ```

#### 1.2 Thêm Business Logic Validation
- [ ] **Tạo method validateUpdatePermissions()**
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
- [ ] **Tạo method hasEditPermission()**
  ```typescript
  private hasEditPermission(user: User, document: Document): boolean {
    // Logic kiểm tra quyền dựa trên role và workflow
    return user.role === 'SYSTEM_ADMIN' || 
           user.role === 'DEPARTMENT_STAFF' ||
           document.assignedToUserId === user.id;
  }
  ```
- [ ] **Thêm validation cho workflow constraints**
  ```typescript
  private async validateWorkflowConstraints(documentId: number): Promise<void> {
    const workflowInstances = await this.workflowInstancesService.findByDocumentId(documentId);
    if (workflowInstances.length > 0) {
      const activeInstance = workflowInstances.find(w => w.status === 'IN_PROGRESS');
      if (activeInstance) {
        throw new BadRequestException('Không thể chỉnh sửa văn bản đang trong quy trình xử lý');
      }
    }
  }
  ```

#### 1.3 Thêm Transaction Support
- [ ] **Wrap update logic trong transaction**
  ```typescript
  return await this.dataSource.transaction(async (manager) => {
    const entity = await manager.findOne(Document, { where: { id } });
    if (!entity) {
      throw new BadRequestException(`Document with ID ${id} not found`);
    }
    
    // Update logic here
    
    const savedDocument = await manager.save(Document, entity);
    
    // Load relations
    return await manager.findOne(Document, {
      where: { id: savedDocument.id },
      relations: ['documentCategory', 'file']
    });
  });
  ```

### Phase 2: Audit Trail (Ưu tiên trung bình)

#### 2.1 Tạo DocumentHistory Entity
- [ ] **Tạo entity DocumentHistory**
  ```typescript
  @Entity('document_history')
  export class DocumentHistory {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    documentId: number;
    
    @Column()
    actionType: string; // 'UPDATE', 'STATUS_CHANGE', 'FILE_UPLOAD', etc.
    
    @Column('json')
    changes: any; // Lưu thay đổi
    
    @Column()
    updatedByUserId: number;
    
    @Column()
    updatedAt: Date;
    
    @Column({ nullable: true })
    note?: string;
  }
  ```
- [ ] **Tạo DocumentHistoryService**
- [ ] **Tạo DocumentHistoryRepository**
- [ ] **Thêm DocumentHistory vào DocumentsModule**

#### 2.2 Thêm Audit Logging
- [ ] **Tạo method logDocumentChange()**
  ```typescript
  private async logDocumentChange(
    documentId: number,
    actionType: string,
    changes: any,
    userId: number,
    note?: string
  ): Promise<void> {
    const historyEntry = this.documentHistoryRepository.create({
      documentId,
      actionType,
      changes,
      updatedByUserId: userId,
      updatedAt: new Date(),
      note
    });
    await this.documentHistoryRepository.save(historyEntry);
  }
  ```
- [ ] **Tích hợp audit logging vào update method**
- [ ] **Tạo GraphQL query để lấy document history**

### Phase 3: Advanced Features (Ưu tiên thấp)

#### 3.1 Document Versioning
- [ ] **Tạo DocumentVersion entity**
- [ ] **Implement version control logic**
- [ ] **Thêm rollback functionality**

#### 3.2 Advanced Validation
- [ ] **Thêm custom validators**
- [ ] **Implement field-level validation**
- [ ] **Thêm cross-field validation**

## 📋 Frontend Improvements

### Phase 1: Critical Fixes

#### 1.1 Thêm File Upload trong Edit Mode
- [ ] **Cập nhật UpdateDocumentInput interface**
  ```typescript
  export interface UpdateDocumentInput {
    id: number;
    title?: string;
    content?: string;
    documentType?: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
    documentCategoryId?: number;
    fileId?: number;
    file?: File; // Thêm file upload support
    status?: string;
    priority?: string;
    deadline?: string;
    assignedToUserId?: number;
  }
  ```
- [ ] **Cập nhật DocumentsService.updateDocument()**
  ```typescript
  updateDocument(input: UpdateDocumentInput, file?: File): Observable<Document> {
    // Xử lý file upload nếu có
    if (file) {
      // Upload file trước, sau đó update document
    }
    return this.apollo.mutate<{
      updateDocument: ApiResponse<Document>
    }>({
      mutation: UPDATE_DOCUMENT,
      variables: { updateDocumentInput: input, file },
      refetchQueries: [
        {
          query: GET_DOCUMENTS_PAGINATED,
          variables: { input: { page: 1, take: 10, order: 'DESC' } }
        }
      ]
    }).pipe(
      map(result => result.data!.updateDocument.data)
    );
  }
  ```
- [ ] **Cập nhật DocumentFormComponent.onSubmit()**
  ```typescript
  async onSubmit(): Promise<void> {
    if (this.isEditMode && this.document) {
      const updateInput: UpdateDocumentInput = {
        id: this.document.id,
        ...this.documentForm.value
      };
      
      // Xử lý file upload nếu có
      if (this.selectedFile) {
        // Upload file và lấy fileId hoặc gửi file trực tiếp
      }
      
      this.documentsService.updateDocument(updateInput, this.selectedFile || undefined).subscribe({
        next: (updatedDocument) => {
          this.saved.emit(updatedDocument);
        },
        error: (error) => {
          console.error('Error updating document:', error);
        }
      });
    }
  }
  ```

#### 1.2 Thêm Permission Validation
- [ ] **Tạo DocumentPermissionService**
  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class DocumentPermissionService {
    canEditDocument(document: Document, user: User): boolean {
      // Logic kiểm tra quyền edit
    }
    
    canDeleteDocument(document: Document, user: User): boolean {
      // Logic kiểm tra quyền delete
    }
    
    canChangeStatus(document: Document, user: User, newStatus: string): boolean {
      // Logic kiểm tra quyền thay đổi status
    }
  }
  ```
- [ ] **Tích hợp permission check vào DocumentFormComponent**
- [ ] **Disable form fields dựa trên permissions**
- [ ] **Hiển thị thông báo lỗi permission**

#### 1.3 Thêm Unsaved Changes Warning
- [ ] **Thêm HostListener cho beforeunload**
  ```typescript
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.documentForm.dirty) {
      event.preventDefault();
      event.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi?';
    }
  }
  ```
- [ ] **Thêm confirmation dialog khi có thay đổi**
- [ ] **Thêm auto-save functionality (optional)**

### Phase 2: User Experience

#### 2.1 Thêm Loading States
- [ ] **Thêm loading spinner cho file upload**
- [ ] **Thêm progress bar cho large files**
- [ ] **Disable form trong quá trình submit**

#### 2.2 Thêm Error Handling
- [ ] **Hiển thị error messages cụ thể**
- [ ] **Thêm retry mechanism cho failed uploads**
- [ ] **Thêm validation feedback real-time**

#### 2.3 Thêm Document History View
- [ ] **Tạo DocumentHistoryComponent**
- [ ] **Hiển thị lịch sử thay đổi**
- [ ] **Thêm diff view cho changes**

### Phase 3: Advanced Features

#### 3.1 Bulk Update
- [ ] **Thêm bulk update functionality**
- [ ] **Thêm bulk status change**
- [ ] **Thêm bulk assignment**

#### 3.2 Advanced Search & Filter
- [ ] **Thêm advanced search trong document list**
- [ ] **Thêm filter by status, type, date range**
- [ ] **Thêm export functionality**

## 🧪 Testing

### Unit Tests
- [ ] **Test DocumentsService.update() với file upload**
- [ ] **Test permission validation**
- [ ] **Test audit logging**
- [ ] **Test error handling**

### Integration Tests
- [ ] **Test end-to-end update flow**
- [ ] **Test file upload integration**
- [ ] **Test permission integration**

### E2E Tests
- [ ] **Test update document từ frontend**
- [ ] **Test file upload từ frontend**
- [ ] **Test permission restrictions**

## 📊 Monitoring & Analytics

### Logging
- [ ] **Thêm structured logging cho document updates**
- [ ] **Log performance metrics**
- [ ] **Log error rates**

### Analytics
- [ ] **Track update frequency**
- [ ] **Track file upload usage**
- [ ] **Track permission denials**

## 📝 Documentation

### API Documentation
- [ ] **Cập nhật GraphQL schema documentation**
- [ ] **Thêm examples cho update mutations**
- [ ] **Document error codes**

### User Documentation
- [ ] **Cập nhật user guide**
- [ ] **Thêm troubleshooting guide**
- [ ] **Thêm FAQ**

## 🚀 Deployment

### Database Migration
- [ ] **Tạo migration cho DocumentHistory table**
- [ ] **Tạo migration cho new fields**
- [ ] **Test migration scripts**

### Configuration
- [ ] **Cập nhật environment variables**
- [ ] **Cập nhật deployment scripts**
- [ ] **Test deployment process**

## ✅ Completion Criteria

### Phase 1 Complete khi:
- [ ] File upload hoạt động trong edit mode
- [ ] Permission validation hoạt động
- [ ] Error handling cải thiện
- [ ] Unit tests pass

### Phase 2 Complete khi:
- [ ] Audit trail hoạt động
- [ ] Document history hiển thị
- [ ] UX improvements hoàn thành
- [ ] Integration tests pass

### Phase 3 Complete khi:
- [ ] Advanced features hoạt động
- [ ] Performance optimizations hoàn thành
- [ ] E2E tests pass
- [ ] Documentation hoàn thành

## 📈 Success Metrics

- **Functionality**: 100% test cases pass
- **Performance**: Update time < 2 seconds
- **Security**: 0 permission bypass incidents
- **User Satisfaction**: > 90% positive feedback
- **Error Rate**: < 1% failed updates
