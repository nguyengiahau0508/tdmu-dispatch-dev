# 🧪 Hướng dẫn kiểm tra Task Assignment

## ✅ **Trạng thái hệ thống:**

- ✅ **Backend**: Đang chạy tại `http://localhost:3000/graphql`
- ✅ **Frontend**: Đang chạy tại `http://localhost:4200`
- ✅ **TaskStatus enum**: Đã có sẵn (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- ✅ **Components**: Đã được tích hợp và compile thành công

## 🔍 **Cách kiểm tra nút "Giao việc":**

### **Bước 1: Truy cập ứng dụng**
1. Mở browser và truy cập: `http://localhost:4200`
2. Đăng nhập với user có quyền giao việc (SYSTEM_ADMIN, UNIVERSITY_LEADER, hoặc DEPARTMENT_STAFF)

### **Bước 2: Tạo hoặc mở document**
1. Tạo một document mới hoặc mở document có sẵn để edit
2. **Quan trọng**: Nút "Giao việc" chỉ hiển thị khi:
   - `isEditMode = true` (đang edit document)
   - `document` tồn tại (có document data)

### **Bước 3: Tìm nút "Giao việc"**
- Nút sẽ xuất hiện trong **form actions** (cùng hàng với "Hủy" và "Cập nhật")
- Icon: `assignment.svg` (hình clipboard)
- Text: "Giao việc"
- Màu: `btn-info` (xanh dương)

## 🎯 **Các vị trí có thể tìm thấy nút "Giao việc":**

### **1. Document Form (Khi edit document)**
```
[Giao việc] [Hủy] [Cập nhật]
```

### **2. Task Management Page**
```
[Giao việc mới] [Làm mới]
```

### **3. Sidebar Menu**
```
📋 Quản lý công việc (với notification badge)
```

## 🔧 **Nếu không thấy nút "Giao việc":**

### **Kiểm tra 1: User Permissions**
```typescript
// User phải có một trong các role sau:
- SYSTEM_ADMIN
- UNIVERSITY_LEADER  
- DEPARTMENT_STAFF
```

### **Kiểm tra 2: Document Mode**
```typescript
// Chỉ hiển thị khi:
isEditMode === true && document !== null
```

### **Kiểm tra 3: Browser Console**
1. Mở Developer Tools (F12)
2. Kiểm tra Console tab có lỗi không
3. Kiểm tra Network tab có request lỗi không

### **Kiểm tra 4: Component State**
```typescript
// Trong document-form.component.ts:
console.log('isEditMode:', this.isEditMode);
console.log('document:', this.document);
console.log('showTaskAssignmentModal:', this.showTaskAssignmentModal);
```

## 🧪 **Test Cases:**

### **Test Case 1: Tạo document mới**
1. Click "Tạo văn bản mới"
2. Điền form và lưu
3. Mở document vừa tạo để edit
4. Kiểm tra có nút "Giao việc" không

### **Test Case 2: Edit document có sẵn**
1. Mở một document có sẵn
2. Click "Chỉnh sửa"
3. Kiểm tra có nút "Giao việc" không

### **Test Case 3: Giao việc**
1. Click nút "Giao việc"
2. Modal sẽ mở với form
3. Chọn user từ dropdown
4. Điền task description
5. Submit form

### **Test Case 4: Task Management**
1. Truy cập sidebar → "Quản lý công việc"
2. Kiểm tra statistics cards
3. Kiểm tra tabs "Công việc được giao" / "Công việc tôi giao"
4. Test search và filter

## 🐛 **Debug Commands:**

### **Kiểm tra Backend:**
```bash
# Test TaskStatus enum
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"TaskStatus\") { enumValues { name } } }"}'

# Test assignTask mutation
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { assignTask(assignTaskInput: { documentId: 1, assignedToUserId: 2, taskDescription: \"Test task\" }) { metadata { statusCode message } data { id status } } }"}'
```

### **Kiểm tra Frontend:**
```bash
# Build check
npm run build

# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint
```

## 📱 **Responsive Testing:**

### **Desktop (1920x1080)**
- Nút "Giao việc" hiển thị bình thường
- Modal có kích thước đầy đủ

### **Tablet (768x1024)**
- Form actions có thể stack vertically
- Modal responsive

### **Mobile (375x667)**
- Nút có thể full width
- Modal mobile-friendly

## 🎨 **UI Elements cần kiểm tra:**

### **Task Assignment Modal:**
- ✅ Form validation
- ✅ User dropdown với role filtering
- ✅ Deadline picker
- ✅ Priority selection
- ✅ Instructions và notes fields
- ✅ Loading spinner
- ✅ Error messages

### **Task Management Dashboard:**
- ✅ Statistics cards với icons
- ✅ Tab navigation
- ✅ Search và filter
- ✅ Task cards với status badges
- ✅ Action buttons
- ✅ Responsive layout

## 🚨 **Common Issues & Solutions:**

### **Issue 1: Nút không hiển thị**
**Cause**: `isEditMode = false` hoặc `document = null`
**Solution**: Đảm bảo đang edit document có sẵn

### **Issue 2: Modal không mở**
**Cause**: Component import lỗi
**Solution**: Kiểm tra import `TaskAssignmentModalComponent`

### **Issue 3: Form validation lỗi**
**Cause**: Required fields chưa điền
**Solution**: Điền đầy đủ `assignedToUserId` và `taskDescription`

### **Issue 4: User dropdown trống**
**Cause**: API lỗi hoặc không có user phù hợp
**Solution**: Kiểm tra backend và user roles

## ✅ **Checklist hoàn thành:**

- [ ] Backend đang chạy
- [ ] Frontend đang chạy
- [ ] Đăng nhập với user có quyền
- [ ] Mở document để edit
- [ ] Thấy nút "Giao việc"
- [ ] Click nút mở modal
- [ ] Điền form và submit
- [ ] Task được tạo thành công
- [ ] Truy cập Task Management
- [ ] Thấy task trong danh sách

**🎯 Nếu tất cả checklist đều ✅, Task Assignment đã hoạt động hoàn hảo!**
