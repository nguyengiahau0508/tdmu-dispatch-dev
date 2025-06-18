import { Field, InputType } from "@nestjs/graphql";
import { IsString, MaxLength } from "class-validator";

@InputType()
export class CreateUnitTypeInput {
  @Field(() => String)
  @IsString()
  @MaxLength(256)
  typeName: string

  @Field(() => String)
  @IsString()
  description: string
}
