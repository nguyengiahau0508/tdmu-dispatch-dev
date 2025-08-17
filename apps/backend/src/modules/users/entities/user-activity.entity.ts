import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  AVATAR_UPDATE = 'AVATAR_UPDATE',
  DOCUMENT_VIEW = 'DOCUMENT_VIEW',
  DOCUMENT_CREATE = 'DOCUMENT_CREATE',
  DOCUMENT_UPDATE = 'DOCUMENT_UPDATE',
  DOCUMENT_DELETE = 'DOCUMENT_DELETE',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',
  APPROVAL_APPROVED = 'APPROVAL_APPROVED',
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',
}

registerEnumType(ActivityType, {
  name: 'ActivityType',
  description: 'Các loại hoạt động của người dùng',
});

@ObjectType()
@Entity()
export class UserActivity {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'ID của hoạt động' })
  id: number;

  @Column()
  @Field(() => Int, { description: 'ID của người dùng' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  @Field(() => ActivityType, { description: 'Loại hoạt động' })
  activityType: ActivityType;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Mô tả hoạt động' })
  description: string;

  @Column({ nullable: true, type: 'json' })
  @Field(() => String, { nullable: true, description: 'Dữ liệu bổ sung' })
  metadata?: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'IP address' })
  ipAddress: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'User agent' })
  userAgent: string;

  @CreateDateColumn()
  @Field(() => Date, { description: 'Thời gian tạo hoạt động' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.activities)
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { description: 'Người dùng thực hiện hoạt động' })
  user: User;
}
