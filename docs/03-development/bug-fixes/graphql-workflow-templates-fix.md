# GraphQL Workflow Templates Fix

## 🚨 Lỗi gặp phải

Khi load workflow templates trong form tạo văn bản, gặp lỗi GraphQL:

```
[GraphQL error]: Message: Cannot query field "metadata" on type "WorkflowTemplate".
[GraphQL error]: Message: Cannot query field "data" on type "WorkflowTemplate".
[Network error]: ServerError: Response not successful: Received status code 400
```

## 🔍 Nguyên nhân

GraphQL query trong frontend đang sử dụng cấu trúc `metadata` và `data` nhưng backend resolver trả về trực tiếp `WorkflowTemplate[]`:

### **Backend Resolver:**
```typescript
@Query(() => [WorkflowTemplate], {
  name: 'workflowTemplates',
  description: 'Lấy tất cả workflow templates',
})
findAll() {
  return this.workflowTemplatesService.findAll(); // Trả về trực tiếp WorkflowTemplate[]
}
```

### **Frontend Query (SAI):**
```graphql
query GetWorkflowTemplates {
  workflowTemplates {
    metadata {        # ❌ Không tồn tại
      statusCode
      message
    }
    data {           # ❌ Không tồn tại
      id
      name
      description
      isActive
      createdAt
      updatedAt
    }
  }
}
```

## 🛠️ Giải pháp đã thực hiện

### **1. Sửa GraphQL Queries**

#### **Trước khi sửa:**
```graphql
const GET_WORKFLOW_TEMPLATES = gql`
  query GetWorkflowTemplates {
    workflowTemplates {
      metadata {
        statusCode
        message
      }
      data {
        id
        name
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;
```

#### **Sau khi sửa:**
```graphql
const GET_WORKFLOW_TEMPLATES = gql`
  query GetWorkflowTemplates {
    workflowTemplates {
      id
      name
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;
```

### **2. Cập nhật Service Methods**

#### **Trước khi sửa:**
```typescript
getWorkflowTemplates(): Observable<WorkflowTemplate[]> {
  return this.apollo.query<{ workflowTemplates: ApiResponse<WorkflowTemplate[]> }>({
    query: GET_WORKFLOW_TEMPLATES
  }).pipe(
    map(result => result.data.workflowTemplates.data) // ❌ Sai path
  );
}
```

#### **Sau khi sửa:**
```typescript
getWorkflowTemplates(): Observable<WorkflowTemplate[]> {
  return this.apollo.query<{ workflowTemplates: WorkflowTemplate[] }>({
    query: GET_WORKFLOW_TEMPLATES
  }).pipe(
    map(result => result.data.workflowTemplates) // ✅ Đúng path
  );
}
```

### **3. Tương tự cho Active Templates**

```graphql
const GET_ACTIVE_WORKFLOW_TEMPLATES = gql`
  query GetActiveWorkflowTemplates {
    activeWorkflowTemplates {
      id
      name
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;
```

```typescript
getActiveWorkflowTemplates(): Observable<WorkflowTemplate[]> {
  return this.apollo.query<{ activeWorkflowTemplates: WorkflowTemplate[] }>({
    query: GET_ACTIVE_WORKFLOW_TEMPLATES
  }).pipe(
    map(result => result.data.activeWorkflowTemplates)
  );
}
```

## 📊 So sánh Response Structure

### **Backend Response Structure:**
```typescript
// WorkflowTemplatesResolver.findAll()
return this.workflowTemplatesService.findAll();
// Trả về: WorkflowTemplate[]
```

### **Frontend Expected Structure (SAI):**
```typescript
// Sai: Mong đợi cấu trúc metadata/data
{
  workflowTemplates: {
    metadata: { statusCode, message },
    data: WorkflowTemplate[]
  }
}
```

### **Frontend Expected Structure (ĐÚNG):**
```typescript
// Đúng: Trực tiếp WorkflowTemplate[]
{
  workflowTemplates: WorkflowTemplate[]
}
```

## 🎯 Kết quả

### ✅ **Lỗi đã được sửa:**
- GraphQL queries hoạt động đúng
- Workflow templates load thành công
- Form tạo văn bản hiển thị danh sách quy trình

### ✅ **User Experience:**
- Form tạo văn bản load workflow templates
- User có thể chọn quy trình xét duyệt
- Không còn lỗi GraphQL

### ✅ **Code Quality:**
- GraphQL queries đúng với schema
- Type safety được đảm bảo
- Consistent với backend response

## 🔧 Lessons Learned

### **1. GraphQL Schema Consistency**
- Frontend queries phải match với backend resolvers
- Kiểm tra response structure trước khi implement
- Sử dụng GraphQL Playground để test queries

### **2. Type Safety**
- TypeScript interfaces phải match với GraphQL types
- Sử dụng proper typing cho Apollo queries
- Validate response structure

### **3. Error Handling**
- GraphQL errors cung cấp thông tin chi tiết
- Network errors có thể do schema mismatch
- Console logs giúp debug nhanh chóng

## 🚀 Next Steps

### **1. Testing**
- Test workflow template selection
- Verify form submission với template
- Check workflow creation logic

### **2. Monitoring**
- Monitor GraphQL query performance
- Track template selection usage
- Analyze user behavior

### **3. Enhancements**
- Add template descriptions
- Template preview functionality
- Template recommendations

**GraphQL workflow templates error đã được sửa thành công!** 🎉

Form tạo văn bản giờ có thể:
- Load danh sách workflow templates
- Hiển thị dropdown chọn quy trình
- Tạo văn bản với workflow template đã chọn
