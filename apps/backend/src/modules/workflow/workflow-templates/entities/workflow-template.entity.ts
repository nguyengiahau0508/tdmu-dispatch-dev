import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowStep } from '../../workflow-steps/entities/workflow-step.entity';
import { WorkflowInstance } from '../../workflow-instances/entities/workflow-instance.entity';
import { User } from 'src/modules/users/entities/user.entity';


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
  createdByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Field(() => [WorkflowStep])
  @OneToMany(() => WorkflowStep, (step) => step.template, { cascade: true })
  steps: WorkflowStep[];

  @Field(() => [WorkflowInstance])
  @OneToMany(() => WorkflowInstance, (instance) => instance.template)
  instances: WorkflowInstance[];
}
