import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { RemoveDepartmentOutput } from './remove-department.output';

@ObjectType()
export class RemoveDepartmentResponse extends ApiResponse(
  RemoveDepartmentOutput,
) {
  // This class can be extended with additional fields if needed in the future
}
