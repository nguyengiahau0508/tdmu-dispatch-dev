import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../dispatch/documents/entities/document.entity';
import { Certificate } from '../entities/certificate.entity';
import { DigitalSignature } from '../entities/digital-signature.entity';
import { SignatureLog, SignatureAction } from '../entities/signature-log.entity';
import { CreateSignatureInput } from '../dto/create-signature/create-signature.input';
import { VerifySignatureInput } from '../dto/verify-signature/verify-signature.input';
import * as crypto from 'crypto';
import * as forge from 'node-forge';

@Injectable()
export class DigitalSignatureService {
  constructor(
    @InjectRepository(DigitalSignature)
    private readonly signatureRepository: Repository<DigitalSignature>,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(SignatureLog)
    private readonly signatureLogRepository: Repository<SignatureLog>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  /**
   * Tạo chữ ký số cho văn bản
   */
  async createDigitalSignature(
    input: CreateSignatureInput,
    user: User,
  ): Promise<DigitalSignature> {
    // Kiểm tra văn bản tồn tại
    const document = await this.documentRepository.findOne({
      where: { id: input.documentId },
    });
    if (!document) {
      throw new NotFoundException('Văn bản không tồn tại');
    }

    // Kiểm tra chứng thư số
    const certificate = await this.certificateRepository.findOne({
      where: { id: input.certificateId, userId: user.id },
    });
    if (!certificate) {
      throw new NotFoundException('Chứng thư số không tồn tại hoặc không thuộc về bạn');
    }

    // Kiểm tra chứng thư có hợp lệ không
    if (!certificate.isValid()) {
      throw new BadRequestException('Chứng thư số đã hết hạn hoặc không hợp lệ');
    }

    // Kiểm tra quyền ký số
    if (!this.canSignDocument(user, document)) {
      throw new ForbiddenException('Bạn không có quyền ký số văn bản này');
    }

    // Kiểm tra văn bản đã được ký chưa
    const existingSignature = await this.signatureRepository.findOne({
      where: { documentId: input.documentId, signedByUserId: user.id },
    });
    if (existingSignature) {
      throw new BadRequestException('Bạn đã ký số văn bản này rồi');
    }

    try {
      // Tạo hash của văn bản
      const documentContent = this.getDocumentContent(document);
      const timestamp = new Date();
      const signatureHash = DigitalSignature.createSignatureHash(documentContent, timestamp);

      // Tạo chữ ký số
      const signatureData = await this.generateSignature(input.signatureData, certificate);

      // Lưu chữ ký số
      const signature = this.signatureRepository.create({
        documentId: input.documentId,
        signedByUserId: user.id,
        signatureData,
        certificateId: input.certificateId,
        signatureHash,
        signatureTimestamp: timestamp,
        isValid: true,
      });

      const savedSignature = await this.signatureRepository.save(signature);

      // Ghi log
      await this.createSignatureLog(
        savedSignature.id,
        SignatureAction.SIGN,
        user.id,
        { reason: 'Ký số văn bản', documentTitle: document.title }
      );

      return savedSignature;
    } catch (error) {
      throw new BadRequestException('Không thể tạo chữ ký số: ' + error.message);
    }
  }

  /**
   * Xác thực chữ ký số
   */
  async verifyDigitalSignature(
    input: VerifySignatureInput,
    user: User,
  ): Promise<boolean> {
    const signature = await this.signatureRepository.findOne({
      where: { id: input.signatureId },
      relations: ['document', 'certificate', 'signedByUser'],
    });

    if (!signature) {
      throw new NotFoundException('Chữ ký số không tồn tại');
    }

    try {
      // Kiểm tra chứng thư số
      if (!signature.certificate.isValid()) {
        await this.markSignatureAsInvalid(signature.id, 'Chứng thư số đã hết hạn');
        return false;
      }

      // Kiểm tra hash của văn bản
      const documentContent = this.getDocumentContent(signature.document);
      const isValidHash = DigitalSignature.validateSignatureHash(
        documentContent,
        signature.signatureTimestamp,
        signature.signatureHash
      );

      if (!isValidHash) {
        await this.markSignatureAsInvalid(signature.id, 'Nội dung văn bản đã bị thay đổi');
        return false;
      }

      // Xác thực chữ ký số
      const isValidSignature = await this.verifySignature(
        signature.signatureData,
        signature.certificate
      );

      if (!isValidSignature) {
        await this.markSignatureAsInvalid(signature.id, 'Chữ ký số không hợp lệ');
        return false;
      }

      // Ghi log xác thực
      await this.createSignatureLog(
        signature.id,
        SignatureAction.VERIFY,
        user.id,
        { result: 'VALID', verifiedBy: user.fullName }
      );

      return true;
    } catch (error) {
      await this.createSignatureLog(
        signature.id,
        SignatureAction.VERIFY,
        user.id,
        { result: 'INVALID', error: error.message }
      );
      return false;
    }
  }

  /**
   * Thu hồi chữ ký số
   */
  async revokeDigitalSignature(signatureId: number, user: User): Promise<boolean> {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId },
      relations: ['document', 'signedByUser'],
    });

    if (!signature) {
      throw new NotFoundException('Chữ ký số không tồn tại');
    }

    // Kiểm tra quyền thu hồi
    if (signature.signedByUserId !== user.id && !this.isAdmin(user)) {
      throw new ForbiddenException('Bạn không có quyền thu hồi chữ ký số này');
    }

    // Đánh dấu chữ ký không hợp lệ
    signature.isValid = false;
    await this.signatureRepository.save(signature);

    // Ghi log
    await this.createSignatureLog(
      signature.id,
      SignatureAction.REVOKE,
      user.id,
      { reason: 'Thu hồi chữ ký số', revokedBy: user.fullName }
    );

    return true;
  }

  /**
   * Lấy danh sách chữ ký số của văn bản
   */
  async getDocumentSignatures(documentId: number): Promise<DigitalSignature[]> {
    return this.signatureRepository.find({
      where: { documentId },
      relations: ['signedByUser', 'certificate'],
      order: { signatureTimestamp: 'DESC' },
    });
  }

  /**
   * Lấy chữ ký số theo ID
   */
  async getSignatureById(signatureId: number): Promise<DigitalSignature> {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId },
      relations: ['document', 'signedByUser', 'certificate', 'logs'],
    });

    if (!signature) {
      throw new NotFoundException('Chữ ký số không tồn tại');
    }

    return signature;
  }

  /**
   * Lấy lịch sử chữ ký số của văn bản
   */
  async getSignatureHistory(documentId: number): Promise<SignatureLog[]> {
    return this.signatureLogRepository.find({
      where: { signature: { documentId } },
      relations: ['signature', 'performedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Kiểm tra người dùng có chữ ký hợp lệ cho văn bản không
   */
  async hasValidSignature(documentId: number, userId: number): Promise<boolean> {
    const signature = await this.signatureRepository.findOne({
      where: { documentId, signedByUserId: userId, isValid: true },
    });

    if (!signature) {
      return false;
    }

    // Kiểm tra thêm tính hợp lệ của chữ ký
    return await this.verifyDigitalSignature({ signatureId: signature.id }, { id: userId } as User);
  }

  /**
   * Tạo chữ ký số
   */
  private async generateSignature(signatureData: string, certificate: Certificate): Promise<string> {
    try {
      // TODO: Implement actual signature generation with node-forge
      // For now, create a simple hash-based signature
      const hash = crypto.createHash('sha256').update(signatureData).digest('hex');
      
      // Mã hóa chữ ký trước khi lưu trữ
      return this.encryptData(hash);
    } catch (error) {
      throw new Error('Không thể tạo chữ ký số: ' + error.message);
    }
  }

  /**
   * Xác thực chữ ký số
   */
  private async verifySignature(signatureData: string, certificate: Certificate): Promise<boolean> {
    try {
      // TODO: Implement actual signature verification with node-forge
      // For now, return true if signature data exists
      const decryptedSignature = this.decryptData(signatureData);
      return Boolean(decryptedSignature && decryptedSignature.length > 0);
    } catch (error) {
      return false;
    }
  }

  /**
   * Mã hóa dữ liệu
   */
  private encryptData(data: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Giải mã dữ liệu
   */
  private decryptData(encryptedData: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Lấy nội dung văn bản để tạo hash
   */
  private getDocumentContent(document: Document): string {
    return `${document.title}${document.content}${document.documentNumber}${document.updatedAt}`;
  }

  /**
   * Kiểm tra quyền ký số
   */
  private canSignDocument(user: User, document: Document): boolean {
    // Logic kiểm tra quyền ký số
    // Có thể mở rộng theo yêu cầu cụ thể
    return true;
  }

  /**
   * Kiểm tra có phải admin không
   */
  private isAdmin(user: User): boolean {
    // TODO: Implement proper role checking
    // For now, check if user has any admin-like role
    return Array.isArray(user.roles) && user.roles.some(role => 
      typeof role === 'string' && role.includes('ADMIN')
    );
  }

  /**
   * Đánh dấu chữ ký không hợp lệ
   */
  private async markSignatureAsInvalid(signatureId: number, reason: string): Promise<void> {
    await this.signatureRepository.update(signatureId, { isValid: false });
    await this.createSignatureLog(signatureId, SignatureAction.VERIFY, 1, { reason });
  }

  /**
   * Tạo log cho chữ ký số
   */
  private async createSignatureLog(
    signatureId: number,
    action: SignatureAction,
    performedByUserId: number,
    details?: any,
  ): Promise<SignatureLog> {
    const log = this.signatureLogRepository.create(
      SignatureLog.createLogEntry(signatureId, action, performedByUserId, details)
    );
    return this.signatureLogRepository.save(log);
  }
}
