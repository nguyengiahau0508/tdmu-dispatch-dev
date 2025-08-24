import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import { User } from '../../users/entities/user.entity';
import { UploadCertificateInput } from '../dto/certificate/upload-certificate.input';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async uploadCertificate(input: UploadCertificateInput, user: User): Promise<Certificate> {
    try {
      // TODO: Implement certificate parsing and validation
      // For now, create a basic certificate entity
      const certificate = this.certificateRepository.create({
        userId: user.id,
        certificateData: input.certificateData,
        publicKey: 'temp-public-key', // TODO: Extract from certificate
        serialNumber: 'temp-serial-' + Date.now(),
        issuer: 'Temporary Issuer',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
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

  validateCertificate(certificateData: string): boolean {
    // TODO: Implement actual certificate validation
    // For now, return true if certificate data is not empty
    return Boolean(certificateData && certificateData.length > 0);
  }
}
