import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Document } from './document.entity';

@ObjectType()
@Entity()
export class DocumentComment {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'text' })
  content: string;

  @Field(() => Int)
  @Column()
  documentId: number;

  @Field(() => Document)
  @ManyToOne(() => Document, (document) => document.comments)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Field(() => Int)
  @Column()
  createdByUserId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentCommentId?: number;

  @Field(() => DocumentComment, { nullable: true })
  @ManyToOne(() => DocumentComment, { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment?: DocumentComment;

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
