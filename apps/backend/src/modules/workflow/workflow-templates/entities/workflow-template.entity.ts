import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowStep } from '../../workflow-steps/entities/workflow-step.entity';
import { WorkflowInstance } from '../../workflow-instances/entities/workflow-instance.entity';


@ObjectType()
@Entity()
export class WorkflowTemplate {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int)
  @Column()
  createdBy: number;

  @Field()
  @Column({ type: 'datetime' })
  createdAt: Date;

  @Field(() => [WorkflowStep])
  @OneToMany(() => WorkflowStep, (step) => step.template, { cascade: true })
  steps: WorkflowStep[];

  @Field(() => [WorkflowInstance])
  @OneToMany(() => WorkflowInstance, (instance) => instance.template)
  instances: WorkflowInstance[];
}
