import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { DigitalSignatureService } from '../services/digital-signature.service';
import { CreateSignatureInput } from '../dto/create-signature/create-signature.input';
import { VerifySignatureInput } from '../dto/verify-signature/verify-signature.input';
import { DigitalSignature } from '../entities/digital-signature.entity';
import { SignatureLog } from '../entities/signature-log.entity';

@Resolver(() => DigitalSignature)
@UseGuards()
export class DigitalSignatureResolver {
  constructor(
    private readonly digitalSignatureService: DigitalSignatureService,
  ) {}

  @Mutation(() => DigitalSignature, { description: 'Tạo chữ ký số cho văn bản' })
  async createDigitalSignature(
    @Args('input') input: CreateSignatureInput,
    // @CurrentUser() user: User, // TODO: Add user decorator
  ): Promise<DigitalSignature> {
    // TODO: Get current user from context
    const mockUser = { id: 1 } as User;
    return this.digitalSignatureService.createDigitalSignature(input, mockUser);
  }

  @Mutation(() => Boolean, { description: 'Xác thực chữ ký số' })
  async verifyDigitalSignature(
    @Args('input') input: VerifySignatureInput,
    // @CurrentUser() user: User, // TODO: Add user decorator
  ): Promise<boolean> {
    // TODO: Get current user from context
    const mockUser = { id: 1 } as User;
    return this.digitalSignatureService.verifyDigitalSignature(input, mockUser);
  }

  @Mutation(() => Boolean, { description: 'Thu hồi chữ ký số' })
  async revokeDigitalSignature(
    @Args('signatureId', { type: () => Int }) signatureId: number,
    // @CurrentUser() user: User, // TODO: Add user decorator
  ): Promise<boolean> {
    // TODO: Get current user from context
    const mockUser = { id: 1 } as User;
    return this.digitalSignatureService.revokeDigitalSignature(signatureId, mockUser);
  }

  @Query(() => [DigitalSignature], { description: 'Lấy danh sách chữ ký số của văn bản' })
  async getDocumentSignatures(
    @Args('documentId', { type: () => Int }) documentId: number,
  ): Promise<DigitalSignature[]> {
    return this.digitalSignatureService.getDocumentSignatures(documentId);
  }

  @Query(() => DigitalSignature, { description: 'Lấy chữ ký số theo ID' })
  async getSignatureById(
    @Args('signatureId', { type: () => Int }) signatureId: number,
  ): Promise<DigitalSignature> {
    return this.digitalSignatureService.getSignatureById(signatureId);
  }

  @Query(() => [SignatureLog], { description: 'Lấy lịch sử chữ ký số của văn bản' })
  async getSignatureHistory(
    @Args('documentId', { type: () => Int }) documentId: number,
  ): Promise<SignatureLog[]> {
    return this.digitalSignatureService.getSignatureHistory(documentId);
  }

  @Query(() => Boolean, { description: 'Kiểm tra người dùng có chữ ký hợp lệ cho văn bản không' })
  async hasValidSignature(
    @Args('documentId', { type: () => Int }) documentId: number,
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<boolean> {
    return this.digitalSignatureService.hasValidSignature(documentId, userId);
  }
}
