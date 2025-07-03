import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Role } from 'src/common/enums/role.enums';
import { Assignment } from 'src/modules/organizational/assignments/entities/assignment.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';


// Đăng ký enum với GraphQL
registerEnumType(Role, {
  name: 'UserRole', // Tên này sẽ được sử dụng trong GraphQL schema
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
  @Field(() => String, { description: 'Email của người dùng (dùng để đăng nhập)' })
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
  @Field(() => Boolean, { description: 'Đánh dấu người dùng đăng nhập lần đầu (để yêu cầu đổi mật khẩu)' })
  isFirstLogin: boolean;

  @Column({ nullable: true, type: 'text' })
  @Field(() => String, { description: "Ảnh đại diện của người dùng" })
  avatar: string

  @Column({
    type: 'set',
    enum: Role,
    default: [Role.BASIC_USER],
  })
  @Field(() => [Role], { description: 'Danh sách vai trò của người dùng' })
  roles: Role[];

  @OneToMany(() => Assignment, assignment => assignment.user)
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
}
