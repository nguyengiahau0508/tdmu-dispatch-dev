import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { WorkflowInstance } from '../../workflow-instances/entities/workflow-instance.entity';
import { WorkflowStep } from '../../workflow-steps/entities/workflow-step.entity';

@ObjectType()
@Entity()
export class WorkflowActionLog {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field(() => Int)
  instanceId: number

  @Field(() => WorkflowInstance)
  @ManyToOne(() => WorkflowInstance, (instance) => instance.logs)
  @JoinColumn({ name: 'instanceId' })
  instance: WorkflowInstance;

  @Column()
  @Field(() => Int)
  stepId: number

  @Field(() => WorkflowStep)
  @ManyToOne(() => WorkflowStep)
  @JoinColumn({ name: 'stepId' })
  step: WorkflowStep;

  @Field(() => Int)
  @Column()
  actionBy: number;

  @Field()
  @Column({ type: 'datetime' })
  actionAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  note?: string;
}
