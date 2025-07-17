import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Position } from '../../positions/entities/position.entity';

@ObjectType()
@Entity() // Đặt tên bảng nếu muốn
export class Department {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentDepartmentId?: number;

  // Quan hệ đệ quy: 1 phòng ban có thể có phòng ban cha
  @ManyToOne(() => Department, (department) => department.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentDepartmentId' })
  @Field(() => Department, { nullable: true })
  parentDepartment?: Department;

  // Quan hệ đệ quy: 1 phòng ban có thể có nhiều phòng ban con
  @OneToMany(() => Department, (department) => department.parentDepartment)
  @Field(() => [Department], { nullable: true })
  children?: Department[];

  @OneToMany(() => Position, (position) => position.department)
  @Field(() => [Position], { nullable: true })
  positions?: Position[];
}
