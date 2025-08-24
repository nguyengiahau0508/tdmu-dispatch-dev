import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { DigitalSignature } from './digital-signature.entity';

export enum SignatureAction {
  SIGN = 'SIGN',
  VERIFY = 'VERIFY',
  REVOKE = 'REVOKE',
}

registerEnumType(SignatureAction, {
  name: 'SignatureAction',
  description: 'Các loại hành động chữ ký số',
});

@Entity('signature_log')
@ObjectType()
export class SignatureLog {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'signatureId', type: 'int', comment: 'ID của chữ ký số' })
  @Field(() => Int)
  signatureId: number;

  @Column({ 
    name: 'action', 
    type: 'enum', 
    enum: SignatureAction, 
    comment: 'Loại hành động' 
  })
  @Field(() => SignatureAction)
  action: SignatureAction;

  @Column({ name: 'performedByUserId', type: 'int', comment: 'ID người thực hiện' })
  @Field(() => Int)
  performedByUserId: number;

  @Column({ name: 'details', type: 'text', nullable: true, comment: 'Chi tiết hành động' })
  @Field(() => String, { nullable: true })
  details: string | null;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Field(() => Date)
  createdAt: Date;

  // Relations
  @ManyToOne(() => DigitalSignature, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'signatureId' })
  @Field(() => DigitalSignature, { nullable: true })
  signature: DigitalSignature;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'performedByUserId' })
  @Field(() => User, { nullable: true })
  performedByUser: User;

  // Helper methods
  getActionDescription(): string {
    switch (this.action) {
      case SignatureAction.SIGN:
        return 'Ký số văn bản';
      case SignatureAction.VERIFY:
        return 'Xác thực chữ ký';
      case SignatureAction.REVOKE:
        return 'Thu hồi chữ ký';
      default:
        return 'Hành động không xác định';
    }
  }

  getFormattedDetails(): string {
    if (!this.details) {
      return this.getActionDescription();
    }

    try {
      const details = JSON.parse(this.details);
      return `${this.getActionDescription()}: ${details.reason || details.message || this.details}`;
    } catch {
      return `${this.getActionDescription()}: ${this.details}`;
    }
  }

  isRecent(hours: number = 24): boolean {
    const now = new Date();
    const logTime = new Date(this.createdAt);
    const diffTime = now.getTime() - logTime.getTime();
    return diffTime <= hours * 60 * 60 * 1000;
  }

  // Static methods
  static createLogEntry(
    signatureId: number,
    action: SignatureAction,
    performedByUserId: number,
    details?: any
  ): Partial<SignatureLog> {
    return {
      signatureId,
      action,
      performedByUserId,
      details: details ? JSON.stringify(details) : null,
    };
  }
}
