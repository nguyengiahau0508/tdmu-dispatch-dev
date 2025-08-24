import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../dispatch/documents/entities/document.entity';
import { Certificate } from './certificate.entity';
import { SignatureLog } from './signature-log.entity';

@Entity('digital_signature')
@ObjectType()
export class DigitalSignature {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'documentId', type: 'int', comment: 'ID của văn bản được ký' })
  @Field(() => Int)
  documentId: number;

  @Column({ name: 'signedByUserId', type: 'int', comment: 'ID người ký' })
  @Field(() => Int)
  signedByUserId: number;

  @Column({ name: 'signatureData', type: 'text', comment: 'Chữ ký số được mã hóa' })
  @Field(() => String)
  signatureData: string;

  @Column({ name: 'certificateId', type: 'int', comment: 'ID chứng thư số sử dụng' })
  @Field(() => Int)
  certificateId: number;

  @Column({ name: 'signatureHash', type: 'varchar', length: 255, comment: 'Hash của văn bản tại thời điểm ký' })
  @Field(() => String)
  signatureHash: string;

  @Column({ name: 'signatureTimestamp', type: 'datetime', comment: 'Thời gian ký' })
  @Field(() => Date)
  signatureTimestamp: Date;

  @Column({ name: 'isValid', type: 'boolean', default: true, comment: 'Trạng thái hợp lệ của chữ ký' })
  @Field(() => Boolean)
  isValid: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  @Field(() => Document, { nullable: true })
  document: Document;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'signedByUserId' })
  @Field(() => User, { nullable: true })
  signedByUser: User;

  @ManyToOne(() => Certificate, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'certificateId' })
  @Field(() => Certificate, { nullable: true })
  certificate: Certificate;

  @OneToMany(() => SignatureLog, (log) => log.signature)
  @Field(() => [SignatureLog], { nullable: true })
  logs: SignatureLog[];

  // Helper methods
  getSignatureAge(): number {
    const now = new Date();
    const signatureTime = new Date(this.signatureTimestamp);
    const diffTime = now.getTime() - signatureTime.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Return days
  }

  isRecent(days: number = 30): boolean {
    return this.getSignatureAge() <= days;
  }

  getSignatureInfo(): {
    id: number;
    documentId: number;
    signedBy: string;
    timestamp: Date;
    isValid: boolean;
    certificateSerial: string;
    issuer: string;
  } {
    return {
      id: this.id,
      documentId: this.documentId,
      signedBy: this.signedByUser?.fullName || 'Unknown',
      timestamp: this.signatureTimestamp,
      isValid: this.isValid,
      certificateSerial: this.certificate?.serialNumber || 'Unknown',
      issuer: this.certificate?.issuer || 'Unknown',
    };
  }

  // Static methods
  static createSignatureHash(documentContent: string, timestamp: Date): string {
    const crypto = require('crypto');
    const data = documentContent + timestamp.toISOString();
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static validateSignatureHash(documentContent: string, timestamp: Date, hash: string): boolean {
    const expectedHash = this.createSignatureHash(documentContent, timestamp);
    return expectedHash === hash;
  }
}
