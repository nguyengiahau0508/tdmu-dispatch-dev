import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { File } from 'src/modules/files/entities/file.entity';
import { DocumentCategory } from '../../document-category/entities/document-category.entity';
import { DocumentType } from '../../document-types/entities/document-type.entity';
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

  @Field(() => Int)
  @Column()
  documentTypeId: number;

  @Field(() => DocumentType)
  @ManyToOne(() => DocumentType)
  @JoinColumn({ name: 'documentTypeId' })
  documentType: DocumentType;

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
