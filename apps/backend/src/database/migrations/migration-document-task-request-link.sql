-- Migration: Add taskRequestId to document table
-- Date: 2024-01-XX
-- Description: Add taskRequestId column to document table to link documents with task requests

-- Add taskRequestId column to document table
ALTER TABLE `document` 
ADD COLUMN `taskRequestId` int NULL AFTER `createdByUserId`;

-- Add foreign key constraint
ALTER TABLE `document` 
ADD CONSTRAINT `FK_document_taskRequestId` 
FOREIGN KEY (`taskRequestId`) REFERENCES `task_request` (`id`) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX `IDX_document_taskRequestId` ON `document` (`taskRequestId`);
