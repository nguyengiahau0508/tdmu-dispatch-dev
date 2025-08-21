-- Migration: Add currentAssigneeUserId to workflow_instance table
-- Date: 2025-08-21
-- Description: Add field to track who is currently processing the document

-- Step 1: Add currentAssigneeUserId column to workflow_instance
ALTER TABLE `workflow_instance` 
ADD COLUMN `currentAssigneeUserId` INT NULL AFTER `currentStepId`;

-- Step 2: Add foreign key constraint
ALTER TABLE `workflow_instance` 
ADD CONSTRAINT `FK_workflow_instance_currentAssigneeUserId` 
FOREIGN KEY (`currentAssigneeUserId`) REFERENCES `user` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 3: Add index for better performance
CREATE INDEX `IDX_workflow_instance_currentAssigneeUserId` 
ON `workflow_instance` (`currentAssigneeUserId`);

-- Step 4: Update existing workflow instances to set currentAssigneeUserId
-- For now, set it to the same as assignedToUserId in document table
UPDATE `workflow_instance` wi
JOIN `document` d ON wi.documentId = d.id
SET wi.currentAssigneeUserId = d.assignedToUserId
WHERE wi.currentAssigneeUserId IS NULL;

-- Step 5: Verify the changes
SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    DATA_TYPE,
    COLUMN_KEY
FROM information_schema.COLUMNS 
WHERE TABLE_NAME = 'workflow_instance' 
AND COLUMN_NAME = 'currentAssigneeUserId';

-- Step 6: Show foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'workflow_instance' 
AND REFERENCED_TABLE_NAME IS NOT NULL
AND COLUMN_NAME = 'currentAssigneeUserId';
