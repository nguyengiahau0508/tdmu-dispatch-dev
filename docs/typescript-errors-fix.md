# TypeScript Errors Fix

## Tổng quan

Sửa các lỗi TypeScript trong quá trình tích hợp Document và Workflow.

## Các lỗi đã sửa

### 1. Lỗi Role Type

**Lỗi**: `Argument of type 'string' is not assignable to parameter of type 'Role'`

**File**: `apps/backend/src/modules/dispatch/documents/document-workflow.service.ts`

**Nguyên nhân**: Sử dụng string thay vì enum Role

**Giải pháp**:
```typescript
// Trước
const allowedRoles = ['CLERK', 'DEPARTMENT_STAFF', 'SYSTEM_ADMIN'];

// Sau
import { Role } from 'src/common/enums/role.enums';
const allowedRoles = [Role.CLERK, Role.DEPARTMENT_STAFF, Role.SYSTEM_ADMIN];
```

### 2. Lỗi DocumentTypeEnum

**Lỗi**: `Type '"OUTGOING"' is not assignable to type 'DocumentTypeEnum'`

**File**: `apps/backend/src/modules/dispatch/documents/document-workflow.service.ts`

**Nguyên nhân**: Sử dụng string thay vì enum DocumentTypeEnum

**Giải pháp**:
```typescript
// Trước
{ status: 'draft', documentType: 'OUTGOING' }

// Sau
import { DocumentTypeEnum } from './entities/document.entity';
{ status: 'draft', documentType: DocumentTypeEnum.OUTGOING }
```

### 3. Lỗi ActionType

**Lỗi**: `Type '"CANCEL"' is not assignable to type 'ActionType'`

**File**: `apps/backend/src/modules/dispatch/documents/document-workflow.service.ts`

**Nguyên nhân**: Sử dụng string thay vì enum ActionType

**Giải pháp**:
```typescript
// Trước
actionType: 'CANCEL'

// Sau
import { ActionType } from 'src/modules/workflow/workflow-action-logs/entities/workflow-action-log.entity';
actionType: ActionType.CANCEL
```

### 4. Lỗi Import FilesModule

**Lỗi**: `Cannot find module '../files/files.module'`

**File**: `apps/backend/src/modules/dispatch/documents/documents.module.ts`

**Nguyên nhân**: Import module không tồn tại

**Giải pháp**:
```typescript
// Xóa import không cần thiết
// import { FilesModule } from '../files/files.module';
```

### 5. Lỗi RemoveDocumentResponse

**Lỗi**: `Cannot find name 'RemoveDocumentResponse'`

**File**: `apps/backend/src/modules/dispatch/documents/documents.resolver.ts`

**Nguyên nhân**: Import sai tên class

**Giải pháp**:
```typescript
// Trước
@Mutation(() => RemoveDocumentResponse)

// Sau
@Mutation(() => RemoveDocumentOutput)
```

### 6. Lỗi Return Type

**Lỗi**: `Type 'RemoveDocumentOutput' is not assignable to type 'boolean'`

**File**: `apps/backend/src/modules/dispatch/documents/documents.service.ts`

**Nguyên nhân**: Method remove trả về sai type

**Giải pháp**:
```typescript
// Trước
async remove(id: number): Promise<RemoveDocumentOutput> {
  const result = await this.documentRepository.delete(id);
  return { success: !!result.affected };
}

// Sau
async remove(id: number): Promise<boolean> {
  const result = await this.documentRepository.delete(id);
  return !!result.affected;
}
```

### 7. Lỗi ReferenceError - Class Declaration Order

**Lỗi**: `ReferenceError: Cannot access 'RemoveDocumentData' before initialization`

**File**: `apps/backend/src/modules/dispatch/documents/dto/remove-document/remove-document.output.ts`

**Nguyên nhân**: Sử dụng class trước khi khai báo

**Giải pháp**:
```typescript
// Trước - Sai thứ tự
@ObjectType()
export class RemoveDocumentOutput {
  @Field(() => RemoveDocumentData, { description: 'Dữ liệu trả về' })
  data: RemoveDocumentData;
}

@ObjectType()
export class RemoveDocumentData {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean;
}

// Sau - Đúng thứ tự
@ObjectType()
export class RemoveDocumentData {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean;
}

@ObjectType()
export class RemoveDocumentOutput {
  @Field(() => RemoveDocumentData, { description: 'Dữ liệu trả về' })
  data: RemoveDocumentData;
}
```

## Các file đã sửa

### 1. DocumentWorkflowService
- **File**: `apps/backend/src/modules/dispatch/documents/document-workflow.service.ts`
- **Thay đổi**: Import và sử dụng enum thay vì string

### 2. DocumentsResolver
- **File**: `apps/backend/src/modules/dispatch/documents/documents.resolver.ts`
- **Thay đổi**: Import Role enum và sửa return type

### 3. DocumentsModule
- **File**: `apps/backend/src/modules/dispatch/documents/documents.module.ts`
- **Thay đổi**: Xóa import FilesModule không cần thiết

### 4. DocumentsService
- **File**: `apps/backend/src/modules/dispatch/documents/documents.service.ts`
- **Thay đổi**: Import DocumentTypeEnum và sửa return type của method remove

### 5. RemoveDocumentOutput
- **File**: `apps/backend/src/modules/dispatch/documents/dto/remove-document/remove-document.output.ts`
- **Thay đổi**: Cập nhật cấu trúc response và sửa thứ tự khai báo class

## Imports đã thêm

```typescript
// Role enum
import { Role } from 'src/common/enums/role.enums';

// DocumentTypeEnum
import { DocumentTypeEnum } from './entities/document.entity';

// ActionType enum
import { ActionType } from 'src/modules/workflow/workflow-action-logs/entities/workflow-action-log.entity';
```

## Kết quả

✅ **Build thành công**: `npm run build` không còn lỗi
✅ **Type safety**: Sử dụng enum thay vì string
✅ **Consistency**: Tất cả code sử dụng cùng một pattern
✅ **Maintainability**: Dễ dàng thay đổi và mở rộng

## Lưu ý

- Luôn sử dụng enum thay vì string cho type safety
- Kiểm tra imports trước khi sử dụng
- Đảm bảo return type khớp với method signature
- Sử dụng TypeScript strict mode để phát hiện lỗi sớm
- **Quan trọng**: Khai báo class trước khi sử dụng để tránh ReferenceError
