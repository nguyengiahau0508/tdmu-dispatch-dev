# Hướng dẫn Test Chức năng Edit Document

## 🎯 Mục tiêu
Test xem chức năng edit document có hoạt động đúng không (cập nhật document hiện tại thay vì tạo mới).

## 🚀 Chuẩn bị

### 1. Đảm bảo backend và frontend đang chạy
```bash
# Terminal 1: Backend
cd apps/backend
npm run start:dev

# Terminal 2: Frontend  
cd apps/frontend
npm run start
```

### 2. Đảm bảo database có dữ liệu
```bash
# Chạy seeder nếu cần
cd apps/backend
npm run seed
```

## 🧪 Các bước test

### Bước 1: Truy cập ứng dụng
1. Mở browser và truy cập: `http://localhost:4200`
2. Đăng nhập với tài khoản có quyền edit document

### Bước 2: Kiểm tra danh sách documents
1. Điều hướng đến trang "Tất cả văn bản"
2. Ghi nhớ ID và tiêu đề của một document để test

### Bước 3: Test chức năng Edit
1. **Click nút "Sửa"** trên document muốn edit
2. **Kiểm tra debug info** hiển thị trong form:
   - `isEditMode`: phải là `true`
   - `document.id`: phải có giá trị
   - `document.title`: phải hiển thị tiêu đề hiện tại

### Bước 4: Kiểm tra Console Logs
Mở Developer Tools (F12) và xem Console tab. Khi click "Sửa", bạn sẽ thấy:
```
=== onEditDocument ===
Document to edit: {id: 1, title: "...", ...}
Document ID: 1
Document title: ...

=== DocumentFormComponent ngOnChanges ===
Changes: {document: {...}}
Document input changed: {id: 1, title: "...", ...}
Document ID: 1

=== DocumentFormComponent ngOnInit ===
Input document: {id: 1, title: "...", ...}
Input documentType: undefined
Checking document for edit mode:
  - document exists: true
  - document.id: 1
  - document.id type: number
  - document.id truthy: true
✅ Setting edit mode - document with valid ID provided
Document ID: 1
Document title: ...
Final isEditMode: true
```

### Bước 5: Chỉnh sửa và lưu
1. **Thay đổi tiêu đề** document
2. **Thay đổi nội dung** hoặc trạng thái
3. **Click "Cập nhật"**

### Bước 6: Kiểm tra Console khi Submit
Khi click "Cập nhật", bạn sẽ thấy:
```
=== DocumentFormComponent onSubmit ===
isEditMode: true
document: {id: 1, title: "...", ...}
document.id: 1
documentForm.valid: true
documentForm.value: {title: "...", content: "...", ...}

Processed values: {title: "...", content: "...", ...}

✅ Executing UPDATE logic
Document ID for update: 1
Update input: {id: 1, title: "...", content: "...", ...}

=== DocumentsService.updateDocument ===
Update input: {id: 1, title: "...", content: "...", ...}

=== updateDocument mutation ===
Update input: {id: 1, title: "...", content: "...", ...}
Document ID: 1
User: 1 user@example.com

=== DocumentsService.update ===
ID to update: 1
Update input: {id: 1, title: "...", content: "...", ...}
Found entity: {id: 1, title: "...", ...}
Saving updated entity...
Saved document: {id: 1, title: "...", ...}
Loading document with relations...
Document with relations: {id: 1, title: "...", ...}
✅ Returning updated document: {id: 1, title: "...", ...}

Document updated successfully: {id: 1, title: "...", ...}

✅ Update successful: {id: 1, title: "...", ...}
```

### Bước 7: Verify kết quả
1. **Kiểm tra danh sách documents** - document phải được cập nhật với thông tin mới
2. **Kiểm tra database** - document phải có cùng ID nhưng thông tin đã thay đổi
3. **Kiểm tra không có document mới** được tạo

## 🔍 Các trường hợp cần test

### Trường hợp 1: Edit thành công
- ✅ `isEditMode = true`
- ✅ Gọi mutation `updateDocument`
- ✅ Document được cập nhật với cùng ID
- ✅ Không tạo document mới

### Trường hợp 2: Create mới
- ✅ `isEditMode = false` khi không có document
- ✅ Gọi mutation `createDocument`
- ✅ Tạo document mới với ID khác

### Trường hợp 3: Validation
- ✅ Form validation hoạt động
- ✅ Error handling khi có lỗi
- ✅ Loading state hiển thị đúng

## 🐛 Troubleshooting

### Nếu vẫn tạo document mới:
1. **Kiểm tra `isEditMode`** trong debug info
2. **Kiểm tra `document.id`** có tồn tại không
3. **Kiểm tra console logs** để xem logic nào được thực thi
4. **Kiểm tra backend logs** để xem mutation nào được gọi

### Nếu có lỗi authentication:
1. **Kiểm tra JWT token** có hợp lệ không
2. **Kiểm tra user role** có quyền edit không
3. **Kiểm tra token** có expired không

### Nếu có lỗi GraphQL:
1. **Kiểm tra mutation syntax**
2. **Kiểm tra input validation**
3. **Kiểm tra database constraints**

## 📊 Kết quả mong đợi

Sau khi test thành công:
- ✅ Edit document cập nhật document hiện tại
- ✅ Create document tạo document mới
- ✅ Debug info hiển thị chính xác
- ✅ Console logs theo dõi được quá trình xử lý
- ✅ Không có lỗi trong console

## 🧹 Cleanup

Sau khi test xong và xác nhận chức năng hoạt động đúng:
```bash
# Xóa debug info
node scripts/cleanup-debug-info.js
```

## 📝 Ghi chú

- Debug info chỉ để test, nên xóa sau khi fix xong
- Console logs giúp theo dõi quá trình xử lý
- Backup code trước khi test
- Test kỹ để đảm bảo không ảnh hưởng đến chức năng khác
