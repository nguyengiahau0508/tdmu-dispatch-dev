# Database Migration: Make currentStepId Nullable

## Vấn đề

Lỗi foreign key constraint khi set `currentStepId = 0`:

```
Cannot add or update a child row: a foreign key constraint fails 
(`tdmu_dispatch`.`workflow_instance`, CONSTRAINT `FK_eba40b371c4cbc903eb44be3214` 
FOREIGN KEY (`currentStepId`) REFERENCES `workflow_step` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION)
```

## Giải pháp

Cần thay đổi cột `currentStepId` từ `NOT NULL` thành `NULL` để có thể set `NULL` khi workflow hoàn thành.

## Migration SQL

### 1. Tạo migration file

Tạo file migration mới trong thư mục `apps/backend/src/database/migrations/`:

```sql
-- Migration: Make currentStepId nullable in workflow_instance table
-- File: 20250816_make_currentStepId_nullable.sql

-- Step 1: Drop foreign key constraint
ALTER TABLE `workflow_instance` 
DROP FOREIGN KEY `FK_eba40b371c4cbc903eb44be3214`;

-- Step 2: Modify column to allow NULL
ALTER TABLE `workflow_instance` 
MODIFY COLUMN `currentStepId` INT NULL;

-- Step 3: Re-add foreign key constraint with NULL allowed
ALTER TABLE `workflow_instance` 
ADD CONSTRAINT `FK_workflow_instance_currentStepId` 
FOREIGN KEY (`currentStepId`) REFERENCES `workflow_step` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Update existing completed workflows to have NULL currentStepId
UPDATE `workflow_instance` 
SET `currentStepId` = NULL 
WHERE `status` = 'COMPLETED' AND `currentStepId` = 0;
```

### 2. Chạy migration

```bash
# Chạy migration
mysql -u your_username -p your_database < 20250816_make_currentStepId_nullable.sql
```

### 3. Hoặc sử dụng TypeORM CLI

```bash
# Tạo migration
npm run migration:generate -- -n MakeCurrentStepIdNullable

# Chạy migration
npm run migration:run
```

## Kiểm tra sau migration

### 1. Kiểm tra schema

```sql
-- Kiểm tra cột currentStepId
DESCRIBE workflow_instance;

-- Kết quả mong đợi:
-- currentStepId | int(11) | YES | NULL | NULL
```

### 2. Kiểm tra foreign key constraints

```sql
-- Kiểm tra foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'workflow_instance' 
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 3. Test workflow completion

```sql
-- Test: Cập nhật workflow instance thành completed với currentStepId = NULL
UPDATE workflow_instance 
SET status = 'COMPLETED', currentStepId = NULL 
WHERE id = 3;

-- Kiểm tra kết quả
SELECT id, status, currentStepId FROM workflow_instance WHERE id = 3;
```

## Rollback (nếu cần)

```sql
-- Rollback migration
ALTER TABLE `workflow_instance` 
DROP FOREIGN KEY `FK_workflow_instance_currentStepId`;

ALTER TABLE `workflow_instance` 
MODIFY COLUMN `currentStepId` INT NOT NULL;

ALTER TABLE `workflow_instance` 
ADD CONSTRAINT `FK_eba40b371c4cbc903eb44be3214` 
FOREIGN KEY (`currentStepId`) REFERENCES `workflow_step` (`id`) 
ON DELETE NO ACTION ON UPDATE NO ACTION;
```

## Lưu ý

1. **Backup database** trước khi chạy migration
2. **Test trên staging** trước khi áp dụng production
3. **Cập nhật code** để xử lý `currentStepId` có thể `NULL`
4. **Cập nhật GraphQL schema** để phản ánh thay đổi

## Cập nhật code

### 1. Entity đã được cập nhật

```typescript
@Field(() => Int, { nullable: true })
@Column({ nullable: true })
currentStepId: number;
```

### 2. Service methods đã được cập nhật

```typescript
// Khi workflow hoàn thành
const updateData = {
  status: WorkflowStatus.COMPLETED,
  currentStepId: undefined, // Sẽ được chuyển thành NULL trong database
  updatedAt: new Date()
};
```

### 3. Frontend cần cập nhật

```typescript
// Kiểm tra currentStepId có thể null
if (workflowInstance.currentStepId) {
  // Có current step
} else {
  // Workflow đã hoàn thành
}
```
