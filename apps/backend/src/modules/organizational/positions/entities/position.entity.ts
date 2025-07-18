import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { UserPosition } from '../../user-positions/entities/user-position.entity';

@ObjectType()
@Entity()
export class Position {
  @Field(() => Int, { description: 'ID chức vụ' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Tên chức vụ' })
  @Column()
  positionName: string;

  @Field(() => Int, { description: 'ID phòng ban' })
  @Column()
  departmentId: number;

  @ManyToOne(() => Department, (department) => department.positions, {
    cascade: true,
  })
  @JoinColumn({ name: 'departmentId' }) // Ràng buộc khoá ngoại
  @Field(() => Department, { description: 'Phòng ban của chức vụ' })
  department: Department;

  @Field(() => Int, { description: 'Số lượng tối đa người giữ chức vụ này' })
  @Column({ type: 'int', default: 1 })
  maxSlots: number;

  // thêm vào cuối file
  @OneToMany(() => UserPosition, (up) => up.position)
  @Field(() => [UserPosition])
  userPositions: UserPosition[];

  @Field(() => Int, { description: 'Số lượng người đang giữ chức vụ này' })
  currentSlotCount(): number {
    return this.userPositions?.filter((up) => !up.endDate).length ?? 0;
  }
}
