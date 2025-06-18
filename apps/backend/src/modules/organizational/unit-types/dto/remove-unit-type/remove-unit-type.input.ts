import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNumber } from "class-validator";

@InputType()
export class RemoveUnitTypeInput {
  @Field(() => Int)
  @IsNumber()
  id: number
} 