import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Position {
  @Field(() => Int, { description: 'ID chức vụ' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Tên chức vụ' })
  @Column()
  positionName: string;
}
