-- Migration: Update workflow steps for new process
-- Date: 2024-01-XX
-- Description: Update workflow steps to start with "Giao việc" instead of "Tạo văn bản"

-- Update existing workflow steps to match new process
-- Step 1: Giao việc (START) - Role: DEPARTMENT_STAFF
UPDATE workflow_step 
SET name = 'Giao việc',
    description = 'Bước giao việc cho người thực hiện',
    type = 'START',
    assignedRole = 'DEPARTMENT_STAFF',
    orderNumber = 1
WHERE orderNumber = 1;

-- Step 2: Tạo văn bản (TRANSFER) - Role: CLERK
UPDATE workflow_step 
SET name = 'Tạo văn bản',
    description = 'Người được giao việc tạo văn bản',
    type = 'TRANSFER',
    assignedRole = 'CLERK',
    orderNumber = 2
WHERE orderNumber = 2;

-- Step 3: Phê duyệt trưởng phòng (APPROVAL) - Role: DEPARTMENT_STAFF
UPDATE workflow_step 
SET orderNumber = 3
WHERE orderNumber = 2 AND name = 'Phê duyệt trưởng phòng';

-- Step 4: Phê duyệt phó hiệu trưởng (APPROVAL) - Role: UNIVERSITY_LEADER
UPDATE workflow_step 
SET orderNumber = 4
WHERE orderNumber = 3 AND name = 'Phê duyệt phó hiệu trưởng';

-- Step 5: Phê duyệt hiệu trưởng (END) - Role: UNIVERSITY_LEADER
UPDATE workflow_step 
SET orderNumber = 5
WHERE orderNumber = 4 AND name = 'Phê duyệt hiệu trưởng';

-- Update workflow instances to reflect new step structure
-- Reset current step to 1 (Giao việc) for in-progress workflows
UPDATE workflow_instance 
SET currentStepId = 1 
WHERE status = 'IN_PROGRESS' AND currentStepId = 1;

-- Update completed workflows to use step 5 (Phê duyệt hiệu trưởng)
UPDATE workflow_instance 
SET currentStepId = 5 
WHERE status = 'COMPLETED' AND currentStepId = 4;
