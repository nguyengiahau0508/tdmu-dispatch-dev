import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class File {
  @PrimaryGeneratedColumn()
  @Field(() => String) // Specify the GraphQL type for the field
  id: string;

  @Column()
  @Field(() => String)
  driveFileId: string;

  @Column()
  @Field(() => String)
  originalName: string;

  @Column()
  @Field(() => String)
  mimeType: string;

  @Column('simple-array', { nullable: true })
  @Field(() => [Int], { nullable: true }) // Use Int for numbers in GraphQL
  allowedUserIds: number[];

  @Column({ default: false })
  @Field(() => Boolean)
  isPublic: boolean;
}
