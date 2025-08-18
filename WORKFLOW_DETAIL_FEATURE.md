# Tính năng Xem Chi tiết Quy trình Tài liệu

## 🎯 Mục tiêu
Cung cấp cho người dùng khả năng xem chi tiết quy trình đang được áp dụng vào một tài liệu cụ thể, giúp họ hiểu rõ cách xử lý công việc và các bước cần thực hiện.

## ✨ Tính năng chính

### 1. **Thông tin Tài liệu**
- Hiển thị thông tin cơ bản của tài liệu
- Trạng thái hiện tại
- Loại tài liệu và ngày tạo

### 2. **Thông tin Quy trình**
- Tên và mô tả quy trình áp dụng
- Tiến độ hoàn thành (progress bar)
- Thời gian dự kiến hoàn thành

### 3. **Bước hiện tại**
- Hiển thị chi tiết bước đang xử lý
- Các hành động cần thực hiện
- Người phụ trách và thời gian

### 4. **Timeline Quy trình**
- Hiển thị tất cả các bước trong quy trình
- Trạng thái từng bước (hoàn thành, đang xử lý, chờ xử lý, bỏ qua)
- Thông tin chi tiết về thời gian và người thực hiện

### 5. **Hướng dẫn Xử lý**
- Hướng dẫn chi tiết cho bước hiện tại
- Các hành động cần thực hiện
- Thông tin về các bước tiếp theo

## 🏗️ Kiến trúc Backend

### **DTOs**
```typescript
// Input
GetDocumentWorkflowInput {
  documentId: number
}

// Response
DocumentWorkflowInfo {
  documentId: number
  documentTitle: string
  documentType: string
  currentStatus: string
  workflowTemplateId: number
  workflowTemplateName: string
  workflowTemplateDescription: string
  steps: WorkflowStepInfo[]
  currentStepIndex: number
  totalSteps: number
  completedSteps: number
  createdAt: Date
  estimatedCompletion?: Date
  processingGuide?: string
}

WorkflowStepInfo {
  id: number
  name: string
  description: string
  order: number
  status: string
  assignedTo?: string
  startedAt?: Date
  completedAt?: Date
  notes?: string
  requiredActions?: string[]
}
```

### **Service: WorkflowDetailService**
- `getDocumentWorkflow()`: Lấy thông tin chi tiết quy trình
- `getRequiredActions()`: Xác định hành động cần thiết cho từng bước
- `generateProcessingGuide()`: Tạo hướng dẫn xử lý
- `calculateEstimatedCompletion()`: Tính thời gian hoàn thành dự kiến

### **Resolver: WorkflowDetailResolver**
- GraphQL query: `getDocumentWorkflow`
- Authentication với `GqlAuthGuard`
- Error handling và response formatting

## 🎨 Kiến trúc Frontend

### **Service: WorkflowDetailService**
```typescript
// Methods
getDocumentWorkflow(input: IGetDocumentWorkflowInput): Observable<IApiResponse<IDocumentWorkflowInfo>>
calculateProgress(completedSteps: number, totalSteps: number): number
getStepStatusDisplay(status: string): { text: string; color: string; icon: string }
getCurrentStep(steps: IWorkflowStepInfo[], currentStepIndex: number): IWorkflowStepInfo | null
getNextSteps(steps: IWorkflowStepInfo[], currentStepIndex: number, limit: number): IWorkflowStepInfo[]
getCompletedSteps(steps: IWorkflowStepInfo[]): IWorkflowStepInfo[]
getStepDuration(startedAt?: Date, completedAt?: Date): string
```

### **Component: WorkflowDetailComponent**
- **Template**: Hiển thị thông tin chi tiết quy trình
- **Styles**: Responsive design với CSS variables
- **Features**:
  - Loading và error states
  - Progress tracking
  - Timeline visualization
  - Processing guide display

## 🔄 Luồng hoạt động

### 1. **Truy cập tính năng**
```
User clicks "Xem quy trình" button
↓
Navigate to /workflow-detail/:documentId
↓
WorkflowDetailComponent loads
↓
Call getDocumentWorkflow API
```

### 2. **Xử lý dữ liệu**
```
Backend receives documentId
↓
Query document with workflow instance
↓
Get workflow template and steps
↓
Get action logs for each step
↓
Calculate step statuses and progress
↓
Generate processing guide
↓
Return formatted response
```

### 3. **Hiển thị giao diện**
```
Frontend receives data
↓
Display document info card
↓
Show workflow template info with progress
↓
Highlight current step
↓
Render timeline with all steps
↓
Display processing guide
```

## 🎨 Giao diện người dùng

### **Layout Structure**
```
┌─────────────────────────────────────┐
│ Header: Title + Back Button         │
├─────────────────────────────────────┤
│ Document Info Card                  │
├─────────────────────────────────────┤
│ Workflow Template Info + Progress   │
├─────────────────────────────────────┤
│ Current Step Guide                  │
├─────────────────────────────────────┤
│ Workflow Timeline                   │
├─────────────────────────────────────┤
│ Processing Guide                    │
└─────────────────────────────────────┘
```

### **Visual Elements**
- **Progress Bar**: Hiển thị tiến độ hoàn thành
- **Timeline**: Timeline với markers cho từng bước
- **Status Badges**: Màu sắc khác nhau cho các trạng thái
- **Cards**: Thông tin được tổ chức trong các card riêng biệt

### **Responsive Design**
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔧 Cấu hình và Tùy chỉnh

### **Step Types và Required Actions**
```typescript
// Các loại bước được hỗ trợ
'REVIEW'    → Đọc và xem xét tài liệu
'APPROVE'   → Phê duyệt hoặc từ chối
'SIGN'      → Ký điện tử hoặc ký tay
'DISTRIBUTE' → Phân phối tài liệu
```

### **Status Colors**
```typescript
'completed'   → #10b981 (Green)
'in_progress' → #3b82f6 (Blue)
'pending'     → #9ca3af (Gray)
'skipped'     → #6b7280 (Gray)
```

### **Icons**
- Sử dụng SVG icons từ `/icons/` directory
- Consistent sizing và color filters
- Responsive cho dark/light themes

## 🚀 Tính năng nâng cao

### **Real-time Updates**
- WebSocket integration cho live updates
- Auto-refresh khi có thay đổi trạng thái
- Push notifications cho bước mới

### **Interactive Timeline**
- Click để xem chi tiết từng bước
- Expand/collapse step details
- Filter steps by status

### **Export và Print**
- Export workflow detail to PDF
- Print-friendly layout
- Share workflow information

### **Comments và Notes**
- Add comments to steps
- Internal notes for team members
- Discussion threads per step

## 📱 Mobile Experience

### **Touch Interactions**
- Swipe gestures cho timeline
- Tap to expand step details
- Pull-to-refresh functionality

### **Optimized Layout**
- Single column layout trên mobile
- Larger touch targets
- Simplified navigation

### **Offline Support**
- Cache workflow data locally
- Offline viewing capability
- Sync when online

## 🔒 Bảo mật và Quyền truy cập

### **Authentication**
- JWT token validation
- User session management
- Secure API endpoints

### **Authorization**
- Role-based access control
- Document ownership validation
- Workflow permission checks

### **Data Protection**
- Encrypted data transmission
- Secure storage practices
- Audit logging

## 🧪 Testing

### **Unit Tests**
- Service method testing
- Component logic testing
- Utility function testing

### **Integration Tests**
- API endpoint testing
- GraphQL query testing
- Database interaction testing

### **E2E Tests**
- User workflow testing
- Cross-browser compatibility
- Mobile device testing

## 📊 Monitoring và Analytics

### **Performance Metrics**
- Page load times
- API response times
- User interaction tracking

### **Usage Analytics**
- Feature adoption rates
- User engagement metrics
- Error tracking và reporting

### **Business Intelligence**
- Workflow efficiency analysis
- Step completion rates
- Bottleneck identification

## 🔮 Roadmap

### **Phase 1** (Current)
- ✅ Basic workflow detail view
- ✅ Timeline visualization
- ✅ Progress tracking
- ✅ Processing guide

### **Phase 2** (Next)
- 🔄 Real-time updates
- 🔄 Interactive timeline
- 🔄 Export functionality
- 🔄 Mobile optimization

### **Phase 3** (Future)
- 📋 Advanced analytics
- 📋 AI-powered insights
- 📋 Workflow optimization suggestions
- 📋 Integration với external tools

---

**Ngày tạo**: 2024-01-XX
**Trạng thái**: ✅ Hoàn thành Phase 1
**Phiên bản**: 1.0.0
