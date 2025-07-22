import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { WorkflowTemplate } from '../../workflow-templates/entities/workflow-template.entity';
import { WorkflowStep } from '../../workflow-steps/entities/workflow-step.entity';
import { WorkflowActionLog } from '../../workflow-action-logs/entities/workflow-action-log.entity';

export enum WorkflowStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(WorkflowStatus, {
  name: 'WorkflowStatus',
});

@ObjectType()
@Entity()
export class WorkflowInstance {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field(() => Int)
  templateId: number

  @Field(() => WorkflowTemplate)
  @ManyToOne(() => WorkflowTemplate, (template) => template.instances)
  @JoinColumn({ name: 'templateId' })
  template: WorkflowTemplate;

  @Field(() => Int)
  @Column()
  documentId: number;

  @Column()
  @Field(() => Int)
  currentStepId: number

  @Field(() => WorkflowStep, { nullable: true })
  @ManyToOne(() => WorkflowStep, { nullable: true })
  @JoinColumn({ name: 'currentStepId' })
  currentStep?: WorkflowStep;

  @Field(() => WorkflowStatus)
  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.IN_PROGRESS })
  status: WorkflowStatus;

  @Field(() => [WorkflowActionLog])
  @OneToMany(() => WorkflowActionLog, (log) => log.instance)
  logs: WorkflowActionLog[];
}
