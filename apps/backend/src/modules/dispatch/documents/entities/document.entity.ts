import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentCategory } from '../../document-category/entities/document-category.entity';
import { File } from 'src/modules/files/entities/file.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentComment } from './document-comment.entity';
import { DocumentVersion } from './document-version.entity';
import { DocumentApprovalHistory } from './document-approval-history.entity';
import { TaskRequest } from './task-request.entity';

export enum DocumentTypeEnum {
  OUTGOING = 'OUTGOING',
  INCOMING = 'INCOMING',
  INTERNAL = 'INTERNAL',
}

export enum DocumentPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(DocumentTypeEnum, {
  name: 'DocumentTypeEnum',
  description: 'Type of document: OUTGOING (sent), INCOMING (received), INTERNAL (internal document)',
});

registerEnumType(DocumentPriority, {
  name: 'DocumentPriority',
  description: 'Priority level of document',
});

registerEnumType(DocumentStatus, {
  name: 'DocumentStatus',
  description: 'Status of document',
});

@ObjectType()
@Entity('document')
export class Document {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  documentNumber?: string;

  @Field(() => DocumentTypeEnum)
  @Column({ type: 'enum', enum: DocumentTypeEnum })
  documentType: DocumentTypeEnum;

  @Field(() => Int)
  @Column()
  documentCategoryId: number;

  @Field(() => DocumentCategory, { nullable: true })
  @ManyToOne(() => DocumentCategory)
  @JoinColumn({ name: 'documentCategoryId' })
  documentCategory: DocumentCategory;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, { cascade: true })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  fileId: number;

  @Field(() => DocumentStatus, { defaultValue: DocumentStatus.DRAFT })
  @Column({ 
    type: 'enum', 
    enum: DocumentStatus, 
    default: DocumentStatus.DRAFT 
  })
  status: DocumentStatus;

  @Field(() => DocumentPriority, { defaultValue: DocumentPriority.MEDIUM })
  @Column({ 
    type: 'enum', 
    enum: DocumentPriority, 
    default: DocumentPriority.MEDIUM 
  })
  priority: DocumentPriority;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  assignedToUserId?: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToUserId' })
  assignedToUser?: User;

  @Field(() => Int)
  @Column()
  createdByUserId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser?: User;

  @Field(() => [DocumentComment], { nullable: true })
  @OneToMany(() => DocumentComment, (comment) => comment.document)
  comments?: DocumentComment[];

  @Field(() => [DocumentVersion], { nullable: true })
  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions?: DocumentVersion[];

  @Field(() => [DocumentApprovalHistory], { nullable: true })
  @OneToMany(() => DocumentApprovalHistory, (history) => history.document)
  approvalHistory?: DocumentApprovalHistory[];

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  taskRequestId?: number;

  @Field(() => TaskRequest, { nullable: true })
  @ManyToOne(() => TaskRequest, { nullable: true })
  @JoinColumn({ name: 'taskRequestId' })
  taskRequest?: TaskRequest;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field({ nullable: true })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
