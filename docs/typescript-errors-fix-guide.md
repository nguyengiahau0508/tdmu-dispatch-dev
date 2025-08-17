# Hướng dẫn sửa lỗi TypeScript - Document System Enhancements

## 📋 Tổng quan

Tài liệu này mô tả các lỗi TypeScript đã gặp phải khi cập nhật hệ thống quản lý công văn và cách khắc phục chúng.

## ❌ Các lỗi đã gặp phải

### 1. **Lỗi import Int từ @nestjs/graphql**
```typescript
// Lỗi: Cannot find name 'Int'
@Field(() => Int)
```

**Nguyên nhân:** Thiếu import `Int` từ `@nestjs/graphql`

**Giải pháp:**
```typescript
import { Field, InputType, registerEnumType, Int } from '@nestjs/graphql';
```

### 2. **Lỗi import OneToMany từ typeorm**
```typescript
// Lỗi: Cannot find name 'OneToMany'
@OneToMany(() => DocumentComment, (comment) => comment.document)
```

**Nguyên nhân:** Thiếu import `OneToMany` từ `typeorm`

**Giải pháp:**
```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,  // Thêm import này
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
```

### 3. **Lỗi import đường dẫn sai**
```typescript
// Lỗi: Cannot find module '../document-category/entities/document-category.entity'
import { DocumentCategory } from '../document-category/entities/document-category.entity';
```

**Nguyên nhân:** Đường dẫn import không chính xác

**Giải pháp:**
```typescript
import { DocumentCategory } from '../../document-category/entities/document-category.entity';
```

### 4. **Lỗi DocumentStatus enum**
```typescript
// Lỗi: Type '"draft"' is not assignable to type 'DocumentStatus'
status: 'draft'
```

**Nguyên nhân:** Sử dụng string thay vì enum value

**Giải pháp:**
```typescript
import { Document, DocumentTypeEnum, DocumentStatus } from './entities/document.entity';

// Thay vì:
status: 'draft'

// Sử dụng:
status: DocumentStatus.DRAFT
```

### 5. **Lỗi PaginationInput không tồn tại**
```typescript
// Lỗi: Module has no exported member 'PaginationInput'
import { PaginationInput } from 'src/common/shared/pagination/dtos';
```

**Nguyên nhân:** Class `PaginationInput` không tồn tại

**Giải pháp:**
```typescript
import { PageOptionsDto } from 'src/common/shared/pagination/dtos';

export class GetDocumentsPaginatedInput extends PageOptionsDto {
  // ...
}
```

### 6. **Lỗi destructuring pagination properties**
```typescript
// Lỗi: Property 'page' does not exist on type 'GetDocumentsPaginatedInput'
const { search, documentType, page, take, order, skip } = input;
```

**Nguyên nhân:** Properties này không tồn tại trong input type

**Giải pháp:**
```typescript
// Thay vì destructuring, sử dụng trực tiếp:
const { search, documentType } = input;

// Và sử dụng:
order: { id: input.order },
skip: input.skip,
take: input.take,
```

### 7. **Lỗi save method trả về array**
```typescript
// Lỗi: Property 'id' does not exist on type 'Document[]'
console.log('Document saved successfully:', savedDocument.id);
```

**Nguyên nhân:** `save` method có thể trả về array hoặc single object

**Giải pháp:**
```typescript
console.log('Document saved successfully:', savedDocument[0]?.id || savedDocument.id);
```

## ✅ Các file đã được sửa

### 1. **DTOs**
- `create-document.input.ts` - Thêm import `Int`
- `update-document.input.ts` - Thêm import `Int`
- `get-documents-paginated.input.ts` - Sửa import và inheritance

### 2. **Entities**
- `document.entity.ts` - Thêm import `OneToMany`, sửa đường dẫn import
- `document-template.entity.ts` - Sửa đường dẫn import
- `workflow-notification.entity.ts` - Sửa đường dẫn import

### 3. **Services**
- `documents.service.ts` - Sửa DocumentStatus enum, pagination
- `document-processing.service.ts` - Sửa DocumentStatus enum
- `document-workflow.service.ts` - Sửa DocumentStatus enum
- `seeder-simple.service.ts` - Sửa DocumentStatus enum

## 🔧 Các bước kiểm tra sau khi sửa

### 1. **Kiểm tra TypeScript compilation**
```bash
npm run build
```

### 2. **Kiểm tra GraphQL schema generation**
```bash
npm run start:dev
```

### 3. **Kiểm tra database migration**
```bash
# Chạy migration SQL
mysql -u username -p database_name < migration-document-enhancements.sql
```

### 4. **Kiểm tra API endpoints**
```bash
# Test GraphQL queries
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { documents { id title } }"}'
```

## 📝 Best Practices để tránh lỗi tương lai

### 1. **Import Management**
```typescript
// Luôn kiểm tra imports khi tạo file mới
import { Field, InputType, registerEnumType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
```

### 2. **Enum Usage**
```typescript
// Luôn sử dụng enum thay vì string literals
status: DocumentStatus.DRAFT  // ✅ Đúng
status: 'draft'              // ❌ Sai
```

### 3. **Type Safety**
```typescript
// Sử dụng type assertion khi cần thiết
entity.status = updateDocumentInput.status as DocumentStatus;
```

### 4. **Path Resolution**
```typescript
// Sử dụng relative paths chính xác
import { DocumentCategory } from '../../document-category/entities/document-category.entity';
```

## 🎯 Kết luận

Sau khi sửa tất cả các lỗi TypeScript, hệ thống sẽ:

1. ✅ Compile thành công
2. ✅ Generate GraphQL schema đúng
3. ✅ Có type safety đầy đủ
4. ✅ Hoạt động với database schema mới

Các lỗi này chủ yếu do:
- Thiếu imports cần thiết
- Sử dụng string literals thay vì enum values
- Đường dẫn import không chính xác
- Type mismatches trong pagination

Việc sửa các lỗi này đảm bảo hệ thống hoạt động ổn định và có type safety tốt.
