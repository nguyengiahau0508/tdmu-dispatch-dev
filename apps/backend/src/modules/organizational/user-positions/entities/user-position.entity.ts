import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Position } from '../../positions/entities/position.entity';
import { User } from 'src/modules/users/entities/user.entity';

@ObjectType()
@Entity()
export class UserPosition {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => Int)
  @Column()
  positionId: number;

  @ManyToOne(() => User, (user) => user.userPositions, { cascade: true })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Position, (position) => position.userPositions, { cascade: true })
  @JoinColumn({ name: 'positionId' })
  @Field(() => Position)
  position: Position;

  @Field()
  @CreateDateColumn()
  startDate: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;
}
