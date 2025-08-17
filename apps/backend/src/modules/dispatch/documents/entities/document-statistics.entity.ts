import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class DocumentStatistics {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'date' })
  date: Date;

  @Field(() => Int)
  @Column({ default: 0 })
  totalDocuments: number;

  @Field(() => Int)
  @Column({ default: 0 })
  incomingDocuments: number;

  @Field(() => Int)
  @Column({ default: 0 })
  outgoingDocuments: number;

  @Field(() => Int)
  @Column({ default: 0 })
  internalDocuments: number;

  @Field(() => Int)
  @Column({ default: 0 })
  pendingDocuments: number;

  @Field(() => Int)
  @Column({ default: 0 })
  completedDocuments: number;

  @Field(() => Int)
  @Column({ default: 0 })
  overdueDocuments: number;

  @Field(() => Int)
  @Column({ default: 0 })
  urgentDocuments: number;

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
