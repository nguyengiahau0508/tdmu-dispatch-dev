import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Document } from './document.entity';

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  RETURN = 'RETURN',
  FORWARD = 'FORWARD',
}

export enum ApprovalLevel {
  DRAFT = 'DRAFT',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  UNIVERSITY_LEADER = 'UNIVERSITY_LEADER',
  FINAL = 'FINAL',
}

registerEnumType(ApprovalAction, {
  name: 'ApprovalAction',
  description: 'Type of approval action',
});

registerEnumType(ApprovalLevel, {
  name: 'ApprovalLevel',
  description: 'Level of approval',
});

@ObjectType()
@Entity()
export class DocumentApprovalHistory {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  documentId: number;

  @Field(() => Document)
  @ManyToOne(() => Document, (document) => document.approvalHistory)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Field(() => ApprovalAction)
  @Column({ type: 'enum', enum: ApprovalAction })
  action: ApprovalAction;

  @Field(() => ApprovalLevel)
  @Column({ type: 'enum', enum: ApprovalLevel })
  level: ApprovalLevel;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Field(() => Int)
  @Column()
  approvedByUserId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedByUserId' })
  approvedByUser: User;

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
