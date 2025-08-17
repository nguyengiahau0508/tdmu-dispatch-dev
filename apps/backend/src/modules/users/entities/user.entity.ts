import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Role } from 'src/common/enums/role.enums';
import { File } from 'src/modules/files/entities/file.entity';
import { Assignment } from 'src/modules/organizational/assignments/entities/assignment.entity';
import { UserPosition } from 'src/modules/organizational/user-positions/entities/user-position.entity';
import { UserActivity } from './user-activity.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

// Đăng ký enum với GraphQL
registerEnumType(Role, {
  name: 'Role', // Tên này sẽ được sử dụng trong GraphQL schema
  description: 'Các vai trò của người dùng trong hệ thống',
});

export const DEFAULT_PASSWORD_HASH: string = 'hashed_default_password'; // QUAN TRỌNG: Luôn lưu trữ mật khẩu đã được băm

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: 'ID của người dùng' })
  id: number;

  @Column({ unique: true })
  @Field(() => String, {
    description: 'Email của người dùng (dùng để đăng nhập)',
  })
  email: string;

  // Không nên expose passwordHash ra GraphQL schema bằng @Field()
  @Column() // Mật khẩu nên được băm trước khi lưu
  passwordHash: string;

  @Column()
  @Field(() => String, { description: 'Họ của người dùng' })
  lastName: string;

  @Column()
  @Field(() => String, { description: 'Tên của người dùng' })
  firstName: string;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Tài khoản còn hoạt động không?' })
  isActive: boolean;

  @Column({ default: true })
  @Field(() => Boolean, {
    description:
      'Đánh dấu người dùng đăng nhập lần đầu (để yêu cầu đổi mật khẩu)',
  })
  isFirstLogin: boolean;

  @Column({ nullable: true, type: 'text' })
  @Field(() => String, {
    nullable: true,
    description: 'Ảnh đại diện của người dùng',
  })
  avatar: string;

  @Column({
    type: 'set',
    enum: Role,
    default: [Role.BASIC_USER],
    transformer: {
      to: (value: Role[]) => value,
      from: (value: string | string[]) => {
        if (Array.isArray(value)) {
          return value;
        }
        if (typeof value === 'string') {
          return [value];
        }
        return [Role.BASIC_USER];
      }
    }
  })
  @Field(() => [Role], { description: 'Danh sách vai trò của người dùng' })
  roles: Role[];

  // Thêm các trường mới cho profile
  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Số điện thoại của người dùng' })
  phoneNumber: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Địa chỉ của người dùng' })
  address: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Ngày sinh của người dùng' })
  dateOfBirth: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Giới tính của người dùng' })
  gender: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Chức danh của người dùng' })
  jobTitle: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Mô tả về bản thân' })
  bio: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Website cá nhân' })
  website: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Tài khoản LinkedIn' })
  linkedin: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Tài khoản Facebook' })
  facebook: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, description: 'Tài khoản Twitter' })
  twitter: string;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Cho phép nhận thông báo email' })
  emailNotifications: boolean;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Cho phép nhận thông báo push' })
  pushNotifications: boolean;

  @Column({ default: true })
  @Field(() => Boolean, { description: 'Cho phép hiển thị thông tin công khai' })
  isProfilePublic: boolean;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true, description: 'Thời gian đăng nhập cuối' })
  lastLoginAt: Date;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Số lần đăng nhập' })
  loginCount: number;

  @OneToMany(() => Assignment, (assignment) => assignment.user)
  @Field(() => [Assignment])
  assignments: Assignment[];

  @CreateDateColumn()
  @Field(() => Date, { description: 'Thời gian tạo tài khoản' })
  createdAt: Date; // Sửa 'createAt' thành 'createdAt' cho nhất quán với convention

  @UpdateDateColumn()
  @Field(() => Date, { description: 'Thời gian cập nhật cuối' })
  updatedAt: Date; // Sửa 'updateAt' thành 'updatedAt' cho nhất quán với convention

  @Field(() => String, { description: 'Họ và tên đầy đủ của người dùng' })
  get fullName(): string {
    // Xử lý trường hợp firstName hoặc lastName có thể là null hoặc undefined
    const first = this.firstName || '';
    const last = this.lastName || '';
    return `${first} ${last}`.trim();
  }

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  avatarFileId?: number;

  @ManyToOne(() => File, { nullable: true, cascade: true })
  @JoinColumn({ name: 'avatarFileId' }) // RÀNG BUỘC: Dùng đúng cột avatarFileId bạn tự khai báo
  @Field(() => File, { nullable: true })
  avatarFile?: File;

  // thêm vào cuối file
  @OneToMany(() => UserPosition, (up) => up.user)
  @Field(() => [UserPosition])
  userPositions: UserPosition[];

  @OneToMany(() => UserActivity, (activity) => activity.user)
  @Field(() => [UserActivity])
  activities: UserActivity[];
}
