import { Field, InputType, Int } from "@nestjs/graphql";
import { IsString, MaxLength, IsNumber } from "class-validator";

@InputType()
export class UpdateUnitTypeInput {
  @Field(() => Int)
  @IsNumber()
  id: number

  @Field(() => String)
  @IsString()
  @MaxLength(256)
  typeName: string

  @Field(() => String)
  @IsString()
  description: string
} 