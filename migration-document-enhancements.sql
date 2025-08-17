-- Migration: Document System Enhancements
-- Date: 2024-01-XX
-- Description: Add priority, deadline, assignedToUserId, documentNumber to documents table
--              Create new tables for comments, versions, approval history, templates, notifications, statistics

-- 1. Add new columns to document table
ALTER TABLE document 
ADD COLUMN documentNumber VARCHAR(100) NULL,
ADD COLUMN priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
ADD COLUMN deadline TIMESTAMP NULL,
ADD COLUMN assignedToUserId INT NULL,
ADD COLUMN createdByUserId INT NOT NULL DEFAULT 1,
ADD COLUMN status ENUM('draft', 'pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'draft';

-- 2. Add foreign key constraints
ALTER TABLE document 
ADD CONSTRAINT fk_document_assigned_user 
FOREIGN KEY (assignedToUserId) REFERENCES user(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_document_created_by_user 
FOREIGN KEY (createdByUserId) REFERENCES user(id) ON DELETE RESTRICT;

-- 3. Create document_comment table
CREATE TABLE document_comment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  documentId INT NOT NULL,
  createdByUserId INT NOT NULL,
  parentCommentId INT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (documentId) REFERENCES document(id) ON DELETE CASCADE,
  FOREIGN KEY (createdByUserId) REFERENCES user(id) ON DELETE RESTRICT,
  FOREIGN KEY (parentCommentId) REFERENCES document_comment(id) ON DELETE CASCADE
);

-- 4. Create document_version table
CREATE TABLE document_version (
  id INT PRIMARY KEY AUTO_INCREMENT,
  documentId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NULL,
  documentNumber VARCHAR(100) NULL,
  fileId INT NULL,
  versionNumber INT NOT NULL,
  changeDescription VARCHAR(255) NOT NULL,
  createdByUserId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documentId) REFERENCES document(id) ON DELETE CASCADE,
  FOREIGN KEY (fileId) REFERENCES file(id) ON DELETE SET NULL,
  FOREIGN KEY (createdByUserId) REFERENCES user(id) ON DELETE RESTRICT
);

-- 5. Create document_approval_history table
CREATE TABLE document_approval_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  documentId INT NOT NULL,
  action ENUM('APPROVE', 'REJECT', 'RETURN', 'FORWARD') NOT NULL,
  level ENUM('DRAFT', 'DEPARTMENT_HEAD', 'UNIVERSITY_LEADER', 'FINAL') NOT NULL,
  comment TEXT NULL,
  approvedByUserId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documentId) REFERENCES document(id) ON DELETE CASCADE,
  FOREIGN KEY (approvedByUserId) REFERENCES user(id) ON DELETE RESTRICT
);

-- 6. Create document_template table
CREATE TABLE document_template (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  content TEXT NOT NULL,
  documentCategoryId INT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  isDefault BOOLEAN DEFAULT FALSE,
  createdByUserId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (documentCategoryId) REFERENCES document_category(id) ON DELETE SET NULL,
  FOREIGN KEY (createdByUserId) REFERENCES user(id) ON DELETE RESTRICT
);

-- 7. Create workflow_notification table
CREATE TABLE workflow_notification (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('WORKFLOW_ASSIGNED', 'WORKFLOW_COMPLETED', 'WORKFLOW_REJECTED', 'WORKFLOW_DEADLINE_APPROACHING', 'WORKFLOW_OVERDUE', 'DOCUMENT_ASSIGNED', 'DOCUMENT_UPDATED') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NULL,
  status ENUM('UNREAD', 'READ', 'ARCHIVED') DEFAULT 'UNREAD',
  recipientUserId INT NOT NULL,
  workflowInstanceId INT NULL,
  documentId INT NULL,
  metadata JSON NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recipientUserId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (workflowInstanceId) REFERENCES workflow_instance(id) ON DELETE CASCADE,
  FOREIGN KEY (documentId) REFERENCES document(id) ON DELETE CASCADE
);

-- 8. Create document_statistics table
CREATE TABLE document_statistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  totalDocuments INT DEFAULT 0,
  incomingDocuments INT DEFAULT 0,
  outgoingDocuments INT DEFAULT 0,
  internalDocuments INT DEFAULT 0,
  pendingDocuments INT DEFAULT 0,
  completedDocuments INT DEFAULT 0,
  overdueDocuments INT DEFAULT 0,
  urgentDocuments INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date (date)
);

-- 9. Add indexes for better performance
CREATE INDEX idx_document_status ON document(status);
CREATE INDEX idx_document_priority ON document(priority);
CREATE INDEX idx_document_deadline ON document(deadline);
CREATE INDEX idx_document_assigned_user ON document(assignedToUserId);
CREATE INDEX idx_document_created_by ON document(createdByUserId);
CREATE INDEX idx_document_number ON document(documentNumber);
CREATE INDEX idx_document_created_at ON document(createdAt);

CREATE INDEX idx_document_comment_document ON document_comment(documentId);
CREATE INDEX idx_document_comment_created_by ON document_comment(createdByUserId);
CREATE INDEX idx_document_comment_parent ON document_comment(parentCommentId);

CREATE INDEX idx_document_version_document ON document_version(documentId);
CREATE INDEX idx_document_version_number ON document_version(documentId, versionNumber);

CREATE INDEX idx_document_approval_document ON document_approval_history(documentId);
CREATE INDEX idx_document_approval_approved_by ON document_approval_history(approvedByUserId);

CREATE INDEX idx_document_template_category ON document_template(documentCategoryId);
CREATE INDEX idx_document_template_active ON document_template(isActive);

CREATE INDEX idx_workflow_notification_recipient ON workflow_notification(recipientUserId);
CREATE INDEX idx_workflow_notification_status ON workflow_notification(status);
CREATE INDEX idx_workflow_notification_type ON workflow_notification(type);

CREATE INDEX idx_document_statistics_date ON document_statistics(date);

-- 10. Insert default document templates
INSERT INTO document_template (name, description, content, isDefault, createdByUserId) VALUES
('Mẫu công văn đến', 'Mẫu chuẩn cho công văn đến', 'CÔNG VĂN ĐẾN\n\nSố: [SỐ CÔNG VĂN]\nNgày: [NGÀY]\n\nKính gửi: [NGƯỜI NHẬN]\n\nNội dung: [NỘI DUNG]\n\nTrân trọng,\n[Người gửi]', TRUE, 1),
('Mẫu công văn đi', 'Mẫu chuẩn cho công văn đi', 'CÔNG VĂN ĐI\n\nSố: [SỐ CÔNG VĂN]\nNgày: [NGÀY]\n\nKính gửi: [NGƯỜI NHẬN]\n\nNội dung: [NỘI DUNG]\n\nTrân trọng,\n[Người gửi]', TRUE, 1),
('Mẫu văn bản nội bộ', 'Mẫu chuẩn cho văn bản nội bộ', 'VĂN BẢN NỘI BỘ\n\nSố: [SỐ VĂN BẢN]\nNgày: [NGÀY]\n\nKính gửi: [NGƯỜI NHẬN]\n\nNội dung: [NỘI DUNG]\n\nTrân trọng,\n[Người gửi]', TRUE, 1);

-- 11. Update existing documents to set createdByUserId if NULL
UPDATE document SET createdByUserId = 1 WHERE createdByUserId IS NULL;
