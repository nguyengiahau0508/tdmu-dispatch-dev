# File Download Debug Guide

## 🐛 Vấn đề

Lỗi 404 khi tải file từ Google Drive:
```
Http failure response for http://localhost:3000/files/drive/16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc/download: 404 Not Found
```

## 🔍 Nguyên nhân có thể

### 1. **File không tồn tại trên Google Drive**
- File ID `16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc` có thể không tồn tại
- File có thể đã bị xóa hoặc di chuyển

### 2. **Vấn đề Authentication**
- Google Drive API không được xác thực đúng cách
- Token hết hạn hoặc không hợp lệ

### 3. **Vấn đề Permissions**
- File không public và user không có quyền truy cập
- File thuộc về user khác

### 4. **Vấn đề Route/Controller**
- Endpoint không được đăng ký đúng cách
- Controller không được import vào module

## 🔧 Debug Steps

### Step 1: Kiểm tra File Metadata
```bash
# Test endpoint để kiểm tra file có tồn tại không
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/files/drive/16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc/test
```

### Step 2: Kiểm tra Backend Logs
Backend sẽ log các thông tin sau:
```
Download request for file: 16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc
User: 1
Getting file stream...
Getting file info...
File info: { name: "test.pdf", mimeType: "application/pdf" }
```

### Step 3: Kiểm tra Google Drive API
```typescript
// Trong GoogleDriveService
async getFileMetadata(fileId: string): Promise<drive_v3.Schema$File> {
  try {
    const response = await this.driveClient.files.get({
      fileId,
      fields: 'id, name, mimeType, size, parents, createdTime',
    });
    console.log('Google Drive API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Google Drive API error:', error);
    throw error;
  }
}
```

## 📁 Files Modified

### Backend Files
- `apps/backend/src/modules/files/files.controller.ts`
  - Thêm logging cho download endpoint
  - Thêm test endpoint để debug
  - Cải thiện error handling

### Frontend Files
- `apps/frontend/src/app/core/services/file.service.ts`
  - Service đã có sẵn, không cần sửa

## 🧪 Testing

### Test 1: Kiểm tra File Metadata
```bash
# Sử dụng test endpoint
GET /files/drive/16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc/test
```

**Expected Response (Success)**:
```json
{
  "success": true,
  "fileInfo": {
    "id": "16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc",
    "name": "test.pdf",
    "mimeType": "application/pdf",
    "size": "1024"
  },
  "user": 1
}
```

**Expected Response (Error)**:
```json
{
  "success": false,
  "message": "File not found or access denied",
  "error": "File not found: 16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc",
  "fileId": "16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc",
  "user": 1
}
```

### Test 2: Kiểm tra Download Endpoint
```bash
# Sử dụng download endpoint
GET /files/drive/16tyTTUbtBF9Xux4eEXK2ffFLOIvPVPLc/download
```

**Expected Response**: File stream với headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="test.pdf"
```

## 🔧 Solutions

### Solution 1: File không tồn tại
```typescript
// Kiểm tra file có tồn tại trước khi download
const fileInfo = await this.googleDriveService.getFileMetadata(driveFileId);
if (!fileInfo) {
  throw new Error(`File not found: ${driveFileId}`);
}
```

### Solution 2: Authentication Issues
```typescript
// Kiểm tra Google Drive authentication
const auth = this.googleOauth2Service.getAuthenticatedClient();
if (!auth) {
  throw new Error('Google Drive not authenticated');
}
```

### Solution 3: Permissions Issues
```typescript
// Kiểm tra file permissions
const fileInfo = await this.googleDriveService.getFileMetadata(driveFileId);
if (fileInfo.permissions) {
  // Check if user has access
  const hasAccess = fileInfo.permissions.some(p => 
    p.role === 'owner' || p.role === 'writer' || p.role === 'reader'
  );
  if (!hasAccess) {
    throw new Error('Access denied to file');
  }
}
```

## 🚀 Quick Fixes

### Fix 1: Thêm Error Handling
```typescript
// Trong FileService
downloadFromDrive(driveFileId: string): Observable<Blob> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.authState.getAccessToken()}`
  });

  return this.http.get(`${this.apiUrl}/files/drive/${driveFileId}/download`, {
    responseType: 'blob',
    headers,
  }).pipe(
    catchError(error => {
      console.error('Download error:', error);
      if (error.status === 404) {
        throw new Error(`File not found: ${driveFileId}`);
      }
      throw new Error('Download failed');
    })
  );
}
```

### Fix 2: Thêm File Validation
```typescript
// Trong DocumentDetailComponent
async downloadFile(file: any): Promise<void> {
  try {
    if (!file?.driveFileId) {
      throw new Error('Invalid file ID');
    }
    
    await this.fileService.downloadFile(file.driveFileId, file.originalName || 'download');
  } catch (error) {
    console.error('Error downloading file:', error);
    // Show user-friendly error message
    alert('Không thể tải file. Vui lòng thử lại sau.');
  }
}
```

## 📊 Debug Checklist

- [ ] **Backend logs**: Kiểm tra console logs khi download
- [ ] **File metadata**: Test endpoint `/files/drive/{id}/test`
- [ ] **Authentication**: Kiểm tra Google Drive auth
- [ ] **File existence**: Xác nhận file tồn tại trên Google Drive
- [ ] **Permissions**: Kiểm tra quyền truy cập file
- [ ] **Frontend error**: Kiểm tra browser network tab
- [ ] **Token validity**: Kiểm tra JWT token

## 🎯 Next Steps

1. **Test file metadata** trước khi download
2. **Kiểm tra backend logs** để xem lỗi cụ thể
3. **Verify Google Drive authentication**
4. **Check file permissions** trên Google Drive
5. **Implement proper error handling** trên frontend

Hãy chạy test endpoint trước để xác định nguyên nhân chính xác! 🔍
