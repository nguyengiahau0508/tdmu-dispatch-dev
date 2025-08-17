# Hướng Dẫn Debug Vấn Đề Update Document

## 🐛 Vấn đề
Khi cập nhật văn bản, hệ thống tạo ra văn bản mới thay vì cập nhật văn bản hiện có.

## 🔍 Phân tích vấn đề

### 1. Backend API
- ✅ `updateDocument` mutation tồn tại
- ✅ `DocumentsService.update()` method hoạt động đúng
- ✅ GraphQL schema đúng

### 2. Frontend Logic
- ✅ `DocumentFormComponent` có logic đúng
- ✅ `onSubmit()` method có phân biệt create/update
- ✅ `isEditMode` được set đúng

### 3. Component Communication
- ❓ Có thể có vấn đề với việc truyền `document` prop
- ❓ Có thể có vấn đề với template binding

## 🧪 Debug Steps

### Step 1: Kiểm tra Backend API
```bash
# Chạy script test backend
node debug-document-update.js
```

**Expected Output:**
```
✅ Backend API: WORKING
✅ Create Document: WORKING
✅ Update Document: WORKING
✅ Document ID Consistency: WORKING
✅ No Duplicate Creation: WORKING
```

### Step 2: Kiểm tra Frontend Logic
```bash
# Chạy script test frontend logic
node debug-frontend-logic.js
```

**Expected Output:**
```
✅ Test Case 1 (Edit): UPDATE 123
✅ Test Case 2 (Create): CREATE No ID
✅ Test Case 3 (Create): CREATE No ID
```

### Step 3: Kiểm tra Browser Console
1. Mở Developer Tools (F12)
2. Chuyển sang tab Console
3. Thực hiện edit document
4. Kiểm tra logs:

**Expected Logs khi Edit:**
```
=== DocumentFormComponent ngOnInit ===
Input document: {id: 123, title: "Test Document", ...}
Input documentType: undefined
✅ Setting edit mode - document provided
Document ID: 123
Document title: Test Document
Final isEditMode: true

=== DocumentFormComponent onSubmit ===
isEditMode: true
document: {id: 123, title: "Test Document", ...}
✅ Executing UPDATE logic
Update input: {id: 123, title: "Updated Title", ...}
✅ Update successful: {id: 123, title: "Updated Title", ...}
```

**Expected Logs khi Create:**
```
=== DocumentFormComponent ngOnInit ===
Input document: undefined
Input documentType: INCOMING
✅ Setting create mode - only documentType provided
Final isEditMode: false

=== DocumentFormComponent onSubmit ===
isEditMode: false
document: undefined
✅ Executing CREATE logic
Create input: {title: "New Document", ...}
✅ Create successful: {id: 124, title: "New Document", ...}
```

## 🔧 Debug Scripts

### 1. Backend Debug Script (`debug-document-update.js`)
- Test create document
- Test update document
- Verify document ID consistency
- Check for duplicate creation

### 2. Frontend Logic Debug Script (`debug-frontend-logic.js`)
- Simulate DocumentFormComponent logic
- Test different input scenarios
- Verify isEditMode logic
- Test edge cases

## 🚨 Các vấn đề có thể gặp

### 1. Component không nhận được document prop
**Symptoms:**
- Console log: `Input document: undefined`
- `isEditMode: false` khi đáng lẽ phải là `true`

**Causes:**
- Template binding sai
- Parent component không truyền document
- Angular change detection không hoạt động

**Solutions:**
```typescript
// Kiểm tra template binding
<app-document-form
  [document]="documentToEdit"  // ← Đảm bảo có dòng này
  [documentType]="'INCOMING'"
  (saved)="onDocumentSaved($event)"
  (cancelled)="onDocumentFormCancelled()"
></app-document-form>
```

### 2. GraphQL mutation gọi sai
**Symptoms:**
- Console log: `✅ Executing UPDATE logic` nhưng vẫn tạo document mới
- Network tab hiển thị `createDocument` thay vì `updateDocument`

**Causes:**
- GraphQL mutation sai
- Apollo Client cache issue
- Backend routing sai

**Solutions:**
```typescript
// Kiểm tra GraphQL mutation
const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($updateDocumentInput: UpdateDocumentInput!) {
    updateDocument(updateDocumentInput: $updateDocumentInput) {
      // ...
    }
  }
`;
```

### 3. Form validation fail
**Symptoms:**
- Console log: `❌ Form is invalid, returning`
- Form không submit được

**Causes:**
- Required fields missing
- Invalid data types
- Validation errors

**Solutions:**
```typescript
// Kiểm tra form validation
console.log('documentForm.errors:', this.documentForm.errors);
console.log('documentForm.valid:', this.documentForm.valid);
```

## 📋 Checklist Debug

### Backend
- [ ] `updateDocument` mutation tồn tại
- [ ] `DocumentsService.update()` method hoạt động
- [ ] GraphQL schema đúng
- [ ] Database update thành công

### Frontend
- [ ] `DocumentFormComponent` nhận được document prop
- [ ] `isEditMode` được set đúng
- [ ] `onSubmit()` logic đúng
- [ ] GraphQL mutation gọi đúng
- [ ] Form validation pass

### Component Communication
- [ ] Parent component truyền document đúng
- [ ] Template binding đúng
- [ ] Angular change detection hoạt động
- [ ] Event handling đúng

## 🎯 Kết quả mong đợi

Sau khi debug thành công:

1. **Edit Mode**: 
   - `isEditMode: true`
   - Gọi `updateDocument` mutation
   - Document ID không thay đổi

2. **Create Mode**:
   - `isEditMode: false`
   - Gọi `createDocument` mutation
   - Tạo document mới với ID mới

## 📝 Notes

- Backend API đã được verify hoạt động đúng
- Vấn đề có thể nằm ở frontend logic hoặc component communication
- Debug logs đã được thêm vào để track vấn đề
- Cần kiểm tra browser console để xem logs chi tiết
