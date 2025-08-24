import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CertificateService } from '../services/certificate.service';
import { UploadCertificateInput } from '../dto/certificate/upload-certificate.input';
import { Certificate } from '../entities/certificate.entity';
import { User } from '../../users/entities/user.entity';

@Resolver(() => Certificate)
@UseGuards()
export class CertificateResolver {
  constructor(
    private readonly certificateService: CertificateService,
  ) {}

  @Mutation(() => Certificate, { description: 'Upload chứng thư số' })
  async uploadCertificate(
    @Args('input') input: UploadCertificateInput,
    // @CurrentUser() user: User, // TODO: Add user decorator
  ): Promise<Certificate> {
    // TODO: Get current user from context
    const mockUser = { id: 1 } as User;
    return this.certificateService.uploadCertificate(input, mockUser);
  }

  @Mutation(() => Boolean, { description: 'Thu hồi chứng thư số' })
  async revokeCertificate(
    @Args('certificateId', { type: () => Int }) certificateId: number,
    // @CurrentUser() user: User, // TODO: Add user decorator
  ): Promise<boolean> {
    // TODO: Get current user from context
    const mockUser = { id: 1 } as User;
    return this.certificateService.revokeCertificate(certificateId, mockUser);
  }

  @Query(() => [Certificate], { description: 'Lấy danh sách chứng thư số của user' })
  async getUserCertificates(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<Certificate[]> {
    return this.certificateService.getUserCertificates(userId);
  }

  @Query(() => Certificate, { description: 'Lấy chứng thư số theo ID' })
  async getCertificateById(
    @Args('certificateId', { type: () => Int }) certificateId: number,
  ): Promise<Certificate> {
    return this.certificateService.getCertificateById(certificateId);
  }

  @Query(() => Boolean, { description: 'Xác thực chứng thư số' })
  async validateCertificate(
    @Args('certificateData') certificateData: string,
  ): Promise<boolean> {
    return this.certificateService.validateCertificate(certificateData);
  }
}
