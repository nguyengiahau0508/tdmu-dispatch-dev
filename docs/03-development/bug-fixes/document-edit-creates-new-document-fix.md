# Sửa lỗi: Edit Document tạo ra Document mới thay vì cập nhật

## Mô tả vấn đề
Khi người dùng chỉnh sửa một công văn, hệ thống tạo ra một công văn mới có ID khác thay vì cập nhật công văn hiện tại.

## Nguyên nhân có thể
1. **Frontend không truyền đúng `id` khi cập nhật**
2. **Logic kiểm tra `isEditMode` không chính xác**
3. **Backend mutation không xử lý đúng**
4. **Authentication issues**

## Các thay đổi đã thực hiện

### 1. Cải thiện logic kiểm tra `isEditMode` trong `DocumentFormComponent`

```typescript
// Trước
if (this.document) {
  this.isEditMode = true;
}

// Sau
if (this.document && this.document.id && typeof this.document.id === 'number' && this.document.id > 0) {
  this.isEditMode = true;
}
```

### 2. Thêm debug logs để theo dõi

```typescript
// Trong ngOnInit
console.log('Checking document for edit mode:');
console.log('  - document exists:', !!this.document);
console.log('  - document.id:', this.document?.id);
console.log('  - document.id type:', typeof this.document?.id);
console.log('  - document.id truthy:', !!this.document?.id);
```

### 3. Cải thiện việc copy document object

```typescript
// Trong AllDocumentsComponent.onEditDocument
// Trước
this.documentToEdit = { ...document };

// Sau
this.documentToEdit = JSON.parse(JSON.stringify(document));
```

### 4. Thêm validation chặt chẽ trong onSubmit

```typescript
// Kiểm tra chặt chẽ hơn cho chế độ edit
if (this.isEditMode && this.document && this.document.id && typeof this.document.id === 'number' && this.document.id > 0) {
  // Thực hiện UPDATE
} else {
  // Thực hiện CREATE
}
```

### 5. Thêm debug info trong template

```html
<!-- Debug info -->
<div style="background: #f0f0f0; padding: 5px; margin-top: 5px; border-radius: 3px; font-size: 11px;">
  <strong>Debug:</strong> isEditMode={{ isEditMode }}, document.id={{ document?.id }}, document.title={{ document?.title }}
</div>
```

## Cách test và debug

### 1. Kiểm tra console logs
Mở Developer Tools và xem console logs khi edit document:
- `=== onEditDocument ===`
- `=== DocumentFormComponent ngOnChanges ===`
- `=== DocumentFormComponent ngOnInit ===`
- `=== DocumentFormComponent onSubmit ===`

### 2. Kiểm tra debug info trong UI
Debug info sẽ hiển thị trong form khi edit document:
- `isEditMode`: true/false
- `document.id`: ID của document
- `document.title`: Tiêu đề document

### 3. Test mutation trực tiếp
Sử dụng file test để kiểm tra mutation:

```bash
# Test không có auth
node test/test-document-update-simple.js

# Test với auth (cần set AUTH_TOKEN)
export AUTH_TOKEN="your-jwt-token"
node test/test-document-update-with-auth.js
```

### 4. Kiểm tra backend logs
Xem logs trong backend console:
- `=== updateDocument mutation ===`
- `=== DocumentsService.update ===`

## Các bước tiếp theo

1. **Test với document thực tế**: Thay đổi ID trong test files thành ID thực tế
2. **Kiểm tra authentication**: Đảm bảo user có quyền edit document
3. **Verify database**: Kiểm tra database để xem document có được update đúng không
4. **Monitor logs**: Theo dõi logs để phát hiện vấn đề

## Troubleshooting

### Nếu vẫn tạo document mới:
1. Kiểm tra `isEditMode` có đúng `true` không
2. Kiểm tra `document.id` có tồn tại và đúng type không
3. Kiểm tra mutation có được gọi đúng không
4. Kiểm tra authentication có đúng không

### Nếu có lỗi authentication:
1. Kiểm tra JWT token có hợp lệ không
2. Kiểm tra user có role phù hợp không
3. Kiểm tra token có expired không

### Nếu có lỗi GraphQL:
1. Kiểm tra mutation syntax
2. Kiểm tra input validation
3. Kiểm tra database constraints

## Files đã thay đổi

- `apps/frontend/src/app/features/user/all-documents/all-documents.component.ts`
- `apps/frontend/src/app/features/user/all-documents/all-documents.component.html`
- `apps/frontend/src/app/features/user/document-form/document-form.component.ts`
- `apps/frontend/src/app/core/services/dispatch/documents.service.ts`
- `apps/backend/src/modules/dispatch/documents/documents.resolver.ts`
- `apps/backend/src/modules/dispatch/documents/documents.service.ts`
- `test/test-document-update-simple.js`
- `test/test-document-update-with-auth.js`
