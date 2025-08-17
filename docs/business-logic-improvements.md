# Cải tiến Logic Nghiệp vụ TDMU Dispatch

## 📋 **Tổng quan**

Tài liệu này mô tả các cải tiến logic nghiệp vụ cho hệ thống TDMU Dispatch, bao gồm:

1. **Logic tạo workflow thông minh**
2. **Phân loại văn bản theo trạng thái xử lý**
3. **Đồng bộ trạng thái Document và Workflow**
4. **Log xử lý văn bản chi tiết**
5. **Quản lý quyền theo vai trò**

## 🔄 **1. Logic Tạo Workflow Thông Minh**

### **Nguyên tắc tạo workflow:**

```typescript
private shouldCreateWorkflow(document: Document, workflowTemplateId?: number): boolean {
  // 1. User chỉ định template cụ thể
  if (workflowTemplateId) {
    return true;
  }
  
  // 2. Văn bản đi (OUTGOING) - luôn cần workflow phê duyệt
  if (document.documentType === DocumentTypeEnum.OUTGOING) {
    return true;
  }
  
  // 3. Văn bản đến (INCOMING) - cần workflow xử lý
  if (document.documentType === DocumentTypeEnum.INCOMING) {
    return true;
  }
  
  // 4. Văn bản nội bộ (INTERNAL) - chỉ cần workflow nếu có yêu cầu đặc biệt
  if (document.documentType === DocumentTypeEnum.INTERNAL && document.priority === DocumentPriority.HIGH) {
    return true;
  }
  
  return false;
}
```

### **Template mapping theo loại văn bản và độ ưu tiên:**

| Loại Văn bản | Độ ưu tiên | Template ID | Mô tả |
|--------------|------------|-------------|-------|
| OUTGOING | LOW/MEDIUM | 1 | Quy trình phê duyệt văn bản thông thường |
| OUTGOING | HIGH/URGENT | 2 | Quy trình phê duyệt văn bản tài chính (nhanh hơn) |
| INCOMING | LOW/MEDIUM | 3 | Quy trình xử lý văn bản đến |
| INCOMING | HIGH/URGENT | 4 | Quy trình xử lý văn bản đến khẩn cấp |
| INTERNAL | LOW/MEDIUM | 5 | Quy trình nội bộ đơn giản |
| INTERNAL | HIGH/URGENT | 6 | Quy trình nội bộ phức tạp |

## 📊 **2. Phân loại Văn bản Theo Trạng thái Xử lý**

### **Các trạng thái văn bản:**

```typescript
export enum DocumentStatus {
  DRAFT = 'DRAFT',           // Bản nháp
  PENDING = 'PENDING',       // Chờ xử lý
  PROCESSING = 'PROCESSING', // Đang xử lý
  APPROVED = 'APPROVED',     // Đã phê duyệt
  REJECTED = 'REJECTED',     // Đã từ chối
  COMPLETED = 'COMPLETED',   // Đã hoàn thành
  CANCELLED = 'CANCELLED',   // Đã hủy
}
```

### **Phân loại theo nghiệp vụ:**

| Nhóm | Trạng thái | Mô tả |
|------|------------|-------|
| **Chờ xử lý** | DRAFT, PENDING | Văn bản chưa được xử lý |
| **Đang xử lý** | PROCESSING | Văn bản đang trong quy trình workflow |
| **Hoàn thành** | APPROVED, COMPLETED | Văn bản đã được xử lý xong |
| **Từ chối** | REJECTED, CANCELLED | Văn bản bị từ chối hoặc hủy |

## 🔗 **3. Đồng bộ Trạng thái Document và Workflow**

### **Mapping trạng thái:**

```typescript
async updateDocumentStatusFromWorkflow(documentId: number, workflowStatus: string): Promise<void> {
  let newStatus: DocumentStatus;
  
  switch (workflowStatus) {
    case 'IN_PROGRESS':
      newStatus = DocumentStatus.PROCESSING;
      break;
    case 'COMPLETED':
      newStatus = DocumentStatus.APPROVED;
      break;
    case 'REJECTED':
      newStatus = DocumentStatus.REJECTED;
      break;
    case 'CANCELLED':
      newStatus = DocumentStatus.CANCELLED;
      break;
    default:
      newStatus = DocumentStatus.PROCESSING;
  }
  
  // Cập nhật trạng thái văn bản
  document.status = newStatus;
  await this.documentRepository.save(document);
}
```

### **Tự động cập nhật khi workflow thay đổi:**

- **Workflow IN_PROGRESS** → Document PROCESSING
- **Workflow COMPLETED** → Document APPROVED  
- **Workflow REJECTED** → Document REJECTED
- **Workflow CANCELLED** → Document CANCELLED

## 📝 **4. Log Xử lý Văn bản Chi tiết**

### **Các loại log:**

```typescript
export enum ActionType {
  APPROVE = 'APPROVE',     // Phê duyệt
  REJECT = 'REJECT',       // Từ chối
  TRANSFER = 'TRANSFER',   // Chuyển tiếp
  CANCEL = 'CANCEL',       // Hủy bỏ
  START = 'START',         // Bắt đầu
  COMPLETE = 'COMPLETE',   // Hoàn thành
  ASSIGN = 'ASSIGN',       // Gán văn bản
}
```

### **Thông tin log:**

```typescript
interface WorkflowActionLog {
  id: number;
  instanceId: number;        // ID workflow instance
  stepId: number;           // ID bước hiện tại
  actionType: ActionType;   // Loại hành động
  actionByUserId: number;   // ID người thực hiện
  actionByUser: User;       // Thông tin người thực hiện
  actionAt: Date;           // Thời gian thực hiện
  note: string;             // Ghi chú
  metadata: string;         // Dữ liệu bổ sung (JSON)
}
```

### **API lấy lịch sử xử lý:**

```graphql
query documentProcessingHistory($documentId: Int!) {
  documentProcessingHistory(documentId: $documentId) {
    metadata {
      statusCode
      message
    }
    data {
      history {
        id
        actionType
        actionByUser {
          id
          fullName
          email
        }
        actionAt
        note
        stepName
        stepType
      }
    }
  }
}
```

## 👥 **5. Quản lý Quyền Theo Vai trò**

### **Phân quyền theo vai trò:**

| Vai trò | Quyền xem văn bản | Quyền tạo | Quyền gán | Quyền xử lý |
|---------|-------------------|-----------|-----------|-------------|
| **SYSTEM_ADMIN** | Tất cả | ✅ | ✅ | ✅ |
| **UNIVERSITY_LEADER** | OUTGOING, INTERNAL | ✅ | ✅ | ✅ |
| **DEPARTMENT_STAFF** | Của mình + được giao | ✅ | ✅ | ✅ |
| **CLERK** | Của mình + được giao | ✅ | ❌ | ✅ |
| **BASIC_USER** | Chỉ của mình | ❌ | ❌ | ❌ |

### **Logic phân quyền:**

```typescript
// Lọc theo quyền của user
if (user.roles.includes('SYSTEM_ADMIN')) {
  // Admin có thể xem tất cả
} else if (user.roles.includes('UNIVERSITY_LEADER')) {
  // Lãnh đạo có thể xem văn bản cấp trường
  query.andWhere('document.documentType IN (:...types)', { 
    types: [DocumentTypeEnum.OUTGOING, DocumentTypeEnum.INTERNAL] 
  });
} else if (user.roles.includes('DEPARTMENT_STAFF')) {
  // Nhân viên phòng ban chỉ xem văn bản của mình hoặc được giao
  query.andWhere('(document.createdByUserId = :userId OR document.assignedToUserId = :userId)', { 
    userId: user.id 
  });
} else {
  // BASIC_USER chỉ xem văn bản của mình
  query.andWhere('document.createdByUserId = :userId', { userId: user.id });
}
```

## 🚀 **6. API Mới**

### **Queries mới:**

```graphql
# Lấy văn bản cần xử lý của user
query myDocumentsForProcessing {
  myDocumentsForProcessing {
    metadata { statusCode, message }
    data { documents { id, title, status, priority } }
  }
}

# Lấy văn bản theo trạng thái
query myDocumentsByStatus($status: String!) {
  myDocumentsByStatus(status: $status) {
    metadata { statusCode, message }
    data { documents { id, title, status, priority } }
  }
}

# Thống kê văn bản
query myDocumentStatistics {
  myDocumentStatistics {
    metadata { statusCode, message }
    data { 
      statistics { 
        pending, processing, completed, rejected, total 
      } 
    }
  }
}

# Lịch sử xử lý văn bản
query documentProcessingHistory($documentId: Int!) {
  documentProcessingHistory(documentId: $documentId) {
    metadata { statusCode, message }
    data { history { actionType, actionByUser, actionAt, note } }
  }
}

# Tìm kiếm văn bản
query searchDocuments($searchTerm: String, $status: DocumentStatus, $documentType: DocumentTypeEnum, $priority: DocumentPriority) {
  searchDocuments(searchTerm: $searchTerm, status: $status, documentType: $documentType, priority: $priority) {
    metadata { statusCode, message }
    data { documents { id, title, status, priority, documentType } }
  }
}
```

### **Mutations mới:**

```graphql
# Gán văn bản cho user khác
mutation assignDocumentToUser($documentId: Int!, $assignedToUserId: Int!) {
  assignDocumentToUser(documentId: $documentId, assignedToUserId: $assignedToUserId) {
    metadata { statusCode, message }
    data { document { id, title, assignedToUser { id, fullName } } }
  }
}

# Cập nhật trạng thái văn bản từ workflow (Admin only)
mutation updateDocumentStatusFromWorkflow($documentId: Int!, $workflowStatus: String!) {
  updateDocumentStatusFromWorkflow(documentId: $documentId, workflowStatus: $workflowStatus) {
    metadata { statusCode, message }
    data { success }
  }
}
```

## 📈 **7. Luồng Xử lý Văn bản**

### **Luồng cơ bản:**

1. **Tạo văn bản** → Status: DRAFT
2. **Tự động tạo workflow** → Status: PENDING
3. **User xử lý** → Status: PROCESSING
4. **Hoàn thành workflow** → Status: APPROVED/REJECTED

### **Luồng chi tiết:**

```
Tạo văn bản (DRAFT)
    ↓
Kiểm tra cần workflow?
    ↓
Tạo workflow instance (PENDING)
    ↓
User có quyền xử lý?
    ↓
Thực hiện action (PROCESSING)
    ↓
Còn bước tiếp theo?
    ↓
Hoàn thành workflow (APPROVED/REJECTED)
    ↓
Cập nhật document status
```

## 🔧 **8. Cấu hình và Tùy chỉnh**

### **Cấu hình template mapping:**

```typescript
// Có thể tùy chỉnh trong config
const templateMapping = {
  [DocumentTypeEnum.OUTGOING]: {
    [DocumentPriority.LOW]: 1,
    [DocumentPriority.MEDIUM]: 1,
    [DocumentPriority.HIGH]: 2,
    [DocumentPriority.URGENT]: 2,
  },
  // ... các loại khác
};
```

### **Cấu hình deadline:**

```typescript
// Deadline mặc định theo độ ưu tiên
const deadlineMapping = {
  [DocumentPriority.LOW]: 14,      // 14 ngày
  [DocumentPriority.MEDIUM]: 7,    // 7 ngày
  [DocumentPriority.HIGH]: 3,      // 3 ngày
  [DocumentPriority.URGENT]: 1,    // 1 ngày
};
```

## ✅ **9. Lợi ích của Cải tiến**

### **Cho người dùng:**
- ✅ Hiển thị văn bản theo đúng vai trò
- ✅ Phân loại rõ ràng theo trạng thái
- ✅ Lịch sử xử lý chi tiết
- ✅ Tìm kiếm và lọc nâng cao

### **Cho quản trị:**
- ✅ Logic nghiệp vụ rõ ràng
- ✅ Tự động hóa quy trình
- ✅ Kiểm soát quyền chặt chẽ
- ✅ Báo cáo và thống kê

### **Cho hệ thống:**
- ✅ Hiệu suất cao
- ✅ Dễ bảo trì và mở rộng
- ✅ Đồng bộ dữ liệu chính xác
- ✅ Log đầy đủ để audit

## 🎯 **10. Kết luận**

Các cải tiến logic nghiệp vụ đã tạo ra một hệ thống:

1. **Thông minh hơn** - Tự động tạo workflow phù hợp
2. **Rõ ràng hơn** - Phân loại trạng thái logic
3. **An toàn hơn** - Quản lý quyền chặt chẽ
4. **Chi tiết hơn** - Log đầy đủ mọi hành động
5. **Linh hoạt hơn** - Dễ tùy chỉnh và mở rộng

Hệ thống giờ đây đáp ứng đầy đủ yêu cầu nghiệp vụ của TDMU và có thể phát triển thêm trong tương lai.
