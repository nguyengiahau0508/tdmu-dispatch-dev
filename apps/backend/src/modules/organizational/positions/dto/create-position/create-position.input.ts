import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePositionInput {
  @Field({ description: 'Tên chức vụ' })
  positionName: string;

  @Field({ description: 'Số lượng chức vụ' })
  maxSlots: number

  @Field({ description: 'Id của phòng ban mà chức vụ này thuộc về' })
  departmentId:number
}
