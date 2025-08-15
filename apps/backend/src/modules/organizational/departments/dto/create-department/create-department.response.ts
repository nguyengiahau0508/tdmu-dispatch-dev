import { ObjectType, Field } from '@nestjs/graphql';
import { Department } from '../../entities/department.entity';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { CreateDepartmentOutput } from './create-department.output';

@ObjectType()
export class CreateDepartmentResponse extends ApiResponse(
  CreateDepartmentOutput,
) {}
