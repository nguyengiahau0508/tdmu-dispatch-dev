import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class GetDepartmentInput {
  @Field(() => Int, { description: 'ID phòng ban' })
  id: number;
} 