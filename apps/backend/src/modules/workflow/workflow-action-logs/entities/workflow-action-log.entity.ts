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

  @Field(() => WorkflowInstance)
  @ManyToOne(() => WorkflowInstance, (instance) => instance.logs)
  @JoinColumn({ name: 'instance_id' })
  instance: WorkflowInstance;

  @Field(() => WorkflowStep)
  @ManyToOne(() => WorkflowStep)
  @JoinColumn({ name: 'step_id' })
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
