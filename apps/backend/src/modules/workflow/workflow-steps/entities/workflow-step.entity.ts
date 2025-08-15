import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WorkflowTemplate } from '../../workflow-templates/entities/workflow-template.entity';
import { WorkflowActionLog } from '../../workflow-action-logs/entities/workflow-action-log.entity';

export enum StepType {
  START = 'START',
  APPROVAL = 'APPROVAL',
  TRANSFER = 'TRANSFER',
  END = 'END',
}

export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

registerEnumType(StepType, {
  name: 'StepType',
  description: 'Loại bước trong workflow',
});

registerEnumType(StepStatus, {
  name: 'StepStatus',
  description: 'Trạng thái của bước',
});

@ObjectType()
@Entity()
export class WorkflowStep {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => StepType)
  @Column({ type: 'enum', enum: StepType })
  type: StepType;

  @Field()
  @Column()
  assignedRole: string;

  @Field(() => Int)
  @Column()
  orderNumber: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  nextStepId?: number;

  @Field(() => Boolean, { defaultValue: true })
  @Column({ default: true })
  isActive: boolean;

  @Column()
  @Field(() => Int)
  templateId: number;

  @Field(() => WorkflowTemplate)
  @ManyToOne(() => WorkflowTemplate, (template) => template.steps)
  @JoinColumn({ name: 'templateId' })
  template: WorkflowTemplate;

  @Field(() => [WorkflowActionLog])
  @OneToMany(() => WorkflowActionLog, (log) => log.step)
  actionLogs: WorkflowActionLog[];

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
