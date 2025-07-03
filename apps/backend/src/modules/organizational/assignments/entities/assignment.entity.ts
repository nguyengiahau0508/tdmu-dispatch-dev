import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Position } from 'src/modules/organizational/positions/entities/position.entity';
import { Unit } from 'src/modules/organizational/units/entities/unit.entity';

@ObjectType()
@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'ID của assignment' })
  id: number;

  @ManyToOne(() => User, user => user.assignments)
  @Field(() => User, { description: 'Người dùng được phân công' })
  user: User;

  @ManyToOne(() => Position)
  @Field(() => Position, { description: 'Chức vụ của assignment' })
  position: Position;

  @ManyToOne(() => Unit)
  @Field(() => Unit, { description: 'Đơn vị tổ chức của assignment' })
  unit: Unit;
}

