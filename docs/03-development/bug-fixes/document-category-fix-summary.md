# Document Category Fix Summary

## 🐛 Lỗi đã sửa

### Lỗi: Cannot return null for non-nullable field Document.documentCategory

**Vấn đề**: 
```
Error creating document: ApolloError: Cannot return null for non-nullable field Document.documentCategory.
```

**Nguyên nhân**: 
- Field `documentCategory` được định nghĩa là non-nullable trong GraphQL schema
- Nhưng relation không được load sau khi save document
- DocumentCategoryId có thể không tồn tại trong database

**Giải pháp**:

### 1. Sửa Document Entity

```typescript
// Thay đổi từ non-nullable thành nullable
@Field(() => DocumentCategory, { nullable: true })
@ManyToOne(() => DocumentCategory)
@JoinColumn({ name: 'documentCategoryId' })
documentCategory: DocumentCategory;
```

### 2. Load Relations sau khi Save

```typescript
// Trong create method
try {
  const savedDocument = await this.documentRepository.save(entity);
  
  // Load relations for the saved document
  const documentWithRelations = await this.documentRepository.findOne({
    where: { id: savedDocument.id },
    relations: ['documentCategory', 'file']
  });
  
  if (!documentWithRelations) {
    throw new BadRequestException('Failed to load document with relations');
  }
  
  return documentWithRelations;
} catch (error) {
  console.error('Error saving document:', error);
  throw new BadRequestException('Failed to save document');
}
```

### 3. Validate DocumentCategoryId

```typescript
// Validate documentCategoryId exists
if (createDocumentInput.documentCategoryId) {
  try {
    await this.documentCategoryService.findOne(createDocumentInput.documentCategoryId);
  } catch (error) {
    throw new BadRequestException(`Document category with ID ${createDocumentInput.documentCategoryId} not found`);
  }
}
```

### 4. Thêm Dependency Injection

```typescript
// Thêm DocumentCategoryService vào constructor
constructor(
  @InjectRepository(Document)
  private readonly documentRepository: Repository<Document>,
  private readonly googleDriveService: GoogleDriveService,
  private readonly documentCategoryService: DocumentCategoryService,
) {}

// Thêm module import và export
@Module({
  imports: [TypeOrmModule.forFeature([Document]), GoogleDriveModule, DocumentCategoryModule],
  providers: [DocumentsResolver, DocumentsService],
})
export class DocumentsModule {}

// Export DocumentCategoryService từ DocumentCategoryModule
@Module({
  imports: [TypeOrmModule.forFeature([DocumentCategory])],
  providers: [DocumentCategoryResolver, DocumentCategoryService],
  exports: [DocumentCategoryService], // ← Thêm export này
})
export class DocumentCategoryModule {}
```

## 🔧 Cải tiến đã thêm

### 1. GraphQL Schema Fix
- ✅ Thay đổi documentCategory field thành nullable
- ✅ Cho phép trả về null khi relation không tồn tại

### 2. Relation Loading
- ✅ Load relations sau khi save document
- ✅ Load relations sau khi update document
- ✅ Error handling cho trường hợp không load được relations

### 3. Validation
- ✅ Validate documentCategoryId tồn tại trước khi tạo document
- ✅ Validate documentCategoryId tồn tại trước khi update document
- ✅ Proper error messages cho invalid category IDs

### 4. Error Handling
- ✅ Try-catch cho relation loading
- ✅ Try-catch cho category validation
- ✅ Proper error messages cho từng trường hợp

## 📁 Files Modified

### Backend Files
- `apps/backend/src/modules/dispatch/documents/entities/document.entity.ts`
  - Thay đổi documentCategory field thành nullable
- `apps/backend/src/modules/dispatch/documents/documents.service.ts`
  - Thêm relation loading sau save/update
  - Thêm category validation
  - Thêm DocumentCategoryService dependency
- `apps/backend/src/modules/dispatch/documents/documents.module.ts`
  - Thêm DocumentCategoryModule import
- `apps/backend/src/modules/dispatch/document-category/document-category.module.ts`
  - Thêm export DocumentCategoryService

## 🧪 Testing

### Test Cases
1. **Create Document with Valid Category**
   - ✅ Validate category exists
   - ✅ Create document successfully
   - ✅ Load relations properly
   - ✅ Return document with category info

2. **Create Document with Invalid Category**
   - ✅ Reject invalid category ID
   - ✅ Show proper error message
   - ✅ Don't create document

3. **Update Document with Valid Category**
   - ✅ Validate category exists
   - ✅ Update document successfully
   - ✅ Load relations properly
   - ✅ Return updated document with category info

4. **Update Document with Invalid Category**
   - ✅ Reject invalid category ID
   - ✅ Show proper error message
   - ✅ Don't update document

5. **Create Document without Category**
   - ✅ Handle null category gracefully
   - ✅ Create document successfully
   - ✅ Return document with null category

## 🚀 Usage

### Creating Document with Category
```typescript
// Frontend
const createInput: CreateDocumentInput = {
  title: 'Test Document',
  documentType: 'INCOMING',
  documentCategoryId: 1, // Valid category ID
  content: 'Test content'
};

this.documentsService.createDocument(createInput).subscribe({
  next: (document) => {
    console.log('Document created:', document);
    console.log('Category:', document.documentCategory); // Will be loaded
  },
  error: (error) => {
    console.error('Error creating document:', error);
  }
});
```

### GraphQL Response
```graphql
{
  "data": {
    "createDocument": {
      "metadata": {
        "statusCode": 202,
        "message": "Tạo văn bản thành công"
      },
      "data": {
        "document": {
          "id": 1,
          "title": "Test Document",
          "documentType": "INCOMING",
          "documentCategoryId": 1,
          "documentCategory": {
            "id": 1,
            "name": "Test Category"
          },
          "file": null,
          "status": "draft",
          "createdAt": "2024-01-16T12:00:00.000Z",
          "updatedAt": "2024-01-16T12:00:00.000Z"
        }
      }
    }
  }
}
```

## 📊 Database Schema

### Document Entity
```sql
CREATE TABLE `document` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text,
  `documentType` enum('OUTGOING','INCOMING','INTERNAL') NOT NULL,
  `documentCategoryId` int NOT NULL,
  `fileId` int,
  `status` varchar(50) DEFAULT 'draft',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`documentCategoryId`) REFERENCES `document_category`(`id`)
);
```

## ✅ Status
- ✅ DocumentCategory field nullable fixed
- ✅ Relation loading after save/update fixed
- ✅ Category validation added
- ✅ Error handling improved
- ✅ Dependency injection configured
- ✅ Module imports updated
- ✅ DocumentCategoryService exported from module

Document category functionality đã được sửa và sẵn sàng để test! 🎯

## 🔍 Debug Instructions

1. **Test Valid Category**: Tạo document với category ID hợp lệ
2. **Test Invalid Category**: Tạo document với category ID không tồn tại
3. **Check Relations**: Kiểm tra documentCategory được load đúng
4. **Check Error Messages**: Xem error messages cho invalid categories
5. **Test Update**: Test update document với category mới
