import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { PageOptionsDto } from 'src/common/shared/pagination/dtos';
import { Role } from 'src/common/enums/role.enums';

@InputType()
export class GetUsersPaginatedInput extends PageOptionsDto {
  @Field(() => String, {
    nullable: true,
    description: 'Tìm kiếm theo tên hoặc email',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => Role, { nullable: true, description: 'Lọc theo vai trò' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Lọc theo trạng thái hoạt động',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
