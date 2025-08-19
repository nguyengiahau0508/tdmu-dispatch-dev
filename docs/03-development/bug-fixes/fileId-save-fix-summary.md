# FileId Save Fix Summary

## 🐛 Vấn đề đã phát hiện

### Vấn đề: FileId không được lưu vào database khi tạo văn bản

**Mô tả**: 
- File được upload lên Google Drive thành công ✅
- File entity được tạo nhưng chưa được lưu vào database ❌
- Document entity được tạo với `fileId = fileEntity.id` (undefined) ❌
- Document được lưu vào database nhưng không có fileId ❌

**Nguyên nhân**: 
- Trong `DocumentsService.create()`, `fileEntity` chỉ là một object thông thường chưa được lưu vào database
- Khi gán `entityData.fileId = fileEntity.id`, `fileEntity.id` là `undefined` vì entity chưa được persist
- TypeORM cần entity được lưu trước khi có `id`

## 🔧 Giải pháp đã thực hiện

### 1. Import File Entity và Repository

```typescript
// Thêm import
import { File } from 'src/modules/files/entities/file.entity';

// Thêm File repository vào constructor
@InjectRepository(File)
private readonly fileRepository: Repository<File>,
```

### 2. Sửa logic tạo và lưu File Entity

**Trước (Có lỗi)**:
```typescript
fileEntity = {
  driveFileId: uploadedId,
  originalName: file.filename || fileInfo.name || 'unknown',
  mimeType: file.mimetype || fileInfo.mimeType || 'application/octet-stream',
  isPublic: false,
};
```

**Sau (Đã sửa)**:
```typescript
// Create and save file entity to database
const fileEntityData = {
  driveFileId: uploadedId,
  originalName: file.filename || fileInfo.name || 'unknown',
  mimeType: file.mimetype || fileInfo.mimeType || 'application/octet-stream',
  isPublic: false,
};

try {
  const fileEntityToSave = this.fileRepository.create(fileEntityData);
  const savedFileEntity = await this.fileRepository.save(fileEntityToSave);
  console.log('File entity saved to database:', savedFileEntity);
  
  fileEntity = savedFileEntity; // Bây giờ có id
} catch (fileSaveError) {
  console.error('Error saving file entity to database:', fileSaveError);
  // Try to delete the uploaded file from Google Drive if database save fails
  try {
    await this.googleDriveService.deleteFile(uploadedId);
    console.log('Deleted file from Google Drive due to database save failure');
  } catch (deleteError) {
    console.error('Failed to delete file from Google Drive:', deleteError);
  }
  throw new BadRequestException('Failed to save file information to database');
}
```

### 3. Thêm Error Handling và Rollback

- Thêm try-catch cho việc lưu file entity
- Nếu lưu file entity thất bại, xóa file đã upload trên Google Drive
- Đảm bảo tính nhất quán dữ liệu

### 4. Thêm Debug Logs

```typescript
console.log('File ID set for document:', fileEntity.id);
console.log('Document entity created:', {
  // ... other fields
  fileId: entity.fileId,
});
console.log('Document with relations loaded:', {
  // ... other fields
  fileId: documentWithRelations.fileId,
  hasFile: !!documentWithRelations.file,
  fileDriveId: documentWithRelations.file?.driveFileId
});
```

## 🧪 Testing

### Test Script
Tạo file `test-file-upload-fix.js` để test:
- Upload file lên Google Drive
- Lưu file entity vào database
- Tạo document với fileId đúng
- Verify fileId được lưu và link đúng

### Test Cases
1. **Happy Path**: Upload file thành công → fileId được lưu đúng
2. **Error Handling**: Lưu file entity thất bại → rollback Google Drive file
3. **Data Consistency**: Verify fileId được link đúng với file entity

## 📋 Checklist

- [x] Import File entity và repository
- [x] Sửa logic tạo và lưu file entity
- [x] Thêm error handling và rollback
- [x] Thêm debug logs
- [x] Test script
- [x] Build thành công
- [ ] Test thực tế với frontend
- [ ] Verify database records

## 🚀 Kết quả mong đợi

Sau khi áp dụng fix:
1. File được upload lên Google Drive ✅
2. File entity được lưu vào database với id ✅
3. Document entity được tạo với fileId đúng ✅
4. Document được lưu vào database với fileId ✅
5. Relationship giữa Document và File hoạt động đúng ✅

## 🔍 Monitoring

Để monitor fix có hoạt động:
1. Kiểm tra logs khi tạo document
2. Verify database records có fileId
3. Test GraphQL queries trả về file information
4. Kiểm tra frontend hiển thị file đúng
