# 🔍 Debug Guide: Workflow UI Not Showing

## 🎯 Vấn đề
Phần "Tiến độ quy trình" không hiển thị trên UI mặc dù có code.

## 🔧 Debug Steps

### 1. Kiểm tra Console Logs
Mở browser console (F12) và tìm các logs sau:

```
🔧 createWorkflowProgressData called with: [object]
📊 Processing workflow data:
  - Steps count: [number]
  - Logs count: [number] 
  - Current step ID: [number]
✅ Created workflow progress steps: [array]
getWorkflowProgressSteps(): [array]
getWorkflowProgressSteps()?.length: [number]
```

### 2. Kiểm tra Data Flow

#### A. Document Details Loading
```javascript
// Trong console, kiểm tra:
documentDetailsComponent.documentDetails
// Kết quả mong đợi: object có workflowInstance
```

#### B. Workflow Instance
```javascript
// Kiểm tra workflow instance:
documentDetailsComponent.documentDetails?.workflowInstance
// Kết quả mong đợi: object có template và steps
```

#### C. Workflow Progress Steps
```javascript
// Kiểm tra progress steps:
documentDetailsComponent.workflowProgressSteps
// Kết quả mong đợi: array không rỗng
```

### 3. Template Condition Check

Condition trong template:
```html
*ngIf="getWorkflowProgressSteps()?.length"
```

Cần kiểm tra:
- `getWorkflowProgressSteps()` có trả về array không rỗng không
- `?.length` có > 0 không

### 4. Các Nguyên nhân có thể

#### A. Không có Workflow Instance
```javascript
// Kiểm tra:
documentDetailsComponent.getWorkflowInstanceId()
// Nếu undefined/null → document không có workflow
```

#### B. Template không có Steps
```javascript
// Kiểm tra:
documentDetailsComponent.documentDetails?.workflowInstance?.template?.steps
// Nếu undefined/null → template không có steps
```

#### C. createWorkflowProgressData trả về array rỗng
```javascript
// Kiểm tra logs:
🔧 createWorkflowProgressData called with: [object]
❌ No template or steps found, returning empty array
```

### 5. Debug Commands

#### Trong Browser Console:
```javascript
// Lấy component instance
const component = angular.getComponent(document.querySelector('app-document-details'));

// Kiểm tra data
console.log('Document Details:', component.documentDetails);
console.log('Workflow Instance:', component.documentDetails?.workflowInstance);
console.log('Template Steps:', component.documentDetails?.workflowInstance?.template?.steps);
console.log('Progress Steps:', component.workflowProgressSteps);
console.log('Progress Steps Length:', component.workflowProgressSteps?.length);

// Test methods
console.log('getWorkflowInstanceId():', component.getWorkflowInstanceId());
console.log('getWorkflowProgressSteps():', component.getWorkflowProgressSteps());
```

### 6. Test Cases

#### Test Case 1: Document có Workflow
1. Tạo văn bản mới với workflow
2. Vào document details
3. Kiểm tra console logs
4. Kiểm tra UI sections

#### Test Case 2: Document không có Workflow
1. Tạo văn bản mới không chọn workflow
2. Vào document details
3. Kiểm tra console logs
4. Workflow sections không hiển thị (đúng)

### 7. Expected Results

#### ✅ Success Case:
```
Console Logs:
- "Loading document details for ID: 123"
- "Document details loaded: [object]"
- "Workflow instance: [object]"
- "🔧 createWorkflowProgressData called with: [object]"
- "📊 Processing workflow data: Steps count: 3, Logs count: 2"
- "✅ Created workflow progress steps: [array]"
- "getWorkflowProgressSteps(): [array]"
- "getWorkflowProgressSteps()?.length: 3"

UI Sections:
- "Tiến độ quy trình" với nút "Xem chi tiết"
- "Thông tin quy trình" 
- "Lịch sử quy trình"
```

#### ❌ Failure Cases:
```
Case 1: No workflow
- "getWorkflowInstanceId(): undefined"
- "getWorkflowProgressSteps()?.length: 0"

Case 2: No template steps
- "❌ No template or steps found, returning empty array"
- "getWorkflowProgressSteps()?.length: 0"

Case 3: GraphQL error
- "Error loading document details: [error]"
```

### 8. Fix Actions

#### Nếu không có workflow:
1. Tạo văn bản mới với workflow
2. Hoặc assign workflow cho văn bản hiện tại

#### Nếu template không có steps:
1. Kiểm tra workflow template trong admin
2. Đảm bảo template có steps được tạo

#### Nếu GraphQL error:
1. Kiểm tra backend logs
2. Kiểm tra database relationships
3. Restart backend service

### 9. Quick Test

```javascript
// Copy paste vào browser console để test nhanh:
(function() {
  const component = angular.getComponent(document.querySelector('app-document-details'));
  if (!component) {
    console.log('❌ Component not found');
    return;
  }
  
  console.log('🔍 Quick Debug:');
  console.log('Document ID:', component.getDocumentId());
  console.log('Workflow Instance ID:', component.getWorkflowInstanceId());
  console.log('Workflow Instance:', component.documentDetails?.workflowInstance);
  console.log('Template Steps:', component.documentDetails?.workflowInstance?.template?.steps?.length);
  console.log('Progress Steps:', component.workflowProgressSteps?.length);
  console.log('Should Show Progress:', component.getWorkflowProgressSteps()?.length > 0);
})();
```

## 🎯 Kết luận
Workflow UI sẽ hiển thị khi:
1. Document có `workflowInstanceId`
2. Workflow instance có `template` với `steps`
3. `createWorkflowProgressData()` tạo được array không rỗng
4. Template condition `*ngIf="getWorkflowProgressSteps()?.length"` pass
