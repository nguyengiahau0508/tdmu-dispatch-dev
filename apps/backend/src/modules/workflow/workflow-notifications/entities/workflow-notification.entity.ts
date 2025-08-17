import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { WorkflowInstance } from '../../workflow-instances/entities/workflow-instance.entity';

export enum NotificationType {
  WORKFLOW_ASSIGNED = 'WORKFLOW_ASSIGNED',
  WORKFLOW_COMPLETED = 'WORKFLOW_COMPLETED',
  WORKFLOW_REJECTED = 'WORKFLOW_REJECTED',
  WORKFLOW_DEADLINE_APPROACHING = 'WORKFLOW_DEADLINE_APPROACHING',
  WORKFLOW_OVERDUE = 'WORKFLOW_OVERDUE',
  DOCUMENT_ASSIGNED = 'DOCUMENT_ASSIGNED',
  DOCUMENT_UPDATED = 'DOCUMENT_UPDATED',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Type of workflow notification',
});

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
  description: 'Status of notification',
});

@ObjectType()
@Entity()
export class WorkflowNotification {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => NotificationType)
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  message?: string;

  @Field(() => NotificationStatus, { defaultValue: NotificationStatus.UNREAD })
  @Column({ 
    type: 'enum', 
    enum: NotificationStatus, 
    default: NotificationStatus.UNREAD 
  })
  status: NotificationStatus;

  @Field(() => Int)
  @Column()
  recipientUserId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientUserId' })
  recipientUser: User;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  workflowInstanceId?: number;

  @Field(() => WorkflowInstance, { nullable: true })
  @ManyToOne(() => WorkflowInstance, { nullable: true })
  @JoinColumn({ name: 'workflowInstanceId' })
  workflowInstance?: WorkflowInstance;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  documentId?: number;

  @Field({ nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata?: string;

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
