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
import { DigitalSignature } from './digital-signature.entity';

@Entity('certificate')
@ObjectType()
export class Certificate {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ name: 'userId', type: 'int' })
  @Field(() => Int)
  userId: number;

  @Column({ name: 'certificateData', type: 'text', comment: 'Chứng thư số được mã hóa' })
  @Field(() => String)
  certificateData: string;

  @Column({ name: 'publicKey', type: 'text', comment: 'Public key của chứng thư' })
  @Field(() => String)
  publicKey: string;

  @Column({ name: 'serialNumber', type: 'varchar', length: 255, comment: 'Số seri chứng thư' })
  @Field(() => String)
  serialNumber: string;

  @Column({ name: 'issuer', type: 'varchar', length: 255, comment: 'Tổ chức phát hành chứng thư' })
  @Field(() => String)
  issuer: string;

  @Column({ name: 'validFrom', type: 'datetime', comment: 'Thời gian có hiệu lực từ' })
  @Field(() => Date)
  validFrom: Date;

  @Column({ name: 'validTo', type: 'datetime', comment: 'Thời gian có hiệu lực đến' })
  @Field(() => Date)
  validTo: Date;

  @Column({ name: 'isActive', type: 'boolean', default: true, comment: 'Trạng thái hoạt động' })
  @Field(() => Boolean)
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: true })
  user: User;

  @OneToMany(() => DigitalSignature, (signature) => signature.certificate)
  @Field(() => [DigitalSignature], { nullable: true })
  signatures: DigitalSignature[];

  // Helper methods
  isExpired(): boolean {
    return new Date() > this.validTo;
  }

  isExpiringSoon(days: number = 30): boolean {
    const expirationDate = new Date(this.validTo);
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + days);
    return new Date() <= this.validTo && this.validTo <= warningDate;
  }

  getDaysUntilExpiration(): number {
    const now = new Date();
    const expiration = new Date(this.validTo);
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isValid(): boolean {
    const now = new Date();
    return this.isActive && now >= this.validFrom && now <= this.validTo;
  }
}
