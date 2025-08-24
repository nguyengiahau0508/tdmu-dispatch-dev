-- Migration: Thêm các bảng cho tính năng chữ ký số
-- Tạo ngày: 2024-12-19
-- Mô tả: Tạo các bảng cần thiết cho quản lý chữ ký số và chứng thư số

-- 1. Tạo bảng certificate để lưu trữ chứng thư số
CREATE TABLE certificate (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  certificateData TEXT NOT NULL COMMENT 'Chứng thư số được mã hóa',
  publicKey TEXT NOT NULL COMMENT 'Public key của chứng thư',
  serialNumber VARCHAR(255) NOT NULL COMMENT 'Số seri chứng thư',
  issuer VARCHAR(255) NOT NULL COMMENT 'Tổ chức phát hành chứng thư',
  validFrom DATETIME NOT NULL COMMENT 'Thời gian có hiệu lực từ',
  validTo DATETIME NOT NULL COMMENT 'Thời gian có hiệu lực đến',
  isActive BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_serialNumber (serialNumber),
  INDEX idx_validTo (validTo)
);

-- 2. Tạo bảng digital_signature để lưu trữ chữ ký số
CREATE TABLE digital_signature (
  id INT PRIMARY KEY AUTO_INCREMENT,
  documentId INT NOT NULL COMMENT 'ID của văn bản được ký',
  signedByUserId INT NOT NULL COMMENT 'ID người ký',
  signatureData TEXT NOT NULL COMMENT 'Chữ ký số được mã hóa',
  certificateId INT NOT NULL COMMENT 'ID chứng thư số sử dụng',
  signatureHash VARCHAR(255) NOT NULL COMMENT 'Hash của văn bản tại thời điểm ký',
  signatureTimestamp DATETIME NOT NULL COMMENT 'Thời gian ký',
  isValid BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hợp lệ của chữ ký',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (documentId) REFERENCES document(id) ON DELETE CASCADE,
  FOREIGN KEY (signedByUserId) REFERENCES user(id) ON DELETE RESTRICT,
  FOREIGN KEY (certificateId) REFERENCES certificate(id) ON DELETE RESTRICT,
  INDEX idx_documentId (documentId),
  INDEX idx_signedByUserId (signedByUserId),
  INDEX idx_certificateId (certificateId),
  INDEX idx_signatureTimestamp (signatureTimestamp)
);

-- 3. Tạo bảng signature_log để lưu trữ lịch sử hoạt động chữ ký số
CREATE TABLE signature_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  signatureId INT NOT NULL COMMENT 'ID của chữ ký số',
  action ENUM('SIGN', 'VERIFY', 'REVOKE') NOT NULL COMMENT 'Loại hành động',
  performedByUserId INT NOT NULL COMMENT 'ID người thực hiện',
  details TEXT COMMENT 'Chi tiết hành động',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (signatureId) REFERENCES digital_signature(id) ON DELETE CASCADE,
  FOREIGN KEY (performedByUserId) REFERENCES user(id) ON DELETE RESTRICT,
  INDEX idx_signatureId (signatureId),
  INDEX idx_action (action),
  INDEX idx_performedByUserId (performedByUserId),
  INDEX idx_createdAt (createdAt)
);

-- 4. Thêm cột signatureRequired vào bảng workflow_steps
ALTER TABLE workflow_steps 
ADD COLUMN signatureRequired BOOLEAN DEFAULT FALSE COMMENT 'Yêu cầu chữ ký số cho bước này',
ADD COLUMN signatureType ENUM('OPTIONAL', 'REQUIRED', 'MULTIPLE') DEFAULT 'OPTIONAL' COMMENT 'Loại yêu cầu chữ ký số';

-- 5. Thêm cột signatureStatus vào bảng workflow_instances
ALTER TABLE workflow_instances 
ADD COLUMN signatureStatus ENUM('PENDING', 'SIGNED', 'VERIFIED', 'REVOKED') DEFAULT 'PENDING' COMMENT 'Trạng thái chữ ký số của workflow';

-- 6. Tạo bảng signature_template để lưu trữ mẫu chữ ký số
CREATE TABLE signature_template (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT 'Tên mẫu chữ ký',
  description TEXT COMMENT 'Mô tả mẫu chữ ký',
  templateData TEXT NOT NULL COMMENT 'Dữ liệu mẫu chữ ký',
  isActive BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động',
  createdByUserId INT NOT NULL COMMENT 'ID người tạo',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdByUserId) REFERENCES user(id) ON DELETE RESTRICT,
  INDEX idx_createdByUserId (createdByUserId),
  INDEX idx_isActive (isActive)
);

-- 7. Tạo bảng signature_approval để quản lý phê duyệt chữ ký số
CREATE TABLE signature_approval (
  id INT PRIMARY KEY AUTO_INCREMENT,
  signatureId INT NOT NULL COMMENT 'ID chữ ký số cần phê duyệt',
  requestedByUserId INT NOT NULL COMMENT 'ID người yêu cầu phê duyệt',
  approvedByUserId INT COMMENT 'ID người phê duyệt',
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' COMMENT 'Trạng thái phê duyệt',
  comment TEXT COMMENT 'Ghi chú phê duyệt',
  requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian yêu cầu',
  approvedAt DATETIME COMMENT 'Thời gian phê duyệt',
  FOREIGN KEY (signatureId) REFERENCES digital_signature(id) ON DELETE CASCADE,
  FOREIGN KEY (requestedByUserId) REFERENCES user(id) ON DELETE RESTRICT,
  FOREIGN KEY (approvedByUserId) REFERENCES user(id) ON DELETE RESTRICT,
  INDEX idx_signatureId (signatureId),
  INDEX idx_status (status),
  INDEX idx_requestedByUserId (requestedByUserId),
  INDEX idx_approvedByUserId (approvedByUserId)
);

-- 8. Thêm dữ liệu mẫu cho signature_template
INSERT INTO signature_template (name, description, templateData, createdByUserId) VALUES
('Chữ ký mặc định', 'Mẫu chữ ký số mặc định cho hệ thống', '{"type": "default", "style": "standard"}', 1),
('Chữ ký phê duyệt', 'Mẫu chữ ký số cho phê duyệt văn bản', '{"type": "approval", "style": "formal"}', 1),
('Chữ ký xác nhận', 'Mẫu chữ ký số cho xác nhận thông tin', '{"type": "confirmation", "style": "simple"}', 1);

-- 9. Tạo trigger để tự động cập nhật updatedAt
DELIMITER $$

CREATE TRIGGER certificate_update_trigger 
BEFORE UPDATE ON certificate
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER digital_signature_update_trigger 
BEFORE UPDATE ON digital_signature
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER signature_template_update_trigger 
BEFORE UPDATE ON signature_template
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- 10. Tạo view để xem thống kê chữ ký số
CREATE VIEW signature_statistics AS
SELECT 
    u.id as userId,
    u.fullName,
    u.email,
    COUNT(ds.id) as totalSignatures,
    COUNT(CASE WHEN ds.isValid = TRUE THEN 1 END) as validSignatures,
    COUNT(CASE WHEN ds.isValid = FALSE THEN 1 END) as invalidSignatures,
    COUNT(c.id) as totalCertificates,
    COUNT(CASE WHEN c.isActive = TRUE AND c.validTo > NOW() THEN 1 END) as activeCertificates
FROM user u
LEFT JOIN digital_signature ds ON u.id = ds.signedByUserId
LEFT JOIN certificate c ON u.id = c.userId
GROUP BY u.id, u.fullName, u.email;

-- 11. Tạo view để xem lịch sử chữ ký số theo văn bản
CREATE VIEW document_signature_history AS
SELECT 
    d.id as documentId,
    d.title as documentTitle,
    d.documentNumber,
    ds.id as signatureId,
    ds.signatureTimestamp,
    ds.isValid,
    u.fullName as signedByUser,
    c.serialNumber as certificateSerial,
    c.issuer as certificateIssuer,
    sl.action as logAction,
    sl.details as logDetails,
    sl.createdAt as logCreatedAt
FROM document d
LEFT JOIN digital_signature ds ON d.id = ds.documentId
LEFT JOIN user u ON ds.signedByUserId = u.id
LEFT JOIN certificate c ON ds.certificateId = c.id
LEFT JOIN signature_log sl ON ds.id = sl.signatureId
ORDER BY d.id, ds.signatureTimestamp DESC;

-- 12. Tạo index cho performance
CREATE INDEX idx_digital_signature_document_timestamp ON digital_signature(documentId, signatureTimestamp);
CREATE INDEX idx_signature_log_signature_action ON signature_log(signatureId, action);
CREATE INDEX idx_certificate_user_active ON certificate(userId, isActive, validTo);
CREATE INDEX idx_signature_approval_status ON signature_approval(status, requestedAt);

-- 13. Thêm comment cho các bảng
ALTER TABLE certificate COMMENT = 'Bảng lưu trữ chứng thư số của người dùng';
ALTER TABLE digital_signature COMMENT = 'Bảng lưu trữ chữ ký số của văn bản';
ALTER TABLE signature_log COMMENT = 'Bảng lưu trữ lịch sử hoạt động chữ ký số';
ALTER TABLE signature_template COMMENT = 'Bảng lưu trữ mẫu chữ ký số';
ALTER TABLE signature_approval COMMENT = 'Bảng quản lý phê duyệt chữ ký số';

-- Migration hoàn thành
-- Tổng số bảng được tạo: 5 bảng mới + 2 bảng được cập nhật
-- Tổng số view được tạo: 2 view
-- Tổng số trigger được tạo: 3 trigger
