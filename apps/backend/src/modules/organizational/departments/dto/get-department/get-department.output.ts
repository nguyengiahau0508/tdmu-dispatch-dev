import { ObjectType, Field } from '@nestjs/graphql';
import { Department } from '../../entities/department.entity';

@ObjectType()
export class GetDepartmentOutput {
  @Field(() => Department, { description: 'Thông tin phòng ban' })
  department: Department;
} 