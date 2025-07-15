import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { File } from 'src/modules/files/entities/file.entity';
import { DocumentCategory } from '../../document-category/entities/document-category.entity';

export enum DocumentTypeEnum {
  OUTGOING = 'OUTGOING', // Công văn đi
  INCOMING = 'INCOMING', // Công văn đến
  INTERNAL = 'INTERNAL', // Nội bộ
}
registerEnumType(DocumentTypeEnum, {
  name: 'DocumentTypeEnum',
  description: 'Type of document: OUTGOING (sent), INCOMING (received), INTERNAL (internal document)',
});

@ObjectType()
@Entity('document')
export class Document {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Field(() => DocumentTypeEnum)
  @Column({ type: 'enum', enum: DocumentTypeEnum })
  documentType: DocumentTypeEnum;

  @Field(() => Int)
  @Column()
  documentCategoryId: number;

  @Field(() => DocumentCategory)
  @ManyToOne(() => DocumentCategory)
  @JoinColumn({ name: 'documentCategoryId' })
  documentCategory: DocumentCategory;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, { cascade: true })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  fileId: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
