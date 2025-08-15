import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { Department } from '../../entities/department.entity';

@ObjectType()
export class GetAllDepartmentOutput {
  @Field(() => [Department])
  departments: Department[];
}
