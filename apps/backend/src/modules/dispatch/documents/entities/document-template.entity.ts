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
import { DocumentCategory } from '../../document-category/entities/document-category.entity';

@ObjectType()
@Entity()
export class DocumentTemplate {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field()
  @Column({ type: 'text' })
  content: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  documentCategoryId?: number;

  @Field(() => DocumentCategory, { nullable: true })
  @ManyToOne(() => DocumentCategory, { nullable: true })
  @JoinColumn({ name: 'documentCategoryId' })
  documentCategory?: DocumentCategory;

  @Field(() => Boolean, { defaultValue: true })
  @Column({ default: true })
  isActive: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  isDefault: boolean;

  @Field(() => Int)
  @Column()
  createdByUserId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User;

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
