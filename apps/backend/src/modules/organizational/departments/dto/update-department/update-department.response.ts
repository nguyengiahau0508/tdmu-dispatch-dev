import { ObjectType, Field } from '@nestjs/graphql';
import { Department } from '../../entities/department.entity';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { UpdateDepartmentOutput } from './update-department.output';

@ObjectType()
export class UpdateDepartmentResponse extends ApiResponse(UpdateDepartmentOutput) {
} 