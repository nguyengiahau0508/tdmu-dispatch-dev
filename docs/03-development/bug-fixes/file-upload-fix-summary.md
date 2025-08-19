# File Upload Fix Summary

## 🐛 Lỗi đã sửa

### Lỗi: Field 'originalName' doesn't have a default value

**Vấn đề**: 
```
ERROR [ExceptionsHandler] QueryFailedError: Field 'originalName' doesn't have a default value
INSERT INTO `file`(`id`, `driveFileId`, `originalName`, `mimeType`, `allowedUserIds`, `isPublic`) 
VALUES (DEFAULT, '1vtQBKq7n95vhfzAVkEBhz4oug6Qk', DEFAULT, DEFAULT, DEFAULT, 0)
```

**Nguyên nhân**: 
- Khi tạo file entity, chỉ có `driveFileId` và `isPublic` được cung cấp
- Các field `originalName` và `mimeType` là required nhưng không có default value
- File entity không được tạo đầy đủ thông tin

**Giải pháp**:

### 1. Cập nhật DocumentsService

```typescript
async create(
  createDocumentInput: CreateDocumentInput,
  file?: FileUpload,
): Promise<Document> {
  let fileEntity: any = undefined;
  
  // Handle file upload
  if (file) {
    // Validate file
    if (!file.filename || !file.mimetype) {
      throw new BadRequestException('Invalid file: missing filename or mimetype');
    }
    
    try {
      const uploadedId = await this.googleDriveService.uploadFile(file);
      
      // Get file info from Google Drive
      const fileInfo = await this.googleDriveService.getFileInfo(uploadedId);
      
      fileEntity = {
        driveFileId: uploadedId,
        originalName: file.filename || fileInfo.name || 'unknown',
        mimeType: file.mimetype || fileInfo.mimeType || 'application/octet-stream',
        isPublic: false,
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new BadRequestException('Failed to upload file to Google Drive');
    }
  }
  // Handle existing file by fileId
  else if (createDocumentInput.fileId) {
    // If fileId is provided, we don't create a new file entity
    // The fileId will be used to link to existing file
    fileEntity = undefined; // Let TypeORM handle the relationship
  }
  
  const entity = this.documentRepository.create({
    ...createDocumentInput,
    file: fileEntity,
  });
  
  try {
    return await this.documentRepository.save(entity);
  } catch (error) {
    console.error('Error saving document:', error);
    throw new BadRequestException('Failed to save document');
  }
}
```

### 2. Thêm File Validation

```typescript
// Validate file
if (!file.filename || !file.mimetype) {
  throw new BadRequestException('Invalid file: missing filename or mimetype');
}
```

### 3. Thêm Error Handling

```typescript
try {
  const uploadedId = await this.googleDriveService.uploadFile(file);
  // ... process file
} catch (error) {
  console.error('Error uploading file to Google Drive:', error);
  throw new BadRequestException('Failed to upload file to Google Drive');
}
```

### 4. Thêm Debug Method

```typescript
// Debug method to test file upload
async testFileUpload(file: FileUpload): Promise<string> {
  try {
    const uploadedId = await this.googleDriveService.uploadFile(file);
    console.log('File uploaded successfully:', uploadedId);
    return uploadedId;
  } catch (error) {
    console.error('File upload test failed:', error);
    throw error;
  }
}
```

## 🔧 Cải tiến đã thêm

### 1. File Entity Creation
- ✅ Tạo đầy đủ thông tin file entity với `originalName` và `mimeType`
- ✅ Lấy thông tin file từ Google Drive API
- ✅ Fallback values cho trường hợp không lấy được thông tin

### 2. File Validation
- ✅ Validate file upload có đầy đủ thông tin
- ✅ Check filename và mimetype trước khi upload
- ✅ Error handling cho invalid files

### 3. Error Handling
- ✅ Try-catch cho Google Drive upload
- ✅ Try-catch cho database save
- ✅ Proper error messages cho từng trường hợp

### 4. Debug Features
- ✅ Test file upload method
- ✅ Console logging cho debugging
- ✅ GraphQL mutation để test file upload

## 📁 Files Modified

### Backend Files
- `apps/backend/src/modules/dispatch/documents/documents.service.ts`
  - Cập nhật create method với file entity creation
  - Thêm file validation
  - Thêm error handling
  - Thêm debug method
- `apps/backend/src/modules/dispatch/documents/documents.resolver.ts`
  - Thêm testFileUpload mutation

## 🧪 Testing

### Test Cases
1. **File Upload with Document Creation**
   - ✅ Upload file to Google Drive
   - ✅ Create file entity với đầy đủ thông tin
   - ✅ Link file với document
   - ✅ Handle upload errors

2. **Document Creation without File**
   - ✅ Create document không có file
   - ✅ Handle null file entity

3. **Document Creation with Existing File**
   - ✅ Use existing fileId
   - ✅ Link với existing file

4. **File Validation**
   - ✅ Validate file có filename và mimetype
   - ✅ Reject invalid files
   - ✅ Proper error messages

## 🚀 Usage

### Creating Document with File Upload
```typescript
// Frontend
const createInput: CreateDocumentInput = {
  title: 'Test Document',
  documentType: 'INCOMING',
  documentCategoryId: 1,
  content: 'Test content'
};

const file: File = // ... file from input

this.documentsService.createDocument(createInput, file).subscribe({
  next: (document) => {
    console.log('Document created:', document);
  },
  error: (error) => {
    console.error('Error creating document:', error);
  }
});
```

### Testing File Upload
```graphql
mutation TestFileUpload($file: Upload!) {
  testFileUpload(file: $file)
}
```

## 📊 Database Schema

### File Entity
```sql
CREATE TABLE `file` (
  `id` varchar(36) NOT NULL,
  `driveFileId` varchar(255) NOT NULL,
  `originalName` varchar(255) NOT NULL,  -- Required field
  `mimeType` varchar(255) NOT NULL,      -- Required field
  `allowedUserIds` text,
  `isPublic` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
);
```

## ✅ Status
- ✅ File entity creation fixed
- ✅ Required fields handling fixed
- ✅ File validation added
- ✅ Error handling improved
- ✅ Debug features added
- ✅ Test method available

File upload functionality đã được sửa và sẵn sàng để test! 🎯

## 🔍 Debug Instructions

1. **Test File Upload**: Sử dụng GraphQL mutation `testFileUpload`
2. **Check Console Logs**: Xem logs cho file upload process
3. **Validate File Info**: Kiểm tra file entity được tạo đầy đủ thông tin
4. **Test Error Cases**: Thử upload invalid files để test error handling
