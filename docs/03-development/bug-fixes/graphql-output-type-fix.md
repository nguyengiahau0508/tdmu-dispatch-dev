# GraphQL Output Type Fix

## Tổng quan

Sửa lỗi `CannotDetermineOutputTypeError` trong GraphQL schema khi sử dụng `[Object]` và `Object` làm return type.

## Lỗi gốc

```
CannotDetermineOutputTypeError: Cannot determine a GraphQL output type for the "documentsNeedingWorkflow". Make sure your class is decorated with an appropriate decorator.
```

## Nguyên nhân

GraphQL cần các type cụ thể được định nghĩa với decorator `@ObjectType()` và `@Field()`. Không thể sử dụng `[Object]` hoặc `Object` làm return type.

## Giải pháp

### 1. Tạo các DTO cho Document Workflow

#### DocumentNeedingWorkflow
```typescript
@ObjectType()
export class DocumentNeedingWorkflow {
  @Field(() => Int, { description: 'ID của document' })
  id: number;

  @Field(() => String, { description: 'Tiêu đề document' })
  title: string;

  @Field(() => DocumentTypeEnum, { description: 'Loại document' })
  documentType: DocumentTypeEnum;

  @Field(() => String, { nullable: true, description: 'Trạng thái document' })
  status?: string;

  @Field(() => String, { nullable: true, description: 'Tên category' })
  documentCategory?: string;

  @Field(() => Date, { description: 'Thời gian tạo' })
  createdAt: Date;
}
```

#### DocumentWorkflowInfo
```typescript
@ObjectType()
export class DocumentWorkflowInfo {
  @Field(() => Int, { description: 'ID của document' })
  documentId: number;

  @Field(() => String, { description: 'Tiêu đề document' })
  documentTitle: string;

  @Field(() => String, { description: 'Loại document' })
  documentType: string;

  @Field(() => Int, { nullable: true, description: 'ID của workflow instance' })
  workflowInstanceId?: number;

  @Field(() => String, { nullable: true, description: 'Trạng thái workflow' })
  workflowStatus?: string;

  @Field(() => String, { nullable: true, description: 'Bước hiện tại' })
  currentStep?: string;

  @Field(() => Boolean, { description: 'Có workflow đang hoạt động không' })
  hasActiveWorkflow: boolean;
}
```

#### SuitableWorkflowTemplate
```typescript
@ObjectType()
export class SuitableWorkflowTemplate {
  @Field(() => Int, { description: 'ID của template' })
  id: number;

  @Field(() => String, { description: 'Tên template' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Mô tả template' })
  description?: string;

  @Field(() => Boolean, { description: 'Template có đang hoạt động không' })
  isActive: boolean;
}
```

### 2. Cập nhật DocumentWorkflowResolver

#### Trước (Sai)
```typescript
@Query(() => [Object], { description: 'Lấy danh sách documents cần gán workflow' })
async documentsNeedingWorkflow(@CurrentUser() user?: User): Promise<any[]> {
  // ...
  return documents.map(doc => ({ ... }));
}
```

#### Sau (Đúng)
```typescript
@Query(() => DocumentsNeedingWorkflowResponse, { description: 'Lấy danh sách documents cần gán workflow' })
async documentsNeedingWorkflow(@CurrentUser() user?: User): Promise<DocumentsNeedingWorkflowResponse> {
  // ...
  const mappedDocuments = documents.map(doc => ({ ... }));
  return { documents: mappedDocuments };
}
```

## Các file đã tạo

### 1. Document Workflow DTOs
- `apps/backend/src/modules/dispatch/documents/dto/document-workflow/document-needing-workflow.output.ts`
- `apps/backend/src/modules/dispatch/documents/dto/document-workflow/document-workflow-info.output.ts`
- `apps/backend/src/modules/dispatch/documents/dto/document-workflow/suitable-workflow-template.output.ts`
- `apps/backend/src/modules/dispatch/documents/dto/document-workflow/assign-workflow.output.ts`
- `apps/backend/src/modules/dispatch/documents/dto/document-workflow/remove-workflow.output.ts`

### 2. Updated Resolver
- `apps/backend/src/modules/dispatch/documents/document-workflow.resolver.ts`

## Các thay đổi chính

### 1. Return Types
- **Trước**: `[Object]`, `Object`, `String`
- **Sau**: `DocumentsNeedingWorkflowResponse`, `DocumentWorkflowInfo`, `AssignWorkflowOutput`

### 2. Response Structure
- **Trước**: Trả về trực tiếp array hoặc object
- **Sau**: Wrap trong response object với metadata

### 3. Type Safety
- **Trước**: `any[]`, `any`
- **Sau**: Specific DTO types với proper validation

## GraphQL Schema Changes

### Queries
```graphql
# Trước
documentsNeedingWorkflow: [Object!]!

# Sau
documentsNeedingWorkflow: DocumentsNeedingWorkflowResponse!
```

### Mutations
```graphql
# Trước
assignWorkflowToDocument(documentId: Int!, templateId: Int!, notes: String): String!

# Sau
assignWorkflowToDocument(documentId: Int!, templateId: Int!, notes: String): AssignWorkflowOutput!
```

## Kết quả

✅ **GraphQL Schema**: Tạo thành công không có lỗi
✅ **Type Safety**: Sử dụng specific types thay vì Object
✅ **Consistency**: Tất cả responses có cấu trúc thống nhất
✅ **Documentation**: Mỗi field có description rõ ràng
✅ **Validation**: Proper nullable fields và type checking

## Lưu ý

- Luôn sử dụng `@ObjectType()` và `@Field()` cho GraphQL types
- Không sử dụng `Object` hoặc `[Object]` làm return type
- Wrap responses trong proper DTO structure
- Sử dụng enum types cho better type safety
- Đảm bảo nullable fields được đánh dấu đúng cách
