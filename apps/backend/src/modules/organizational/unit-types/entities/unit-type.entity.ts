import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class UnitType {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'ID của loại đơn vị' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Tên của loại đơn vị' })
  typeName: string;

  @Column({ nullable: true, type: 'text' })
  @Field(() => String, { nullable: true, description: 'Mô tả của loại đơn vị' })
  description: string;
}
