import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Document } from './document.entity';
import { File } from 'src/modules/files/entities/file.entity';

@ObjectType()
@Entity()
export class DocumentVersion {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  documentId: number;

  @Field(() => Document)
  @ManyToOne(() => Document, (document) => document.versions)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  documentNumber?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  fileId?: number;

  @Field(() => File, { nullable: true })
  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'fileId' })
  file?: File;

  @Field()
  @Column({ type: 'int' })
  versionNumber: number;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  changeDescription: string;

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
}
