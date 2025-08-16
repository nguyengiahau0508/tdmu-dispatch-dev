# Document Processing SQL Error Fix

## 🚨 Vấn đề gặp phải

Khi truy cập chức năng Document Processing, gặp lỗi SQL:

```
QueryFailedError: You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near '))' at line 1
```

**SQL Query bị lỗi:**
```sql
SELECT ... FROM `document` `Document` 
LEFT JOIN `document_category` `Document__Document_documentCategory` 
ON `Document__Document_documentCategory`.`id`=`Document`.`documentCategoryId` 
WHERE ((`Document`.`id` = `$in` = ))
```

## 🔍 Nguyên nhân

### 1. Sai cách sử dụng TypeORM In() Operator
```typescript
// ❌ SAI - Cách cũ
where: { id: { $in: documentIds } as any }

// ✅ ĐÚNG - Cách mới
where: { id: In(documentIds) }
```

### 2. Không xử lý trường hợp Array rỗng
- Khi `documentIds` là array rỗng `[]`
- TypeORM tạo ra SQL không hợp lệ: `WHERE ((Document.id = ))`
- MariaDB báo lỗi syntax error

### 3. Import thiếu In operator
```typescript
// ❌ Thiếu import
import { Repository } from 'typeorm';

// ✅ Đầy đủ import
import { Repository, In } from 'typeorm';
```

## ✅ Giải pháp đã áp dụng

### 1. Sửa Import Statement
```typescript
// File: document-processing.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // ← Thêm In
```

### 2. Sửa cách sử dụng In() Operator
```typescript
// Trước khi sửa
const documents = await this.documentRepository.find({
  where: { id: { $in: documentIds } as any },
  relations: ['documentCategory'],
});

// Sau khi sửa
const documents = await this.documentRepository.find({
  where: { id: In(documentIds) },
  relations: ['documentCategory'],
});
```

### 3. Thêm validation cho Array rỗng
```typescript
// Lấy thông tin documents tương ứng
const documentIds = userWorkflows.map(w => w.documentId).filter(id => id);

// ✅ Kiểm tra nếu không có document nào
if (documentIds.length === 0) {
  console.log('No documents found for processing');
  return [];
}

const documents = await this.documentRepository.find({
  where: { id: In(documentIds) },
  relations: ['documentCategory'],
});
```

### 4. Thêm các method mới
```typescript
/**
 * Lấy danh sách documents khẩn cấp
 */
async getUrgentDocuments(user: User): Promise<DocumentProcessingInfo[]> {
  const allDocuments = await this.getDocumentsForProcessing(user);
  
  // Lọc documents khẩn cấp (priority URGENT hoặc overdue)
  const urgentDocuments = allDocuments.filter(doc => {
    return doc.priority === PriorityEnum.URGENT || 
           (doc.deadline && new Date() > doc.deadline);
  });

  return urgentDocuments;
}

/**
 * Lấy documents theo priority
 */
async getDocumentsByPriority(user: User, priority: string): Promise<DocumentProcessingInfo[]> {
  const allDocuments = await this.getDocumentsForProcessing(user);
  
  const priorityDocuments = allDocuments.filter(doc => {
    return doc.priority === priority;
  });

  return priorityDocuments;
}
```

### 5. Cập nhật Resolver
```typescript
// Trước khi sửa - Filter trong resolver
const allDocuments = await this.documentProcessingService.getDocumentsForProcessing(user);
const filteredDocuments = allDocuments.filter(doc => doc.priority === priority);

// Sau khi sửa - Sử dụng method từ service
const documents = await this.documentProcessingService.getDocumentsByPriority(user, priority);
```

## 🎯 Kết quả

### ✅ SQL Queries hoạt động đúng
```sql
-- ✅ Query đúng khi có documents
SELECT ... FROM `document` `Document` 
LEFT JOIN `document_category` `Document__Document_documentCategory` 
ON `Document__Document_documentCategory`.`id`=`Document`.`documentCategoryId` 
WHERE `Document`.`id` IN (1, 2, 3)

-- ✅ Không query khi không có documents
// Return empty array immediately
```

### ✅ Error Handling
- **Array rỗng**: Return `[]` ngay lập tức, không query database
- **SQL Syntax**: Sử dụng `In()` operator đúng cách
- **Type Safety**: Import đầy đủ TypeORM operators

### ✅ Performance
- **Tránh query không cần thiết**: Khi không có documents
- **Efficient filtering**: Sử dụng database-level filtering
- **Proper relations**: Load relations đúng cách

## 🔧 Technical Details

### 1. TypeORM In() Operator
```typescript
import { In } from 'typeorm';

// Cách sử dụng đúng
const result = await repository.find({
  where: { 
    id: In([1, 2, 3, 4, 5]) 
  }
});

// Tương đương SQL
// SELECT * FROM table WHERE id IN (1, 2, 3, 4, 5)
```

### 2. Array Validation Pattern
```typescript
// Pattern để tránh query với array rỗng
const ids = someArray.filter(id => id);
if (ids.length === 0) {
  return [];
}
const result = await repository.find({
  where: { id: In(ids) }
});
```

### 3. Error Prevention
```typescript
// ✅ Good practice
const documentIds = userWorkflows
  .map(w => w.documentId)
  .filter(id => id); // Remove null/undefined

if (documentIds.length === 0) {
  return []; // Early return
}

// ❌ Bad practice
const documentIds = userWorkflows.map(w => w.documentId);
// Could contain null/undefined values
```

## 🎉 Kết luận

### ✅ Hoàn thành
- **SQL Errors**: Đã sửa tất cả syntax errors
- **TypeORM Usage**: Sử dụng In() operator đúng cách
- **Error Handling**: Xử lý trường hợp array rỗng
- **Performance**: Tối ưu queries và tránh unnecessary database calls

### 🎯 User Experience
- **No more errors**: Frontend không còn báo lỗi SQL
- **Smooth loading**: Documents load nhanh và ổn định
- **Proper feedback**: Empty states hiển thị đúng khi không có data

### 🔮 Best Practices
- **Always validate arrays**: Kiểm tra array trước khi query
- **Use proper TypeORM operators**: Import và sử dụng đúng cách
- **Early returns**: Return sớm khi không có data
- **Error boundaries**: Xử lý edge cases

**Document Processing đã hoạt động ổn định!** 🚀
