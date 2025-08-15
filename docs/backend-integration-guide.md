# Backend Integration Guide - Income & Outcome Documents

## Tổng quan

Tài liệu này mô tả việc tích hợp backend cho các tính năng income-documents và outcome-documents, bao gồm:

1. **Backend Integration**: Kết nối với backend services
2. **Real Data**: Thay thế mock data bằng real API calls
3. **File Upload**: Thêm chức năng upload tài liệu

## Cấu trúc Backend

### 1. Document Entity

```typescript
// apps/backend/src/modules/dispatch/documents/entities/document.entity.ts
export enum DocumentTypeEnum {
  OUTGOING = 'OUTGOING', // Công văn đi
  INCOMING = 'INCOMING', // Công văn đến
  INTERNAL = 'INTERNAL', // Nội bộ
}

@Entity('document')
export class Document {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Field(() => DocumentTypeEnum)
  @Column({ type: 'enum', enum: DocumentTypeEnum })
  documentType: DocumentTypeEnum;

  @Field(() => Int)
  @Column()
  documentCategoryId: number;

  @Field(() => DocumentCategory)
  @ManyToOne(() => DocumentCategory)
  @JoinColumn({ name: 'documentCategoryId' })
  documentCategory: DocumentCategory;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, { cascade: true })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  fileId: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field({ nullable: true })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
```

### 2. GraphQL Resolver

```typescript
// apps/backend/src/modules/dispatch/documents/documents.resolver.ts
@Resolver(() => Document)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Mutation(() => GetDocumentResponse)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
  ): Promise<GetDocumentResponse> {
    const document = await this.documentsService.create(
      createDocumentInput,
      file,
    );
    return {
      metadata: createResponseMetadata(
        HttpStatus.ACCEPTED,
        'Tạo văn bản thành công',
      ),
      data: { document },
    };
  }

  @Query(() => GetDocumentsPaginatedResponse, { name: 'documents' })
  async findPaginated(
    @Args('input') input: GetDocumentsPaginatedInput,
  ): Promise<GetDocumentsPaginatedResponse> {
    const pageData = await this.documentsService.findPaginated(input);
    return {
      metadata: createResponseMetadata(
        HttpStatus.OK,
        'Lấy danh sách văn bản thành công',
      ),
      data: pageData.data,
      totalCount: pageData.meta.itemCount,
      hasNextPage: pageData.meta.hasNextPage,
    };
  }

  // ... other methods
}
```

### 3. Service Layer

```typescript
// apps/backend/src/modules/dispatch/documents/documents.service.ts
@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async create(
    createDocumentInput: CreateDocumentInput,
    file?: FileUpload,
  ): Promise<Document> {
    let driveFileId: string | undefined = undefined;
    if (file) {
      const uploadedId = await this.googleDriveService.uploadFile(file);
      driveFileId = uploadedId;
    }
    const entity = this.documentRepository.create({
      ...createDocumentInput,
      file: driveFileId
        ? {
            driveFileId: driveFileId,
            isPublic: false,
          }
        : undefined,
    });
    return this.documentRepository.save(entity);
  }

  async findPaginated(
    input: GetDocumentsPaginatedInput,
  ): Promise<PageDto<Document>> {
    const { search, documentType, page, take, order, skip } = input;

    const where: FindOptionsWhere<Document>[] = [];

    if (search) {
      where.push({ title: ILike(`%${search}%`) });
    }

    if (documentType) {
      where.push({ documentType });
    }

    const [data, itemCount] = await this.documentRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['documentCategory', 'file'],
      order: { id: order },
      skip: skip,
      take: take,
    });

    const meta = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new PageDto(data, meta);
  }

  // ... other methods
}
```

## Cấu trúc Frontend

### 1. Documents Service

```typescript
// apps/frontend/src/app/core/services/dispatch/documents.service.ts
@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  constructor(private apollo: Apollo) {}

  getDocumentsPaginated(input: GetDocumentsPaginatedInput): Observable<PaginatedResponse<Document>> {
    return this.apollo.watchQuery<{
      documents: ApiResponse<PaginatedResponse<Document>>
    }>({
      query: GET_DOCUMENTS_PAGINATED,
      variables: { input }
    }).valueChanges.pipe(
      map(result => result.data.documents.data)
    );
  }

  createDocument(input: CreateDocumentInput, file?: File): Observable<Document> {
    return this.apollo.mutate<{
      createDocument: ApiResponse<{ document: Document }>
    }>({
      mutation: CREATE_DOCUMENT,
      variables: { 
        createDocumentInput: input,
        file: file
      },
      refetchQueries: [
        {
          query: GET_DOCUMENTS_PAGINATED,
          variables: { input: { page: 1, take: 10, order: 'DESC' } }
        }
      ]
    }).pipe(
      map(result => result.data!.createDocument.data.document)
    );
  }

  // Helper methods for specific document types
  getIncomingDocuments(page: number = 1, take: number = 10, search?: string): Observable<PaginatedResponse<Document>> {
    return this.getDocumentsPaginated({
      search,
      documentType: 'INCOMING',
      page,
      take,
      order: 'DESC'
    });
  }

  getOutgoingDocuments(page: number = 1, take: number = 10, search?: string): Observable<PaginatedResponse<Document>> {
    return this.getDocumentsPaginated({
      search,
      documentType: 'OUTGOING',
      page,
      take,
      order: 'DESC'
    });
  }
}
```

### 2. Document Form Component

```typescript
// apps/frontend/src/app/features/user/document-form/document-form.component.ts
@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  // ... template and styles
})
export class DocumentFormComponent implements OnInit {
  @Input() document?: Document;
  @Input() documentType?: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  @Output() saved = new EventEmitter<Document>();
  @Output() cancelled = new EventEmitter<void>();

  documentForm: FormGroup;
  documentCategories: any[] = [];
  selectedFile: File | null = null;
  isSubmitting = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private documentsService: DocumentsService,
    private documentCategoryService: DocumentCategoryService,
    private fileService: FileService
  ) {
    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      documentType: ['', Validators.required],
      documentCategoryId: ['', Validators.required],
      content: [''],
      status: ['draft']
    });
  }

  async onSubmit(): Promise<void> {
    if (this.documentForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      if (this.isEditMode && this.document) {
        const updateInput: UpdateDocumentInput = {
          id: this.document.id,
          ...this.documentForm.value
        };
        
        const updatedDocument = await this.documentsService.updateDocument(updateInput).toPromise();
        this.saved.emit(updatedDocument);
      } else {
        const createInput: CreateDocumentInput = this.documentForm.value;
        
        const createdDocument = await this.documentsService.createDocument(createInput, this.selectedFile || undefined).toPromise();
        this.saved.emit(createdDocument);
      }
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
```

### 3. Updated Components

#### Incoming Documents Component

```typescript
// apps/frontend/src/app/features/user/incoming-documents/incoming-documents.ts
export class IncomingDocuments implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  searchTerm = '';
  statusFilter = '';
  showDocumentForm = false;
  isLoading = false;

  constructor(private documentsService: DocumentsService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentsService.getIncomingDocuments(1, 20, this.searchTerm || '').subscribe({
      next: (response) => {
        this.documents = response.data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.isLoading = false;
      }
    });
  }

  createDocument(): void {
    this.showDocumentForm = true;
  }

  onDocumentSaved(document: Document): void {
    this.showDocumentForm = false;
    this.loadDocuments();
  }

  onDocumentFormCancelled(): void {
    this.showDocumentForm = false;
  }
}
```

## File Upload & Download

### 1. Google Drive Integration

```typescript
// apps/backend/src/integrations/google-drive/google-drive.service.ts
@Injectable()
export class GoogleDriveService {
  async uploadFile(file: FileUpload): Promise<string> {
    const { filename, mimetype, createReadStream } = file;
    const fileStream = createReadStream();

    const response = await this.driveClient.files.create({
      requestBody: {
        name: filename,
        parents: ['1sAW8cE5xfKsnoQl0vG6Sex2g0Hmk92W0'], // Folder ID
      },
      media: {
        mimeType: mimetype,
        body: fileStream,
      },
      fields: 'id',
    });

    return response.data.id!;
  }

  async downloadFile(fileId: string): Promise<Readable> {
    const response = await this.driveClient.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' },
    );
    return response.data;
  }
}
```

### 2. File Download Endpoint

```typescript
// apps/backend/src/modules/files/files.controller.ts
@Controller('files')
export class FilesController {
  @Get('drive/:driveFileId/download')
  async downloadFromDrive(
    @Param('driveFileId') driveFileId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const fileStream = await this.googleDriveService.downloadFile(driveFileId);
      const fileInfo = await this.googleDriveService.getFileInfo(driveFileId);
      
      res.set({
        'Content-Type': fileInfo.mimeType,
        'Content-Disposition': `attachment; filename="${fileInfo.name}"`,
      });

      fileStream.pipe(res);
    } catch (error) {
      res.status(404).json({ message: 'File not found or access denied' });
    }
  }
}
```

### 3. Frontend File Service

```typescript
// apps/frontend/src/app/core/services/file.service.ts
@Injectable({ providedIn: 'root' })
export class FileService {
  downloadFromDrive(driveFileId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authState.getAccessToken()}`
    });

    return this.http.get(`${this.apiUrl}/files/drive/${driveFileId}/download`, {
      responseType: 'blob',
      headers,
    });
  }

  async downloadFile(driveFileId: string, fileName: string): Promise<void> {
    try {
      const url = await this.getDriveFileUrl(driveFileId);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}
```

## GraphQL Schema

### Queries

```graphql
query GetDocumentsPaginated($input: GetDocumentsPaginatedInput!) {
  documents(input: $input) {
    metadata {
      statusCode
      message
    }
    data {
      id
      title
      content
      documentType
      documentCategoryId
      documentCategory {
        id
        name
      }
      fileId
      file {
        id
        driveFileId
        isPublic
      }
      status
      createdAt
      updatedAt
    }
    totalCount
    hasNextPage
  }
}

query GetDocument($id: Int!) {
  document(id: $id) {
    metadata {
      statusCode
      message
    }
    data {
      document {
        id
        title
        content
        documentType
        documentCategoryId
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
}
```

### Mutations

```graphql
mutation CreateDocument($createDocumentInput: CreateDocumentInput!, $file: Upload) {
  createDocument(createDocumentInput: $createDocumentInput, file: $file) {
    metadata {
      statusCode
      message
    }
    data {
      document {
        id
        title
        content
        documentType
        documentCategoryId
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
}

mutation UpdateDocument($updateDocumentInput: UpdateDocumentInput!) {
  updateDocument(updateDocumentInput: $updateDocumentInput) {
    metadata {
      statusCode
      message
    }
    data {
      document {
        id
        title
        content
        documentType
        documentCategoryId
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
}

mutation RemoveDocument($id: Int!) {
  removeDocument(id: $id) {
    metadata {
      statusCode
      message
    }
    data {
      success
    }
  }
}
```

## Cách sử dụng

### 1. Tạo văn bản mới

```typescript
// Trong component
createDocument(): void {
  this.showDocumentForm = true;
}

onDocumentSaved(document: Document): void {
  this.showDocumentForm = false;
  this.loadDocuments();
}
```

### 2. Tải danh sách văn bản

```typescript
loadDocuments(): void {
  this.isLoading = true;
  this.documentsService.getIncomingDocuments(1, 20, this.searchTerm || '').subscribe({
    next: (response) => {
      this.documents = response.data;
      this.applyFilters();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading documents:', error);
      this.isLoading = false;
    }
  });
}
```

### 3. Upload file

```typescript
// Trong document form
onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
  }
}

async onSubmit(): Promise<void> {
  const createInput: CreateDocumentInput = this.documentForm.value;
  const createdDocument = await this.documentsService.createDocument(createInput, this.selectedFile || undefined).toPromise();
  this.saved.emit(createdDocument);
}
```

### 4. Download file

```typescript
// Trong document detail component
async downloadFile(file: any): Promise<void> {
  try {
    await this.fileService.downloadFile(file.driveFileId, file.driveFileId);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}
```

## Lưu ý quan trọng

1. **Authentication**: Tất cả API calls cần có JWT token trong header
2. **File Upload**: Files được upload lên Google Drive và lưu trữ driveFileId
3. **Pagination**: Sử dụng cursor-based pagination với page, take, order parameters
4. **Error Handling**: Implement proper error handling cho tất cả API calls
5. **Loading States**: Hiển thị loading states khi đang tải dữ liệu
6. **File Types**: Chỉ cho phép upload các file types được định nghĩa (.pdf, .doc, .docx, .xls, .xlsx, .txt)

## Troubleshooting

### Lỗi thường gặp

1. **GraphQL Upload Error**: Đảm bảo đã cấu hình graphql-upload-ts
2. **Google Drive Permission**: Kiểm tra quyền truy cập Google Drive folder
3. **File Size Limit**: Kiểm tra giới hạn kích thước file
4. **CORS Issues**: Cấu hình CORS cho file download endpoints

### Debug

```typescript
// Enable GraphQL debugging
this.apollo.watchQuery({
  query: GET_DOCUMENTS_PAGINATED,
  variables: { input },
  errorPolicy: 'all'
}).valueChanges.subscribe({
  next: (result) => {
    console.log('GraphQL Result:', result);
  },
  error: (error) => {
    console.error('GraphQL Error:', error);
  }
});
```
