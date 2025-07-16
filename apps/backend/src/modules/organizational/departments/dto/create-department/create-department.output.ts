import { ObjectType, Field } from '@nestjs/graphql';
import { Department } from '../../entities/department.entity';

@ObjectType()
export class CreateDepartmentOutput {
  @Field(() => Department, { description: 'Phòng ban đã tạo' })
  department: Department;
} 