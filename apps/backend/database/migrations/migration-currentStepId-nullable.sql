-- Migration: Make currentStepId nullable in workflow_instance table
-- Date: 2025-08-16
-- Description: Allow currentStepId to be NULL when workflow is completed

-- Step 1: Drop existing foreign key constraint
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

-- Step 5: Verify the changes
SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    DATA_TYPE
FROM information_schema.COLUMNS 
WHERE TABLE_NAME = 'workflow_instance' 
AND COLUMN_NAME = 'currentStepId';

-- Step 6: Show foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'workflow_instance' 
AND REFERENCED_TABLE_NAME IS NOT NULL;
