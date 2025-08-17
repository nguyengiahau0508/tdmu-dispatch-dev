-- Migration: Create task_assignment table
-- Date: 2024-08-17

CREATE TABLE `task_assignment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `documentId` int NOT NULL,
  `assignedToUserId` int NOT NULL,
  `assignedByUserId` int NOT NULL,
  `taskDescription` text,
  `deadline` timestamp NULL DEFAULT NULL,
  `instructions` text,
  `notes` text,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `assignedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`documentId`),
  KEY `idx_assigned_to_user_id` (`assignedToUserId`),
  KEY `idx_assigned_by_user_id` (`assignedByUserId`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_at` (`assignedAt`),
  CONSTRAINT `fk_task_assignment_document` FOREIGN KEY (`documentId`) REFERENCES `document` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_assignment_assigned_to_user` FOREIGN KEY (`assignedToUserId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_assignment_assigned_by_user` FOREIGN KEY (`assignedByUserId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS `idx_task_assignment_deadline` ON `task_assignment` (`deadline`);
