import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { GetAllDepartmentOutput } from './get-all-department.output';

@ObjectType()
export class GetAllDepartmentResponse extends ApiResponse(
  GetAllDepartmentOutput,
) {}
