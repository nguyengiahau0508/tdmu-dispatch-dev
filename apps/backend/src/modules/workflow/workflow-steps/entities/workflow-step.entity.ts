import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowTemplate } from '../../workflow-templates/entities/workflow-template.entity';

export enum StepType {
  START = 'START',
  APPROVAL = 'APPROVAL',
  TRANSFER = 'TRANSFER',
  END = 'END',
}

registerEnumType(StepType, {
  name: 'StepType',
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

  @Column()
  @Field(() => Int)
  templateId: number

  @Field(() => WorkflowTemplate)
  @ManyToOne(() => WorkflowTemplate, (template) => template.steps)
  @JoinColumn({ name: 'templateId' })
  template: WorkflowTemplate;
}
