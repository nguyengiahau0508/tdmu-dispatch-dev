import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UnitType } from '../../unit-types/entities/unit-type.entity';

@ObjectType()
@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'ID của đơn vị' })
  id: number;

  @Column()
  @Field(() => String, { description: 'Tên đơn vị' })
  unitName: string;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true, description: 'ID loại đơn vị' })
  unitTypeId: number;

  @ManyToOne(() => UnitType, { nullable: true })
  @JoinColumn({ name: 'unitTypeId' })
  @Field(() => UnitType, { nullable: true, description: 'Loại đơn vị' })
  unitType: UnitType;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true, description: 'ID đơn vị cha' })
  parentUnitId: number;

  @Column({ nullable: true, type: 'timestamp' })
  @Field(() => Date, { nullable: true, description: 'Ngày thành lập' })
  establishmentDate: Date;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Email đơn vị' })
  email: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Số điện thoại đơn vị' })
  phone: string;

  @OneToMany(() => Unit, (unit) => unit.parentUnit)
  @Field(() => [Unit], { description: 'Các đơn vị con' })
  childUnits: Unit[];

  @ManyToOne(() => Unit, (unit) => unit.childUnits, { nullable: true })
  @JoinColumn({ name: 'parentUnitId' })
  @Field(() => Unit, { nullable: true, description: 'Đơn vị cha' })
  parentUnit: Unit;
}
