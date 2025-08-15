import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from 'src/common/graphql/api-response.dto';
import { Department } from '../../entities/department.entity';

@ObjectType()
export class GetDepartmentsPaginatedResponse extends PaginatedResponse(
  Department,
) {}
