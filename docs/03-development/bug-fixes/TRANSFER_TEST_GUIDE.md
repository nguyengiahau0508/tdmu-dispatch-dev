# Hướng dẫn Test Transfer Workflow

## 🎯 Mục tiêu
Test chức năng transfer văn bản để đảm bảo `currentStepId` được cập nhật đúng cách.

## 🔧 Chuẩn bị

### 1. **Kiểm tra database**
```sql
-- Kiểm tra workflow steps
SELECT id, name, orderNumber, type, assignedRole FROM workflow_step WHERE templateId = 1 ORDER BY orderNumber;

-- Kiểm tra workflow instances
SELECT id, documentId, currentStepId, status FROM workflow_instance ORDER BY id DESC LIMIT 5;

-- Kiểm tra documents
SELECT id, title, status, assignedToUserId, workflowInstanceId FROM document WHERE id IN (1, 2, 3, 11) ORDER BY id;
```

### 2. **Reset test data**
```sql
-- Reset workflow instance về bước 1
UPDATE workflow_instance SET currentStepId = 1, updatedAt = NOW() WHERE documentId = 11;

-- Reset document về trạng thái ban đầu
UPDATE document SET assignedToUserId = NULL, status = 'DRAFT' WHERE id = 11;
```

## 🧪 Test Steps

### **Bước 1: Đăng nhập vào hệ thống**
1. Mở browser và truy cập `http://localhost:4200`
2. Đăng nhập với tài khoản có quyền transfer (SYSTEM_ADMIN, UNIVERSITY_LEADER, DEPARTMENT_STAFF)

### **Bước 2: Vào trang Document Processing**
1. Điều hướng đến "Document Processing" hoặc "Xử lý văn bản"
2. Tìm document có ID = 11 (Văn bản quyết định thành lập câu lạc bộ IT)

### **Bước 3: Thực hiện Transfer**
1. Click vào document để xem chi tiết
2. Click nút "Transfer" hoặc "Chuyển tiếp"
3. Chọn user để chuyển (ví dụ: User ID = 2)
4. Nhập ghi chú (tùy chọn)
5. Click "Xác nhận" hoặc "Confirm"

### **Bước 4: Kiểm tra kết quả**
1. **Kiểm tra UI**: Document status có thay đổi thành "PROCESSING" không?
2. **Kiểm tra assignedToUserId**: Có được cập nhật thành user mới không?
3. **Kiểm tra currentStepId**: Có chuyển từ 1 sang 2 không?

## 🔍 Debug và Monitoring

### **1. Kiểm tra Console Logs**
Mở Developer Tools (F12) và xem Console tab:
- Tìm logs bắt đầu với "=== Processing workflow transfer ==="
- Kiểm tra "Next step found:" có hiển thị step ID = 2 không
- Kiểm tra "Workflow step updated successfully" có xuất hiện không

### **2. Kiểm tra Network Tab**
- Tìm request `processDocumentAction`
- Kiểm tra response có thành công không
- Kiểm tra data trả về có đúng không

### **3. Kiểm tra Database**
Sau khi transfer, chạy các query sau:
```sql
-- Kiểm tra document
SELECT id, title, status, assignedToUserId, workflowInstanceId 
FROM document WHERE id = 11;

-- Kiểm tra workflow instance
SELECT id, documentId, currentStepId, status, updatedAt 
FROM workflow_instance WHERE documentId = 11;

-- Kiểm tra workflow action logs
SELECT id, instanceId, stepId, actionType, note, createdAt 
FROM workflow_action_log 
WHERE instanceId = 4 
ORDER BY createdAt DESC 
LIMIT 5;
```

## ✅ Kết quả mong đợi

### **Trước khi transfer:**
- `document.status` = "DRAFT"
- `document.assignedToUserId` = NULL
- `workflow_instance.currentStepId` = 1

### **Sau khi transfer:**
- `document.status` = "PROCESSING" ✅
- `document.assignedToUserId` = 2 (hoặc user ID được chọn) ✅
- `workflow_instance.currentStepId` = 2 ✅
- Có action log mới với `actionType` = "TRANSFER" ✅

## 🐛 Troubleshooting

### **Nếu currentStepId vẫn là 1:**
1. **Kiểm tra console logs**: Xem có lỗi gì không
2. **Kiểm tra workflow instance**: Đảm bảo document có `workflowInstanceId`
3. **Kiểm tra permissions**: Đảm bảo user có quyền transfer
4. **Kiểm tra next step**: Đảm bảo có bước tiếp theo trong workflow

### **Nếu có lỗi "No workflow instance found":**
1. **Kiểm tra database**: Đảm bảo `document.workflowInstanceId` không NULL
2. **Kiểm tra relations**: Đảm bảo `workflowInstance` được load đúng cách

### **Nếu có lỗi "No next step found":**
1. **Kiểm tra workflow steps**: Đảm bảo có bước tiếp theo
2. **Kiểm tra template**: Đảm bảo workflow template có đủ steps

## 📝 Ghi chú

- **Document ID 11** được sử dụng cho test vì đã có workflow instance
- **User ID 2** được sử dụng làm target user cho transfer
- **Workflow template ID 1** có 5 steps: Giao việc → Tạo văn bản → Phê duyệt trưởng phòng → Phê duyệt phó hiệu trưởng → Phê duyệt hiệu trưởng

## 🔄 Test Cases khác

### **Test Case 1: Transfer từ bước 2 sang bước 3**
```sql
-- Setup
UPDATE workflow_instance SET currentStepId = 2 WHERE documentId = 11;
-- Test transfer
-- Expected: currentStepId = 3
```

### **Test Case 2: Transfer từ bước cuối**
```sql
-- Setup  
UPDATE workflow_instance SET currentStepId = 5 WHERE documentId = 11;
-- Test transfer
-- Expected: No next step found (workflow completed)
```

### **Test Case 3: Document không có workflow**
```sql
-- Setup
UPDATE document SET workflowInstanceId = NULL WHERE id = 1;
-- Test transfer
-- Expected: Transfer chỉ cập nhật assignedToUserId, không cập nhật workflow
```
