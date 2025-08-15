import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateUserPositionInput {
  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  departmentId: number;

  @Field(() => Int)
  positionId: number;

  @Field(() => Date)
  startDate: string;
}
