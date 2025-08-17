import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsEmail, IsUrl } from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  facebook?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  twitter?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;
}
