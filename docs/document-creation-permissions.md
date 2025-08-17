# 📄 Quyền Tạo Văn Bản trong Hệ Thống TDMU-DISPATCH

## 🎯 **Tổng quan:**

Dựa trên phân tích code của dự án, đây là thông tin chi tiết về quyền tạo văn bản trong hệ thống TDMU-DISPATCH.

## ✅ **Ai có quyền tạo văn bản:**

Theo `@Roles` decorator trong `documents.resolver.ts`, các role sau có quyền tạo văn bản:

### **1. SYSTEM_ADMIN** 🔧
- **Mô tả**: Quản trị viên hệ thống
- **Quyền**: Toàn quyền trên hệ thống
- **Có thể tạo văn bản**: ✅ **CÓ**
- **Phạm vi**: Tất cả loại văn bản

### **2. DEPARTMENT_STAFF** 👨‍💼
- **Mô tả**: Chuyên viên/Nhân viên trong một đơn vị
- **Quyền**: Soạn thảo văn bản, thực hiện các nghiệp vụ chuyên môn
- **Có thể tạo văn bản**: ✅ **CÓ**
- **Phạm vi**: Văn bản trong phạm vi đơn vị

### **3. CLERK** 📋
- **Mô tả**: Văn thư
- **Quyền**: Xử lý luồng văn bản, nhận văn bản đến, phát hành văn bản đi
- **Có thể tạo văn bản**: ✅ **CÓ**
- **Phạm vi**: Văn bản hành chính

## ❌ **Ai KHÔNG có quyền tạo văn bản:**

### **1. UNIVERSITY_LEADER** 🎓
- **Mô tả**: Lãnh đạo cấp cao (Hiệu trưởng, Phó Hiệu trưởng)
- **Quyền**: Phê duyệt văn bản quan trọng, xem báo cáo toàn trường
- **Có thể tạo văn bản**: ❌ **KHÔNG**
- **Lý do**: Tập trung vào phê duyệt và quản lý chiến lược

### **2. DEPARTMENT_HEAD** 👨‍💼
- **Mô tả**: Người đứng đầu đơn vị (Khoa, Phòng, Ban, Trung tâm)
- **Quyền**: Quản lý nhân sự, phê duyệt văn bản trong phạm vi đơn vị
- **Có thể tạo văn bản**: ❌ **KHÔNG**
- **Lý do**: Tập trung vào quản lý và phê duyệt

### **3. DEGREE_MANAGER** 🎓
- **Mô tả**: Quản lý văn bằng, chứng chỉ
- **Quyền**: Truy cập module quản lý phôi bằng, in, cấp phát văn bằng
- **Có thể tạo văn bản**: ❌ **KHÔNG**
- **Lý do**: Chuyên biệt cho quản lý văn bằng

### **4. BASIC_USER** 👤
- **Mô tả**: Người dùng cơ bản
- **Quyền**: Xem thông tin cá nhân, thông báo chung
- **Có thể tạo văn bản**: ❌ **KHÔNG**
- **Lý do**: Chỉ có quyền cơ bản

## 🔐 **Chi tiết quyền trong code:**

### **Tạo văn bản (createDocument):**
```typescript
@Mutation(() => DocumentResponse)
@Roles(Role.SYSTEM_ADMIN, Role.DEPARTMENT_STAFF, Role.CLERK)
async createDocument(
  @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
  @Args('file', { type: () => GraphQLUpload, nullable: true }) file?: FileUpload,
  @CurrentUser() user?: User,
): Promise<DocumentResponse>
```

### **Cập nhật văn bản (updateDocument):**
```typescript
@Mutation(() => DocumentResponse)
@Roles(Role.SYSTEM_ADMIN, Role.DEPARTMENT_STAFF, Role.CLERK)
async updateDocument(
  @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
  @CurrentUser() user?: User,
): Promise<DocumentResponse>
```

### **Xóa văn bản (removeDocument):**
```typescript
@Mutation(() => DocumentResponse)
@Roles(Role.SYSTEM_ADMIN, Role.DEPARTMENT_STAFF)
async removeDocument(@Args('id', { type: () => Int }) id: number): Promise<DocumentResponse>
```

## 📋 **Workflow tạo văn bản:**

### **Bước 1: Kiểm tra quyền**
- User phải có một trong các role: `SYSTEM_ADMIN`, `DEPARTMENT_STAFF`, `CLERK`
- User phải đã đăng nhập và có JWT token hợp lệ

### **Bước 2: Tạo văn bản**
- Điền form thông tin văn bản
- Upload file đính kèm (tùy chọn)
- Submit form

### **Bước 3: Xử lý**
- Văn bản được tạo với status mặc định: `DRAFT`
- Có thể gán workflow template (tùy chọn)
- Có thể giao việc cho người khác

## 🎯 **Phân quyền theo chức năng:**

### **Tạo văn bản:**
- ✅ SYSTEM_ADMIN
- ✅ DEPARTMENT_STAFF  
- ✅ CLERK

### **Cập nhật văn bản:**
- ✅ SYSTEM_ADMIN
- ✅ DEPARTMENT_STAFF
- ✅ CLERK

### **Xóa văn bản:**
- ✅ SYSTEM_ADMIN
- ✅ DEPARTMENT_STAFF
- ❌ CLERK (không có quyền xóa)

### **Phê duyệt văn bản:**
- ✅ UNIVERSITY_LEADER
- ✅ DEPARTMENT_HEAD
- ❌ DEPARTMENT_STAFF
- ❌ CLERK

## 🔍 **Kiểm tra quyền trong frontend:**

### **Hiển thị nút "Tạo văn bản":**
```typescript
// Kiểm tra user role
const canCreateDocument = user.roles.includes('SYSTEM_ADMIN') || 
                         user.roles.includes('DEPARTMENT_STAFF') || 
                         user.roles.includes('CLERK');

// Hiển thị nút nếu có quyền
@if (canCreateDocument) {
  <button (click)="createDocument()">Tạo văn bản mới</button>
}
```

### **Hiển thị nút "Giao việc":**
```typescript
// Chỉ hiển thị khi edit document và có quyền
@if (isEditMode && document && canCreateDocument) {
  <button (click)="openTaskAssignment()">Giao việc</button>
}
```

## 📊 **Thống kê quyền:**

| Role | Tạo văn bản | Cập nhật | Xóa | Phê duyệt | Giao việc |
|------|-------------|----------|-----|-----------|-----------|
| SYSTEM_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| UNIVERSITY_LEADER | ❌ | ❌ | ❌ | ✅ | ✅ |
| DEPARTMENT_HEAD | ❌ | ❌ | ❌ | ✅ | ✅ |
| DEPARTMENT_STAFF | ✅ | ✅ | ✅ | ❌ | ✅ |
| CLERK | ✅ | ✅ | ❌ | ❌ | ❌ |
| DEGREE_MANAGER | ❌ | ❌ | ❌ | ❌ | ❌ |
| BASIC_USER | ❌ | ❌ | ❌ | ❌ | ❌ |

## 🎯 **Kết luận:**

**Có 3 role có quyền tạo văn bản:**
1. **SYSTEM_ADMIN** - Toàn quyền
2. **DEPARTMENT_STAFF** - Chuyên viên/Nhân viên
3. **CLERK** - Văn thư

**Để test nút "Giao việc", bạn cần:**
1. Đăng nhập với user có role `SYSTEM_ADMIN`, `DEPARTMENT_STAFF`, hoặc `CLERK`
2. Tạo hoặc mở document để edit
3. Nút "Giao việc" sẽ xuất hiện trong form actions
