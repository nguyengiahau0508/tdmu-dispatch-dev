import { CreateDepartmentInput } from '../create-department/create-department.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDepartmentInput extends PartialType(CreateDepartmentInput) {
  @Field(() => Int, { description: 'ID phòng ban' })
  id: number;
}
