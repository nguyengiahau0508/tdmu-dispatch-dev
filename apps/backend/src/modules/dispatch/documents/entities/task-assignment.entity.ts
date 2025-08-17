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
import { Document } from './document.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Status of task assignment',
});

@ObjectType()
@Entity('task_assignment')
export class TaskAssignment {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  documentId: number;

  @Field(() => Document, { nullable: true })
  @ManyToOne(() => Document, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'documentId' })
  document?: Document;

  @Field(() => Int)
  @Column()
  assignedToUserId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToUserId' })
  assignedToUser?: User;

  @Field(() => Int)
  @Column()
  assignedByUserId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedByUserId' })
  assignedByUser?: User;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  taskDescription?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field(() => TaskStatus)
  @Column({ 
    type: 'enum', 
    enum: TaskStatus, 
    default: TaskStatus.PENDING 
  })
  status: TaskStatus;

  @Field()
  @CreateDateColumn()
  assignedAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
