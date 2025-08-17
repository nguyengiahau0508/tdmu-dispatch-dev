import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export enum TaskRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

registerEnumType(TaskRequestStatus, {
  name: 'TaskRequestStatus',
  description: 'Status of task request',
});

registerEnumType(TaskPriority, {
  name: 'TaskPriority',
  description: 'Priority level of task',
});

@ObjectType()
@Entity('task_request')
export class TaskRequest {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  requestedByUserId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedByUserId' })
  requestedByUser: User;

  @Field(() => Int)
  @Column()
  assignedToUserId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToUserId' })
  assignedToUser: User;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => TaskPriority)
  @Column({ 
    type: 'enum', 
    enum: TaskPriority, 
    default: TaskPriority.MEDIUM 
  })
  priority: TaskPriority;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field(() => TaskRequestStatus)
  @Column({ 
    type: 'enum', 
    enum: TaskRequestStatus, 
    default: TaskRequestStatus.PENDING 
  })
  status: TaskRequestStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
