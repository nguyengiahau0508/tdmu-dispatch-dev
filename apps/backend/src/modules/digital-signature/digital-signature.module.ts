import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalSignature } from './entities/digital-signature.entity';
import { Certificate } from './entities/certificate.entity';
import { SignatureLog } from './entities/signature-log.entity';
import { DigitalSignatureService } from './services/digital-signature.service';
import { CertificateService } from './services/certificate.service';
import { DigitalSignatureResolver } from './resolvers/digital-signature.resolver';
import { CertificateResolver } from './resolvers/certificate.resolver';
import { Document } from '../dispatch/documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DigitalSignature,
      Certificate,
      SignatureLog,
      Document,
    ]),
  ],
  providers: [
    DigitalSignatureService,
    CertificateService,
    DigitalSignatureResolver,
    CertificateResolver,
  ],
  exports: [
    DigitalSignatureService,
    CertificateService,
  ],
})
export class DigitalSignatureModule {}
