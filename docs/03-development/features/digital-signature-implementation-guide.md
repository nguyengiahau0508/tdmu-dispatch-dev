# Hướng dẫn triển khai tính năng Chữ ký số

## Tổng quan

Tài liệu này hướng dẫn cách triển khai tính năng chữ ký số vào hệ thống TDMU Dispatch.

## 1. Cài đặt dependencies

### 1.1 Backend Dependencies

Thêm các package cần thiết vào `package.json`:

```bash
npm install node-forge crypto-js
npm install --save-dev @types/node-forge
```

### 1.2 Frontend Dependencies

```bash
npm install signature_pad crypto-js
npm install --save-dev @types/crypto-js
```

## 2. Cấu hình Database

### 2.1 Chạy Migration

```bash
# Chạy migration để tạo các bảng cần thiết
mysql -u root -p tdmu_dispatch < apps/backend/database/migrations/migration-digital-signature.sql
```

### 2.2 Kiểm tra Database

```sql
-- Kiểm tra các bảng đã được tạo
SHOW TABLES LIKE '%signature%';
SHOW TABLES LIKE '%certificate%';

-- Kiểm tra cấu trúc bảng
DESCRIBE digital_signature;
DESCRIBE certificate;
DESCRIBE signature_log;
```

## 3. Cấu hình Environment

### 3.1 Backend Environment

Thêm vào file `.env`:

```env
# Digital Signature Configuration
ENCRYPTION_KEY=your-secure-encryption-key-here
SIGNATURE_EXPIRY_DAYS=365
CERTIFICATE_EXPIRY_WARNING_DAYS=30
```

### 3.2 Security Configuration

```typescript
// apps/backend/src/config/factories/app.config.ts
export const appConfig = () => ({
  // ... existing config
  digitalSignature: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-key',
    signatureExpiryDays: parseInt(process.env.SIGNATURE_EXPIRY_DAYS) || 365,
    certificateExpiryWarningDays: parseInt(process.env.CERTIFICATE_EXPIRY_WARNING_DAYS) || 30,
  },
});
```

## 4. Triển khai Backend

### 4.1 Cấu trúc thư mục

```
apps/backend/src/modules/digital-signature/
├── dto/
│   ├── create-signature/
│   │   └── create-signature.input.ts
│   ├── verify-signature/
│   │   └── verify-signature.input.ts
│   └── certificate/
│       └── upload-certificate.input.ts
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
└── digital-signature.module.ts
```

### 4.2 Tạo Certificate Service

```typescript
// apps/backend/src/modules/digital-signature/services/certificate.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import { User } from '../../users/entities/user.entity';
import { UploadCertificateInput } from '../dto/certificate/upload-certificate.input.ts';
import * as forge from 'node-forge';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async uploadCertificate(input: UploadCertificateInput, user: User): Promise<Certificate> {
    try {
      // Parse certificate
      const cert = forge.pki.certificateFromPem(input.certificateData);
      
      // Validate certificate
      if (!this.validateCertificate(cert)) {
        throw new BadRequestException('Chứng thư số không hợp lệ');
      }

      // Check if certificate already exists
      const existingCert = await this.certificateRepository.findOne({
        where: { serialNumber: cert.serialNumber, userId: user.id },
      });

      if (existingCert) {
        throw new BadRequestException('Chứng thư số đã tồn tại');
      }

      // Create certificate entity
      const certificate = this.certificateRepository.create({
        userId: user.id,
        certificateData: input.certificateData,
        publicKey: forge.pki.publicKeyToPem(cert.publicKey),
        serialNumber: cert.serialNumber,
        issuer: cert.issuer.getField('CN').value,
        validFrom: cert.validity.notBefore,
        validTo: cert.validity.notAfter,
        isActive: true,
      });

      return await this.certificateRepository.save(certificate);
    } catch (error) {
      throw new BadRequestException('Không thể upload chứng thư số: ' + error.message);
    }
  }

  async getUserCertificates(userId: number): Promise<Certificate[]> {
    return this.certificateRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getCertificateById(certificateId: number): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId },
    });

    if (!certificate) {
      throw new NotFoundException('Chứng thư số không tồn tại');
    }

    return certificate;
  }

  async revokeCertificate(certificateId: number, user: User): Promise<boolean> {
    const certificate = await this.getCertificateById(certificateId);

    if (certificate.userId !== user.id) {
      throw new BadRequestException('Bạn không có quyền thu hồi chứng thư số này');
    }

    certificate.isActive = false;
    await this.certificateRepository.save(certificate);

    return true;
  }

  private validateCertificate(cert: any): boolean {
    // Kiểm tra thời hạn
    const now = new Date();
    if (now < cert.validity.notBefore || now > cert.validity.notAfter) {
      return false;
    }

    // Kiểm tra cấu trúc chứng thư
    if (!cert.serialNumber || !cert.publicKey) {
      return false;
    }

    return true;
  }
}
```

### 4.3 Tạo Certificate Resolver

```typescript
// apps/backend/src/modules/digital-signature/resolvers/certificate.resolver.ts
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { User } from '../../users/entities/user.entity';
import { CertificateService } from '../services/certificate.service';
import { UploadCertificateInput } from '../dto/certificate/upload-certificate.input';
import { Certificate } from '../entities/certificate.entity';
import { Role } from '../../common/enums/role.enums';

@Resolver(() => Certificate)
@UseGuards(GqlAuthGuard, RolesGuard)
export class CertificateResolver {
  constructor(
    private readonly certificateService: CertificateService,
  ) {}

  @Mutation(() => Certificate, { description: 'Upload chứng thư số' })
  @Roles(Role.UNIVERSITY_LEADER, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_STAFF)
  async uploadCertificate(
    @Args('input') input: UploadCertificateInput,
    @CurrentUser() user: User,
  ): Promise<Certificate> {
    return this.certificateService.uploadCertificate(input, user);
  }

  @Mutation(() => Boolean, { description: 'Thu hồi chứng thư số' })
  @Roles(Role.UNIVERSITY_LEADER, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_STAFF)
  async revokeCertificate(
    @Args('certificateId', { type: () => Int }) certificateId: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.certificateService.revokeCertificate(certificateId, user);
  }

  @Query(() => [Certificate], { description: 'Lấy danh sách chứng thư số của user' })
  @Roles(Role.UNIVERSITY_LEADER, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_STAFF, Role.CLERK)
  async getUserCertificates(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<Certificate[]> {
    return this.certificateService.getUserCertificates(userId);
  }

  @Query(() => Certificate, { description: 'Lấy chứng thư số theo ID' })
  @Roles(Role.UNIVERSITY_LEADER, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_STAFF, Role.CLERK)
  async getCertificateById(
    @Args('certificateId', { type: () => Int }) certificateId: number,
  ): Promise<Certificate> {
    return this.certificateService.getCertificateById(certificateId);
  }

  @Query(() => Boolean, { description: 'Xác thực chứng thư số' })
  @Roles(Role.UNIVERSITY_LEADER, Role.DEPARTMENT_HEAD, Role.DEPARTMENT_STAFF, Role.CLERK)
  async validateCertificate(
    @Args('certificateData') certificateData: string,
  ): Promise<boolean> {
    try {
      const cert = forge.pki.certificateFromPem(certificateData);
      return this.certificateService.validateCertificate(cert);
    } catch {
      return false;
    }
  }
}
```

## 5. Tích hợp với Workflow

### 5.1 Cập nhật Workflow Step Entity

```typescript
// apps/backend/src/modules/workflow/workflow-steps/entities/workflow-step.entity.ts
@Entity('workflow_steps')
export class WorkflowStep {
  // ... existing fields

  @Column({ 
    name: 'signatureRequired', 
    type: 'boolean', 
    default: false, 
    comment: 'Yêu cầu chữ ký số cho bước này' 
  })
  signatureRequired: boolean;

  @Column({ 
    name: 'signatureType', 
    type: 'enum', 
    enum: SignatureType, 
    default: SignatureType.OPTIONAL, 
    comment: 'Loại yêu cầu chữ ký số' 
  })
  signatureType: SignatureType;
}

export enum SignatureType {
  OPTIONAL = 'OPTIONAL',
  REQUIRED = 'REQUIRED',
  MULTIPLE = 'MULTIPLE'
}
```

### 5.2 Cập nhật Workflow Service

```typescript
// apps/backend/src/modules/workflow/workflow-instances/workflow-instances.service.ts
import { DigitalSignatureService } from '../../digital-signature/services/digital-signature.service';

@Injectable()
export class WorkflowInstancesService {
  constructor(
    // ... existing dependencies
    private readonly digitalSignatureService: DigitalSignatureService,
  ) {}

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
}
```

## 6. Triển khai Frontend

### 6.1 Tạo Digital Signature Service

```typescript
// apps/frontend/src/app/features/digital-signature/services/digital-signature.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class DigitalSignatureService {
  constructor(private apollo: Apollo) {}

  createDigitalSignature(input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateDigitalSignature($input: CreateSignatureInput!) {
          createDigitalSignature(input: $input) {
            id
            documentId
            signedByUserId
            signatureTimestamp
            isValid
          }
        }
      `,
      variables: { input }
    }).pipe(
      map((result: any) => result.data.createDigitalSignature)
    );
  }

  verifyDigitalSignature(input: any): Observable<boolean> {
    return this.apollo.mutate({
      mutation: gql`
        mutation VerifyDigitalSignature($input: VerifySignatureInput!) {
          verifyDigitalSignature(input: $input)
        }
      `,
      variables: { input }
    }).pipe(
      map((result: any) => result.data.verifyDigitalSignature)
    );
  }

  getDocumentSignatures(documentId: number): Observable<any[]> {
    return this.apollo.query({
      query: gql`
        query GetDocumentSignatures($documentId: Int!) {
          getDocumentSignatures(documentId: $documentId) {
            id
            signedByUser {
              fullName
              email
            }
            signatureTimestamp
            isValid
            certificate {
              serialNumber
              issuer
            }
          }
        }
      `,
      variables: { documentId }
    }).pipe(
      map((result: any) => result.data.getDocumentSignatures)
    );
  }
}
```

### 6.2 Tạo Signature Pad Component

```typescript
// apps/frontend/src/app/features/digital-signature/components/signature-pad/signature-pad.component.ts
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  template: `
    <div class="signature-pad-container">
      <canvas #signaturePad width="400" height="200"></canvas>
      <div class="signature-controls">
        <button type="button" (click)="clear()">Xóa</button>
        <button type="button" (click)="save()" [disabled]="isEmpty()">Lưu</button>
      </div>
    </div>
  `,
  styles: [`
    .signature-pad-container {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
    }
    .signature-controls {
      margin-top: 10px;
      text-align: center;
    }
    .signature-controls button {
      margin: 0 5px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .signature-controls button:first-child {
      background-color: #f44336;
      color: white;
    }
    .signature-controls button:last-child {
      background-color: #4caf50;
      color: white;
    }
    .signature-controls button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class SignaturePadComponent {
  @ViewChild('signaturePad', { static: true }) signaturePadElement!: ElementRef;
  @Input() documentId!: number;
  @Input() certificateId!: number;
  @Output() signatureSaved = new EventEmitter<string>();

  private signaturePad!: SignaturePad;

  ngAfterViewInit() {
    this.initSignaturePad();
  }

  private initSignaturePad() {
    const canvas = this.signaturePadElement.nativeElement;
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)'
    });
  }

  clear() {
    this.signaturePad.clear();
  }

  isEmpty(): boolean {
    return this.signaturePad.isEmpty();
  }

  save() {
    if (!this.signaturePad.isEmpty()) {
      const signatureData = this.signaturePad.toDataURL();
      this.signatureSaved.emit(signatureData);
    }
  }
}
```

### 6.3 Tạo Certificate Upload Component

```typescript
// apps/frontend/src/app/features/digital-signature/components/certificate-upload/certificate-upload.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-certificate-upload',
  template: `
    <div class="certificate-upload">
      <input 
        type="file" 
        #fileInput 
        (change)="onFileSelected($event)"
        accept=".p12,.pfx,.crt,.cer,.pem"
        style="display: none"
      >
      <button type="button" (click)="fileInput.click()">
        Chọn chứng thư số
      </button>
      <div *ngIf="selectedFile" class="file-info">
        <p>File: {{ selectedFile.name }}</p>
        <input 
          type="password" 
          placeholder="Mật khẩu chứng thư (nếu có)"
          [(ngModel)]="password"
        >
        <button type="button" (click)="uploadCertificate()">
          Upload
        </button>
      </div>
    </div>
  `
})
export class CertificateUploadComponent {
  @Output() certificateUploaded = new EventEmitter<any>();

  selectedFile: File | null = null;
  password: string = '';

  constructor(private certificateService: CertificateService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadCertificate() {
    if (!this.selectedFile) return;

    try {
      const fileContent = await this.readFileAsText(this.selectedFile);
      
      const input = {
        certificateData: fileContent,
        password: this.password || undefined
      };

      this.certificateService.uploadCertificate(input).subscribe({
        next: (certificate) => {
          this.certificateUploaded.emit(certificate);
          this.reset();
        },
        error: (error) => {
          console.error('Upload failed:', error);
          alert('Upload chứng thư số thất bại: ' + error.message);
        }
      });
    } catch (error) {
      console.error('File read error:', error);
      alert('Không thể đọc file chứng thư số');
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private reset() {
    this.selectedFile = null;
    this.password = '';
  }
}
```

## 7. Testing

### 7.1 Unit Tests

```typescript
// apps/backend/src/modules/digital-signature/services/digital-signature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DigitalSignatureService } from './digital-signature.service';
import { DigitalSignature } from '../entities/digital-signature.entity';
import { Certificate } from '../entities/certificate.entity';
import { SignatureLog } from '../entities/signature-log.entity';

describe('DigitalSignatureService', () => {
  let service: DigitalSignatureService;

  const mockSignatureRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockCertificateRepository = {
    findOne: jest.fn(),
  };

  const mockSignatureLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalSignatureService,
        {
          provide: getRepositoryToken(DigitalSignature),
          useValue: mockSignatureRepository,
        },
        {
          provide: getRepositoryToken(Certificate),
          useValue: mockCertificateRepository,
        },
        {
          provide: getRepositoryToken(SignatureLog),
          useValue: mockSignatureLogRepository,
        },
      ],
    }).compile();

    service = module.get<DigitalSignatureService>(DigitalSignatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more test cases...
});
```

### 7.2 Integration Tests

```typescript
// apps/backend/test/digital-signature.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DigitalSignature (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/graphql createDigitalSignature (POST)', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation CreateDigitalSignature($input: CreateSignatureInput!) {
            createDigitalSignature(input: $input) {
              id
              documentId
              signedByUserId
            }
          }
        `,
        variables: {
          input: {
            documentId: 1,
            certificateId: 1,
            signatureData: 'test-signature-data'
          }
        }
      })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 8. Deployment

### 8.1 Production Configuration

```bash
# Set production environment variables
export ENCRYPTION_KEY="your-production-encryption-key"
export NODE_ENV=production

# Run database migrations
npm run migration:run

# Build and start application
npm run build
npm run start:prod
```

### 8.2 Security Checklist

- [ ] Encryption key được cấu hình an toàn
- [ ] SSL/TLS được bật cho production
- [ ] Database được bảo vệ
- [ ] Access logs được bật
- [ ] Backup strategy được thiết lập
- [ ] Certificate validation được test
- [ ] Signature verification được test

## 9. Monitoring

### 9.1 Health Checks

```typescript
// apps/backend/src/health/digital-signature.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { DigitalSignatureService } from '../modules/digital-signature/services/digital-signature.service';

@Injectable()
export class DigitalSignatureHealthIndicator extends HealthIndicator {
  constructor(private readonly digitalSignatureService: DigitalSignatureService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test basic functionality
      const isHealthy = true; // Add actual health check logic
      
      return this.getStatus(key, isHealthy);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}
```

### 9.2 Logging

```typescript
// apps/backend/src/modules/digital-signature/services/digital-signature.service.ts
import { Logger } from '@nestjs/common';

@Injectable()
export class DigitalSignatureService {
  private readonly logger = new Logger(DigitalSignatureService.name);

  async createDigitalSignature(input: CreateSignatureInput, user: User): Promise<DigitalSignature> {
    this.logger.log(`Creating digital signature for document ${input.documentId} by user ${user.id}`);
    
    try {
      // ... implementation
      this.logger.log(`Digital signature created successfully: ${signature.id}`);
      return signature;
    } catch (error) {
      this.logger.error(`Failed to create digital signature: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## 10. Troubleshooting

### 10.1 Common Issues

1. **Certificate validation fails**
   - Kiểm tra format của chứng thư số
   - Kiểm tra thời hạn chứng thư
   - Kiểm tra cấu trúc chứng thư

2. **Signature creation fails**
   - Kiểm tra quyền của user
   - Kiểm tra chứng thư có hợp lệ không
   - Kiểm tra document tồn tại

3. **Database connection issues**
   - Kiểm tra kết nối database
   - Kiểm tra migration đã chạy chưa
   - Kiểm tra quyền database

### 10.2 Debug Commands

```bash
# Check database tables
mysql -u root -p -e "USE tdmu_dispatch; SHOW TABLES LIKE '%signature%';"

# Check certificate data
mysql -u root -p -e "USE tdmu_dispatch; SELECT id, serialNumber, issuer, validTo FROM certificate;"

# Check signature logs
mysql -u root -p -e "USE tdmu_dispatch; SELECT * FROM signature_log ORDER BY createdAt DESC LIMIT 10;"
```

## 11. Kết luận

Tính năng chữ ký số đã được tích hợp thành công vào hệ thống TDMU Dispatch. Các bước tiếp theo:

1. **Testing**: Chạy đầy đủ test suite
2. **Documentation**: Cập nhật tài liệu người dùng
3. **Training**: Đào tạo người dùng sử dụng tính năng mới
4. **Monitoring**: Theo dõi hiệu suất và bảo mật
5. **Maintenance**: Bảo trì và cập nhật định kỳ

Tính năng này sẽ giúp nâng cao tính bảo mật và pháp lý cho hệ thống quản lý công văn điện tử.
