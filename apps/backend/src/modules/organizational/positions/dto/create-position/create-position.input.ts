import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePositionInput {
  @Field({ description: 'Tên chức vụ' })
  positionName: string;
}
