import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAssignmentInput {
  @Field(() => Int, { description: 'ID người dùng được phân công' })
  userId: number;

  @Field(() => Int, { description: 'ID chức vụ của assignment' })
  positionId: number;

  @Field(() => Int, { description: 'ID đơn vị tổ chức của assignment' })
  unitId: number;
}
