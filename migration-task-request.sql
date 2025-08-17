-- Migration: Add task_request table
-- Date: 2024-01-XX
-- Description: Add task_request table for new workflow where tasks are assigned before document creation

-- Create task_request table
CREATE TABLE `task_request` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requestedByUserId` int NOT NULL,
  `assignedToUserId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `deadline` timestamp NULL DEFAULT NULL,
  `instructions` text,
  `notes` text,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `rejectionReason` text,
  `approvedAt` timestamp NULL DEFAULT NULL,
  `rejectedAt` timestamp NULL DEFAULT NULL,
  `cancelledAt` timestamp NULL DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_task_request_requestedByUserId` (`requestedByUserId`),
  KEY `IDX_task_request_assignedToUserId` (`assignedToUserId`),
  KEY `IDX_task_request_status` (`status`),
  KEY `IDX_task_request_createdAt` (`createdAt`),
  CONSTRAINT `FK_task_request_requestedByUserId` FOREIGN KEY (`requestedByUserId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_task_request_assignedToUserId` FOREIGN KEY (`assignedToUserId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX `IDX_task_request_priority` ON `task_request` (`priority`);
CREATE INDEX `IDX_task_request_deadline` ON `task_request` (`deadline`);
