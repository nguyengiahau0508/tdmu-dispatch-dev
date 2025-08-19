# Hướng Dẫn Debug Vấn Đề Update Document

## 🐛 Vấn đề
Khi cập nhật văn bản, hệ thống tạo ra văn bản mới thay vì cập nhật văn bản hiện có.

## 🔍 Phân tích vấn đề

Dựa vào debug logs và phân tích code, tôi nghi ngờ vấn đề có thể là:

### 1. **Component không nhận được `document` prop** (Nguyên nhân phổ biến nhất)
- `DocumentFormComponent` không nhận được `document` input
- `isEditMode` luôn là `false`
- Luôn thực hiện CREATE logic thay vì UPDATE

### 2. **Template binding có vấn đề**
- `[document]="documentToEdit"` không hoạt động
- Angular change detection không cập nhật

### 3. **GraphQL mutation gọi sai**
- Gọi `createDocument` thay vì `updateDocument`
- Apollo Client cache issue

## 🧪 Debug Steps

### Step 1: Kiểm tra Backend API
```bash
# Chạy script test backend (không cần dependencies)
node test-backend-api.js
```

**Expected Output:**
```
✅ Backend API: WORKING
✅ Create Document: WORKING
✅ Update Document: WORKING
✅ Document ID Consistency: WORKING
✅ No Duplicate Creation: WORKING
```

### Step 2: Kiểm tra Browser Console Logs

1. **Mở Developer Tools (F12)**
2. **Chuyển sang tab Console**
3. **Thực hiện edit document:**
   - Click "Chỉnh sửa" trên một văn bản
   - Thay đổi nội dung
   - Click "Cập nhật"

4. **Kiểm tra logs theo thứ tự:**

#### **Log 1: IncomingDocuments onEditDocument**
```
=== IncomingDocuments onEditDocument ===
Document to edit: {id: 123, title: "Test Document", ...}
Document ID: 123
Document title: Test Document
After setting:
documentToEdit: {id: 123, title: "Test Document", ...}
showDocumentForm: true
```

#### **Log 2: DocumentFormComponent ngOnInit**
```
=== DocumentFormComponent ngOnInit ===
Input document: {id: 123, title: "Test Document", ...}
Input documentType: INCOMING
✅ Setting edit mode - document provided
Document ID: 123
Document title: Test Document
Final isEditMode: true
```

#### **Log 3: DocumentFormComponent onSubmit**
```
=== DocumentFormComponent onSubmit ===
isEditMode: true
document: {id: 123, title: "Test Document", ...}
documentForm.valid: true
documentForm.value: {title: "Updated Title", ...}
Processed values: {title: "Updated Title", ...}
✅ Executing UPDATE logic
Update input: {id: 123, title: "Updated Title", ...}
✅ Update successful: {id: 123, title: "Updated Title", ...}
```

## 🚨 Các vấn đề có thể gặp

### **Vấn đề 1: Component không nhận được document prop**

**Symptoms:**
```
=== DocumentFormComponent ngOnInit ===
Input document: undefined  ← VẤN ĐỀ Ở ĐÂY
Input documentType: INCOMING
✅ Setting create mode - only documentType provided
Final isEditMode: false  ← VẤN ĐỀ Ở ĐÂY
```

**Causes:**
- Template binding sai
- Parent component không truyền document
- Angular change detection không hoạt động

**Solutions:**
1. Kiểm tra template binding:
```html
<app-document-form
  [document]="documentToEdit"  ← Đảm bảo có dòng này
  [documentType]="'INCOMING'"
  (saved)="onDocumentSaved($event)"
  (cancelled)="onDocumentFormCancelled()"
></app-document-form>
```

2. Kiểm tra parent component logic:
```typescript
onEditDocument(document: Document): void {
  console.log('Document to edit:', document); // ← Kiểm tra log này
  this.documentToEdit = document;
  this.showDocumentForm = true;
}
```

### **Vấn đề 2: GraphQL mutation gọi sai**

**Symptoms:**
```
=== DocumentFormComponent onSubmit ===
isEditMode: true  ← Đúng
document: {id: 123, ...}  ← Đúng
✅ Executing UPDATE logic  ← Đúng
Update input: {id: 123, ...}  ← Đúng
✅ Update successful: {id: 124, ...}  ← VẤN ĐỀ: ID thay đổi!
```

**Causes:**
- Backend vẫn tạo document mới
- GraphQL mutation routing sai
- Database constraint issue

**Solutions:**
1. Kiểm tra backend logs
2. Kiểm tra database constraints
3. Verify GraphQL schema

### **Vấn đề 3: Form validation fail**

**Symptoms:**
```
=== DocumentFormComponent onSubmit ===
isEditMode: true
document: {id: 123, ...}
documentForm.valid: false  ← VẤN ĐỀ Ở ĐÂY
❌ Form is invalid, returning
```

**Causes:**
- Required fields missing
- Invalid data types
- Validation errors

**Solutions:**
```typescript
// Thêm debug logs
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

## 📝 Debug Scripts

### 1. `test-backend-api.js`
- Test backend API không cần dependencies
- Verify create/update operations
- Check document ID consistency

### 2. `debug-frontend-logic.js`
- Simulate frontend logic
- Test different scenarios
- Verify isEditMode logic

## 🔧 Cách sử dụng

1. **Chạy backend test:**
```bash
node test-backend-api.js
```

2. **Mở browser console và thực hiện edit document**

3. **Kiểm tra logs theo thứ tự đã liệt kê**

4. **Xác định vấn đề dựa vào symptoms**

5. **Áp dụng solution tương ứng**

## 💡 Tips

- Luôn kiểm tra browser console logs trước
- Backend API đã được verify hoạt động đúng
- Vấn đề thường nằm ở frontend component communication
- Debug logs đã được thêm vào để track vấn đề
