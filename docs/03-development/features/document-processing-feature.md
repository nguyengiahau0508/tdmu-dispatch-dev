# Document Processing Feature

## Tổng quan

Chức năng xử lý văn bản cho phép người dùng quản lý và xử lý các văn bản cần phê duyệt trong hệ thống workflow.

## Tính năng chính

### 1. Quản lý Documents cần xử lý
- **Hiển thị danh sách**: Documents mà user có quyền xử lý
- **Phân loại theo priority**: URGENT, HIGH, MEDIUM, LOW
- **Thông tin chi tiết**: Title, type, category, status, deadline
- **Actions có sẵn**: APPROVE, REJECT, TRANSFER, COMPLETE

### 2. Quản lý Documents đã xử lý
- **Lịch sử xử lý**: Documents đã được user xử lý
- **Trạng thái workflow**: COMPLETED, IN_PROGRESS, CANCELLED
- **Action cuối cùng**: Loại action đã thực hiện

### 3. Documents khẩn cấp
- **Deadline tracking**: Documents sắp hết hạn hoặc quá hạn
- **Priority highlighting**: Đánh dấu documents URGENT
- **Quick actions**: Xử lý nhanh cho documents khẩn cấp

### 4. Thống kê xử lý
- **Tổng số documents**: Tổng documents liên quan
- **Pending count**: Documents đang chờ xử lý
- **Completed count**: Documents đã hoàn thành
- **Completion rate**: Tỷ lệ hoàn thành (%)

## Backend Implementation

### 1. DocumentProcessingService
**File**: `apps/backend/src/modules/dispatch/documents/document-processing.service.ts`

#### Methods chính:
- `getDocumentsForProcessing(user)`: Lấy documents cần xử lý
- `getProcessedDocuments(user)`: Lấy documents đã xử lý
- `processDocumentAction(input, user)`: Xử lý document action
- `getProcessingStatistics(user)`: Lấy thống kê xử lý

#### Features:
- **Role-based permissions**: Kiểm tra quyền xử lý theo role
- **Priority calculation**: Tính toán priority dựa trên deadline
- **Deadline management**: Quản lý thời hạn xử lý
- **Action validation**: Kiểm tra actions có sẵn cho user

### 2. DocumentProcessingResolver
**File**: `apps/backend/src/modules/dispatch/documents/document-processing.resolver.ts`

#### Queries:
- `documentsForProcessing`: Lấy documents cần xử lý
- `processedDocuments`: Lấy documents đã xử lý
- `processingStatistics`: Lấy thống kê xử lý
- `documentsByPriority`: Lọc theo priority
- `urgentDocuments`: Lấy documents khẩn cấp

#### Mutations:
- `processDocumentAction`: Xử lý document action

### 3. DTOs
**Files**:
- `document-processing-info.output.ts`: Thông tin document processing
- `document-action.input.ts`: Input cho document action
- `processing-statistics.output.ts`: Thống kê xử lý
- `process-document.output.ts`: Response cho process action

## Frontend Implementation

### 1. DocumentProcessingComponent
**File**: `apps/frontend/src/app/features/user/document-processing/document-processing.component.ts`

#### Features:
- **Tab-based interface**: 3 tabs chính (Cần xử lý, Đã xử lý, Khẩn cấp)
- **Statistics cards**: Hiển thị thống kê tổng quan
- **Document cards**: Card layout cho từng document
- **Priority indicators**: Màu sắc và badges cho priority
- **Action buttons**: Buttons cho các actions có sẵn

#### UI Components:
- **Header card**: Tiêu đề và mô tả
- **Statistics grid**: 4 cards thống kê
- **Tab group**: 3 tabs chính
- **Document grid**: Grid layout cho documents
- **Empty states**: Thông báo khi không có data

### 2. DocumentActionDialogComponent
**File**: `apps/frontend/src/app/features/user/document-processing/document-action-dialog.component.ts`

#### Features:
- **Document info display**: Hiển thị thông tin document
- **Action form**: Form cho notes và transfer user
- **Confirmation messages**: Thông báo xác nhận action
- **Validation**: Validate form inputs
- **Loading states**: Hiển thị trạng thái processing

#### Form Fields:
- **Notes**: Textarea cho ghi chú
- **Transfer user**: Select cho TRANSFER action
- **Confirmation**: Messages cho REJECT/APPROVE

## Business Logic

### 1. Permission System
```typescript
// Role-based permissions
SYSTEM_ADMIN: Tất cả actions
DEPARTMENT_HEAD: APPROVE, REJECT, TRANSFER
CLERK: APPROVE, REJECT, TRANSFER (văn thư steps)
DEPARTMENT_STAFF: APPROVE, REJECT (basic steps)
```

### 2. Priority Calculation
```typescript
// Priority based on deadline
URGENT: < 0 days (overdue)
HIGH: <= 1 day
MEDIUM: <= 3 days
LOW: > 3 days
```

### 3. Action Flow
```typescript
// Document processing flow
1. User selects document
2. System checks permissions
3. User chooses action (APPROVE/REJECT/TRANSFER)
4. System validates action
5. Execute workflow action
6. Update document status
7. Log action history
```

## GraphQL Schema

### Queries
```graphql
# Get documents for processing
documentsForProcessing: DocumentsForProcessingResponse!

# Get processed documents
processedDocuments: ProcessedDocumentsResponse!

# Get processing statistics
processingStatistics: ProcessingStatisticsResponse!

# Get documents by priority
documentsByPriority(priority: String!): DocumentsForProcessingResponse!

# Get urgent documents
urgentDocuments: DocumentsForProcessingResponse!
```

### Mutations
```graphql
# Process document action
processDocumentAction(input: DocumentActionInput!): ProcessDocumentOutput!
```

## Integration Points

### 1. Workflow Integration
- **WorkflowInstancesService**: Quản lý workflow instances
- **WorkflowActionLogsService**: Log actions
- **WorkflowSteps**: Kiểm tra permissions

### 2. User Management
- **User entity**: Role-based permissions
- **Authentication**: GqlAuthGuard
- **Authorization**: Role checking

### 3. Document Management
- **Document entity**: Document information
- **DocumentCategory**: Category information
- **Document status**: Status tracking

## Usage Examples

### 1. Lấy documents cần xử lý
```typescript
// GraphQL Query
query {
  documentsForProcessing {
    documents {
      documentId
      documentTitle
      documentType
      priority
      requiresAction
      actionType
      deadline
    }
  }
}
```

### 2. Xử lý document action
```typescript
// GraphQL Mutation
mutation {
  processDocumentAction(input: {
    documentId: 1
    actionType: APPROVE
    notes: "Phê duyệt văn bản"
  }) {
    data {
      documentId
      actionType
      message
    }
  }
}
```

## Future Enhancements

### 1. Advanced Features
- **Bulk actions**: Xử lý nhiều documents cùng lúc
- **Advanced filtering**: Filter theo nhiều criteria
- **Export functionality**: Export reports
- **Notifications**: Real-time notifications

### 2. UI Improvements
- **Drag & drop**: Reorder documents
- **Advanced search**: Search functionality
- **Custom views**: User-defined views
- **Mobile responsive**: Mobile optimization

### 3. Analytics
- **Processing time**: Track processing duration
- **Bottleneck analysis**: Identify slow steps
- **User performance**: User productivity metrics
- **Trend analysis**: Historical trends

## Testing

### 1. Unit Tests
- Service methods testing
- Permission logic testing
- Priority calculation testing

### 2. Integration Tests
- GraphQL queries/mutations
- Workflow integration
- Database operations

### 3. E2E Tests
- User workflow testing
- UI interaction testing
- Error handling testing
