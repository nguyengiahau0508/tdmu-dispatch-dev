# Workflow Progress Visualization - Hiển thị sơ đồ quy trình

## 🎯 Tổng quan

Đã thêm tính năng hiển thị sơ đồ quy trình với trạng thái hoàn thành của từng bước, giúp người dùng dễ dàng theo dõi tiến độ xử lý văn bản trong workflow.

## ✅ Tính năng đã hoàn thành

### 1. Component mới - WorkflowProgressComponent

**File:** `apps/frontend/src/app/features/user/document-processing/components/workflow-progress.component.ts`

#### Tính năng chính:
- **Timeline visualization**: Hiển thị các bước workflow theo thứ tự
- **Status indicators**: Icons và màu sắc khác nhau cho từng trạng thái
- **Progress tracking**: Hiển thị số bước đã hoàn thành và phần trăm tiến độ
- **Completion details**: Thông tin người hoàn thành, thời gian, ghi chú
- **Connector lines**: Đường nối giữa các bước với màu sắc theo trạng thái
- **Progress bar**: Thanh tiến độ tổng thể

#### Trạng thái bước:
- **✅ Completed**: Đã hoàn thành (màu xanh lá)
- **● Current**: Đang xử lý (màu xanh dương, có animation pulse)
- **○ Pending**: Chờ xử lý (màu xám)
- **❌ Skipped**: Đã bỏ qua (màu đỏ)

### 2. Interface mới - WorkflowStepProgress

```typescript
export interface WorkflowStepProgress {
  id: number;
  name: string;
  description?: string;
  type: string;
  assignedRole: string;
  orderNumber: number;
  isActive: boolean;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  completedAt?: Date;
  completedBy?: {
    id: number;
    fullName: string;
    email: string;
  };
  notes?: string;
}
```

### 3. Service Enhancement - DocumentDetailsService

#### Method mới:
```typescript
createWorkflowProgressData(workflowInstance: WorkflowInstanceDetails): WorkflowStepProgress[]
```

#### Logic xử lý:
1. **Lấy tất cả steps** từ workflow template, sắp xếp theo `orderNumber`
2. **Phân tích logs** để xác định trạng thái từng bước:
   - `COMPLETE`/`APPROVE` → `completed`
   - `TRANSFER` → `completed`
   - `REJECT` → `skipped`
   - Không có log → `pending`
3. **Xác định bước hiện tại** dựa trên `currentStepId`
4. **Lấy thông tin hoàn thành** từ logs (thời gian, người thực hiện, ghi chú)

### 4. GraphQL Query Enhancement

#### Cập nhật query để lấy workflow steps:
```graphql
template {
  id
  name
  description
  isActive
  steps {
    id
    name
    description
    type
    assignedRole
    orderNumber
    isActive
    nextStepId
  }
}
```

## 🎨 UI/UX Design

### 1. Visual Design
- **Step circles**: Icons tròn với màu sắc và animation
- **Connector lines**: Đường nối với gradient màu
- **Progress bar**: Thanh tiến độ với gradient xanh
- **Status badges**: Badge màu cho từng trạng thái

### 2. Layout Structure
```
Workflow Progress Container
├── Progress Header
│   ├── Title với icon 📊
│   └── Progress Summary (Đã hoàn thành: X/Y, Tiến độ: Z%)
├── Progress Steps
│   ├── Step Item (cho mỗi bước)
│   │   ├── Step Circle (icon + number)
│   │   ├── Step Content
│   │   │   ├── Step Header (name + description)
│   │   │   ├── Step Meta (type + role)
│   │   │   └── Step Status (badge + details)
│   │   └── Step Connector (line)
│   └── ...
└── Progress Bar
    ├── Progress Fill (animated)
    └── Progress Text
```

### 3. Color Scheme
- **Completed**: `#10b981` (green)
- **Current**: `#3b82f6` (blue)
- **Pending**: `#6b7280` (gray)
- **Skipped**: `#dc2626` (red)

### 4. Animations
- **Pulse animation**: Cho bước hiện tại
- **Progress fill**: Smooth transition cho progress bar
- **Step transitions**: Hover effects và transitions

## 🔧 Technical Implementation

### 1. Status Determination Logic

```typescript
// Xác định trạng thái dựa trên action logs
if (lastLog) {
  if (lastLog.actionType === 'COMPLETE' || lastLog.actionType === 'APPROVE') {
    status = 'completed';
  } else if (lastLog.actionType === 'TRANSFER') {
    status = 'completed';
  } else if (lastLog.actionType === 'REJECT') {
    status = 'skipped';
  }
}

// Bước hiện tại
if (step.id === currentStepId) {
  status = 'current';
}
```

### 2. Connector Status Logic

```typescript
getConnectorStatus(index: number): string {
  const currentStep = this.steps[index];
  const nextStep = this.steps[index + 1];
  
  if (currentStep.status === 'completed' && nextStep.status === 'completed') {
    return 'completed';
  } else if (currentStep.status === 'completed' && nextStep.status === 'current') {
    return 'current';
  } else {
    return 'pending';
  }
}
```

### 3. Progress Calculation

```typescript
getCompletedCount(): number {
  return this.steps.filter(step => step.status === 'completed').length;
}

getProgressPercentage(): number {
  if (this.steps.length === 0) return 0;
  return Math.round((this.getCompletedCount() / this.steps.length) * 100);
}
```

## 📱 Responsive Design

### Mobile Optimizations:
- **Flex direction**: Column cho progress header
- **Step layout**: Vertical alignment cho step content
- **Meta alignment**: Left align thay vì right align
- **Completion info**: Stack vertically thay vì horizontally

### Breakpoints:
- `@media (max-width: 768px)`: Tablet và mobile

## 🎯 Use Cases

### 1. Document Processing Tracking
- Người dùng có thể thấy văn bản đang ở bước nào
- Biết được bao nhiêu bước đã hoàn thành
- Theo dõi tiến độ tổng thể

### 2. Workflow Analysis
- Phân tích bottleneck trong quy trình
- Xác định bước nào mất nhiều thời gian
- Theo dõi hiệu suất workflow

### 3. User Experience
- Trực quan hóa quy trình xử lý
- Giảm thiểu confusion về trạng thái
- Tăng transparency trong quy trình

## 🚀 Performance Considerations

### 1. Data Loading
- Chỉ load workflow steps khi cần thiết
- Sử dụng `fetchPolicy: 'network-only'` cho dữ liệu mới nhất

### 2. Rendering Optimization
- `trackBy` function cho ngFor
- Lazy loading cho các bước không visible
- Efficient status calculation

### 3. Memory Management
- Cleanup subscriptions
- Efficient data transformation

## 🧪 Testing Scenarios

### 1. Unit Tests
- Test status determination logic
- Test progress calculation
- Test connector status logic

### 2. Integration Tests
- Test với real workflow data
- Test responsive behavior
- Test animation performance

### 3. User Acceptance Tests
- Test với các workflow khác nhau
- Test edge cases (no steps, all completed, etc.)
- Test accessibility

## 📋 Future Enhancements

### 1. Interactive Features
- Click để xem chi tiết từng bước
- Expand/collapse step details
- Filter steps theo status

### 2. Advanced Visualizations
- Gantt chart view
- Timeline view với dates
- Network diagram view

### 3. Real-time Updates
- WebSocket updates cho progress
- Auto-refresh khi có thay đổi
- Live status indicators

### 4. Analytics Integration
- Step duration tracking
- Performance metrics
- Bottleneck identification

## 🎉 Kết luận

Tính năng Workflow Progress Visualization đã mang lại:

1. **Transparency**: Người dùng có thể thấy rõ tiến độ xử lý
2. **User Experience**: Giao diện trực quan và dễ hiểu
3. **Efficiency**: Giảm thời gian tìm hiểu trạng thái
4. **Accountability**: Theo dõi được ai đã hoàn thành bước nào
5. **Analytics**: Dữ liệu để phân tích hiệu suất workflow

Component này cung cấp một view toàn diện về workflow progress, giúp người dùng hiểu rõ quy trình và theo dõi tiến độ xử lý văn bản một cách trực quan.
