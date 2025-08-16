import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { WorkflowInstance } from '../../workflow-instances/entities/workflow-instance.entity';
import { WorkflowStep } from '../../workflow-steps/entities/workflow-step.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum ActionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  TRANSFER = 'TRANSFER',
  CANCEL = 'CANCEL',
  START = 'START',
  COMPLETE = 'COMPLETE',
}

registerEnumType(ActionType, {
  name: 'ActionType',
  description: 'Loại hành động trong workflow',
});

@ObjectType()
@Entity()
export class WorkflowActionLog {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field(() => Int)
  instanceId: number;

  @Field(() => WorkflowInstance)
  @ManyToOne(() => WorkflowInstance, (instance) => instance.logs)
  @JoinColumn({ name: 'instanceId' })
  instance: WorkflowInstance;

  @Column()
  @Field(() => Int)
  stepId: number;

  @Field(() => WorkflowStep)
  @ManyToOne(() => WorkflowStep)
  @JoinColumn({ name: 'stepId' })
  step: WorkflowStep;

  @Field(() => ActionType)
  @Column({ type: 'enum', enum: ActionType })
  actionType: ActionType;

  @Field(() => Int)
  @Column()
  actionByUserId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'actionByUserId' })
  actionByUser: User;

  @Field()
  @Column({ type: 'datetime' })
  actionAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  note?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata?: string;

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
