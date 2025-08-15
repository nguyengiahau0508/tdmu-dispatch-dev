import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class RemoveDepartmentInput {
  @Field(() => Int, { description: 'ID phòng ban' })
  id: number;
}
