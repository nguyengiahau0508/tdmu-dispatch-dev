import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator'; // Thêm các validator
import { Role } from 'src/common/enums/role.enums';

// Đăng ký enum với GraphQL nếu chưa làm ở entity User hoặc module chung
// (Nếu đã đăng ký ở entity User rồi thì không cần đăng ký lại ở đây)
// registerEnumType(UserRole, {
//   name: 'UserRoleInput', // Có thể đặt tên khác nếu muốn phân biệt với UserRole trong output type
//   description: 'Các vai trò có thể gán cho người dùng khi tạo mới',
// });
// Tuy nhiên, thông thường bạn sẽ dùng cùng một enum đã đăng ký.
// Nếu UserRole đã được registerEnumType ở file entity user.entity.ts thì bạn không cần làm lại ở đây.

@InputType({ description: 'Dữ liệu đầu vào để tạo người dùng mới' })
export class CreateUserInput {
  @Field(() => String, { description: 'Email của người dùng (phải là duy nhất)' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @Field(() => String, { description: 'Mật khẩu (tối thiểu 8 ký tự)' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  @Field(() => String, { description: 'Họ của người dùng' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  lastName: string;

  @Field(() => String, { description: 'Tên của người dùng' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  firstName: string;

  @Field(() => Role, {
    description: 'Vai trò của người dùng. Nếu không cung cấp, sẽ dùng vai trò mặc định.',
    nullable: true, // Cho phép không truyền giá trị này, khi đó service sẽ xử lý gán default
  })
  @IsOptional() // Đánh dấu trường này là tùy chọn
  @IsEnum(Role, { message: 'Vai trò không hợp lệ' }) // Validate giá trị phải thuộc UserRole enum
  role?: Role; // Dùng dấu ? để chỉ ra đây là trường tùy chọn

  @Field(() => Boolean, {
    description: 'Trạng thái kích hoạt tài khoản (mặc định là true).',
    nullable: true, // Cho phép không truyền
    defaultValue: true, // Giá trị mặc định cho GraphQL schema
  })
  @IsOptional()
  isActive?: boolean; // Mặc định trong entity là true, ở đây cho phép truyền để ghi đè

  // isFirstLogin thường sẽ được service tự động đặt là true khi tạo mới, không cần thiết là input
  // @Field(() => Boolean, { description: 'Đánh dấu đăng nhập lần đầu (mặc định là true).', nullable: true })
  // @IsOptional()
  // isFirstLogin?: boolean;
}
