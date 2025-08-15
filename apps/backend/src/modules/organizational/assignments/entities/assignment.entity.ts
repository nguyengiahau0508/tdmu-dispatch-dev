import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Position } from 'src/modules/organizational/positions/entities/position.entity';
import { Unit } from 'src/modules/organizational/units/entities/unit.entity';

@ObjectType()
@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'ID của assignment' })
  id: number;

  @Column()
  @Field(() => Int, { description: 'ID người dùng được phân công' })
  userId: number;

  @ManyToOne(() => User, (user) => user.assignments)
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { description: 'Người dùng được phân công' })
  user: User;

  @Column()
  @Field(() => Int, { description: 'ID chức vụ của assignment' })
  positionId: number;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'positionId' })
  @Field(() => Position, { description: 'Chức vụ của assignment' })
  position: Position;

  @Column()
  @Field(() => Int, { description: 'ID đơn vị tổ chức của assignment' })
  unitId: number;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  @Field(() => Unit, { description: 'Đơn vị tổ chức của assignment' })
  unit: Unit;
}
