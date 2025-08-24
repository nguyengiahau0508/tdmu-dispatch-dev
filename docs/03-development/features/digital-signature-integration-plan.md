# Kế hoạch tích hợp Chữ ký số vào hệ thống TDMU Dispatch

## 1. Tổng quan

### Mục tiêu
Tích hợp chữ ký số theo tiêu chuẩn Việt Nam vào hệ thống quản lý công văn điện tử, đảm bảo tính pháp lý và bảo mật cho các văn bản được phê duyệt.

### Phạm vi
- Chữ ký số cho văn bản được phê duyệt
- Xác thực chữ ký số
- Lưu trữ và quản lý chứng thư số
- Tích hợp với workflow approval

## 2. Kiến trúc hệ thống

### 2.1 Module Digital Signature
```
apps/backend/src/modules/digital-signature/
├── dto/
│   ├── create-signature/
│   ├── verify-signature/
│   └── certificate/
├── entities/
│   ├── digital-signature.entity.ts
│   ├── certificate.entity.ts
│   └── signature-log.entity.ts
├── services/
│   ├── digital-signature.service.ts
│   ├── certificate.service.ts
│   └── signature-validator.service.ts
├── resolvers/
│   ├── digital-signature.resolver.ts
│   └── certificate.resolver.ts
├── guards/
│   └── signature-auth.guard.ts
└── digital-signature.module.ts
```

### 2.2 Database Schema

#### Bảng `digital_signature`
```sql
CREATE TABLE digital_signature (
  id INT PRIMARY KEY AUTO_INCREMENT,
  documentId INT NOT NULL,
  signedByUserId INT NOT NULL,
  signatureData TEXT NOT NULL, -- Chữ ký số được mã hóa
  certificateId INT NOT NULL,
  signatureHash VARCHAR(255) NOT NULL, -- Hash của văn bản
  signatureTimestamp DATETIME NOT NULL,
  isValid BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documentId) REFERENCES document(id),
  FOREIGN KEY (signedByUserId) REFERENCES user(id),
  FOREIGN KEY (certificateId) REFERENCES certificate(id)
);
```

#### Bảng `certificate`
```sql
CREATE TABLE certificate (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  certificateData TEXT NOT NULL, -- Chứng thư số
  publicKey TEXT NOT NULL,
  serialNumber VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  validFrom DATETIME NOT NULL,
  validTo DATETIME NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id)
);
```

#### Bảng `signature_log`
```sql
CREATE TABLE signature_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  signatureId INT NOT NULL,
  action ENUM('SIGN', 'VERIFY', 'REVOKE') NOT NULL,
  performedByUserId INT NOT NULL,
  details TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (signatureId) REFERENCES digital_signature(id),
  FOREIGN KEY (performedByUserId) REFERENCES user(id)
);
```

## 3. Các tính năng chính

### 3.1 Quản lý chứng thư số
- **Upload chứng thư số**: Người dùng có thể upload chứng thư số cá nhân
- **Validate chứng thư**: Kiểm tra tính hợp lệ của chứng thư
- **Quản lý vòng đời**: Theo dõi thời hạn và trạng thái chứng thư

### 3.2 Ký số văn bản
- **Ký văn bản**: Tích hợp với workflow approval để ký số
- **Xác thực trước khi ký**: Kiểm tra quyền và tính hợp lệ
- **Lưu trữ chữ ký**: Mã hóa và lưu trữ an toàn

### 3.3 Xác thực chữ ký
- **Verify chữ ký**: Kiểm tra tính hợp lệ của chữ ký
- **Kiểm tra toàn vẹn**: Đảm bảo văn bản không bị thay đổi
- **Lịch sử xác thực**: Ghi log các lần xác thực

### 3.4 Tích hợp với Workflow
- **Tự động ký**: Ký số tự động khi workflow hoàn thành
- **Yêu cầu ký**: Bắt buộc ký số trước khi chuyển bước
- **Thông báo**: Thông báo khi cần ký số

## 4. API Design

### 4.1 GraphQL Schema
```graphql
type DigitalSignature {
  id: Int!
  documentId: Int!
  document: Document!
  signedByUserId: Int!
  signedByUser: User!
  signatureData: String!
  certificateId: Int!
  certificate: Certificate!
  signatureHash: String!
  signatureTimestamp: DateTime!
  isValid: Boolean!
  createdAt: DateTime!
}

type Certificate {
  id: Int!
  userId: Int!
  user: User!
  certificateData: String!
  publicKey: String!
  serialNumber: String!
  issuer: String!
  validFrom: DateTime!
  validTo: DateTime!
  isActive: Boolean!
  createdAt: DateTime!
}

type SignatureLog {
  id: Int!
  signatureId: Int!
  signature: DigitalSignature!
  action: SignatureAction!
  performedByUserId: Int!
  performedByUser: User!
  details: String
  createdAt: DateTime!
}

enum SignatureAction {
  SIGN
  VERIFY
  REVOKE
}

input CreateSignatureInput {
  documentId: Int!
  certificateId: Int!
  signatureData: String!
}

input VerifySignatureInput {
  signatureId: Int!
}

input UploadCertificateInput {
  certificateData: String!
  password: String
}
```

### 4.2 Mutations
```graphql
extend type Mutation {
  # Chữ ký số
  createDigitalSignature(input: CreateSignatureInput!): DigitalSignature!
  verifyDigitalSignature(input: VerifySignatureInput!): Boolean!
  revokeDigitalSignature(signatureId: Int!): Boolean!
  
  # Chứng thư số
  uploadCertificate(input: UploadCertificateInput!): Certificate!
  revokeCertificate(certificateId: Int!): Boolean!
}
```

### 4.3 Queries
```graphql
extend type Query {
  # Chữ ký số
  getDocumentSignatures(documentId: Int!): [DigitalSignature!]!
  getSignatureById(signatureId: Int!): DigitalSignature!
  getSignatureHistory(documentId: Int!): [SignatureLog!]!
  
  # Chứng thư số
  getUserCertificates(userId: Int!): [Certificate!]!
  getCertificateById(certificateId: Int!): Certificate!
  validateCertificate(certificateData: String!): Boolean!
}
```

## 5. Tích hợp với Workflow

### 5.1 Cập nhật Workflow Step
```typescript
// Thêm field signatureRequired vào WorkflowStep
export class WorkflowStep {
  // ... existing fields
  signatureRequired: boolean = false;
  signatureType: SignatureType = SignatureType.OPTIONAL;
}

enum SignatureType {
  OPTIONAL = 'OPTIONAL',
  REQUIRED = 'REQUIRED',
  MULTIPLE = 'MULTIPLE'
}
```

### 5.2 Cập nhật Approval Process
```typescript
// Trong WorkflowInstancesService
private async handleApproveAction(
  instance: WorkflowInstance,
  currentStep: WorkflowStep,
  user: User,
): Promise<WorkflowInstance> {
  // ... existing logic
  
  // Kiểm tra yêu cầu chữ ký số
  if (currentStep.signatureRequired) {
    const hasValidSignature = await this.digitalSignatureService
      .hasValidSignature(instance.documentId, user.id);
    
    if (!hasValidSignature) {
      throw new BadRequestException('Chữ ký số là bắt buộc cho bước này');
    }
  }
  
  // ... continue with approval
}
```

## 6. Frontend Integration

### 6.1 Components
```
apps/frontend/src/app/features/digital-signature/
├── components/
│   ├── signature-pad/
│   ├── certificate-upload/
│   ├── signature-verification/
│   └── signature-history/
├── services/
│   ├── digital-signature.service.ts
│   └── certificate.service.ts
└── pages/
    ├── certificate-management/
    └── signature-verification/
```

### 6.2 Workflow Integration
- **Signature Pad**: Component để ký số
- **Certificate Upload**: Upload và quản lý chứng thư
- **Signature Verification**: Xác thực chữ ký
- **Signature History**: Lịch sử chữ ký

## 7. Bảo mật

### 7.1 Mã hóa dữ liệu
- Chữ ký số được mã hóa trước khi lưu trữ
- Sử dụng AES-256 cho mã hóa
- Private key được bảo vệ bằng password

### 7.2 Xác thực
- Kiểm tra quyền ký số
- Validate chứng thư số
- Kiểm tra thời hạn chứng thư

### 7.3 Audit Log
- Ghi log tất cả hoạt động chữ ký số
- Lưu trữ lịch sử xác thực
- Backup dữ liệu chữ ký

## 8. Triển khai

### 8.1 Phase 1: Core Infrastructure
- Tạo database schema
- Implement basic services
- Setup GraphQL API

### 8.2 Phase 2: Certificate Management
- Upload certificate functionality
- Certificate validation
- Certificate lifecycle management

### 8.3 Phase 3: Digital Signature
- Signature creation
- Signature verification
- Integration with workflow

### 8.4 Phase 4: Frontend & UI
- Signature pad component
- Certificate management UI
- Signature verification interface

### 8.5 Phase 5: Testing & Deployment
- Unit tests
- Integration tests
- Security testing
- Production deployment

## 9. Công nghệ sử dụng

### 9.1 Backend
- **Node.js crypto**: Xử lý mã hóa/giải mã
- **node-forge**: Xử lý chứng thư số
- **bcrypt**: Mã hóa password
- **JWT**: Xác thực

### 9.2 Frontend
- **Signature Pad**: Thư viện ký số
- **CryptoJS**: Mã hóa client-side
- **File Upload**: Upload chứng thư

### 9.3 Database
- **MySQL**: Lưu trữ dữ liệu
- **Redis**: Cache chứng thư

## 10. Tuân thủ tiêu chuẩn

### 10.1 Tiêu chuẩn Việt Nam
- **TCVN 11929**: Chữ ký số
- **TCVN 11930**: Chứng thư số
- **TCVN 11931**: Dịch vụ chứng thực chữ ký số

### 10.2 Quy định pháp luật
- **Luật Giao dịch điện tử**
- **Nghị định về chữ ký số**
- **Thông tư hướng dẫn**

## 11. Monitoring & Maintenance

### 11.1 Monitoring
- Certificate expiration alerts
- Signature verification logs
- System performance metrics

### 11.2 Maintenance
- Regular certificate updates
- Database cleanup
- Security patches

## 12. Kết luận

Việc tích hợp chữ ký số vào hệ thống TDMU Dispatch sẽ:
- ✅ Đảm bảo tính pháp lý của văn bản
- ✅ Tăng cường bảo mật
- ✅ Tự động hóa quy trình phê duyệt
- ✅ Tuân thủ quy định pháp luật
- ✅ Nâng cao hiệu quả làm việc

Kế hoạch này cung cấp một framework toàn diện để triển khai chữ ký số một cách an toàn và hiệu quả trong hệ thống quản lý công văn điện tử.
