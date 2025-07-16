import { ObjectType, Field } from '@nestjs/graphql';
import { Department } from '../../entities/department.entity';

@ObjectType()
export class UpdateDepartmentOutput {
  @Field(() => Department, { description: 'Phòng ban đã cập nhật' })
  department: Department;
} 