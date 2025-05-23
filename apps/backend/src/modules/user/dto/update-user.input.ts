// src/modules/users/dto/update-user.input.ts
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  // PartialType kế thừa các field từ CreateUserInput và làm chúng optional

  // Bạn có thể thêm các field chỉ có trong update ở đây
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
