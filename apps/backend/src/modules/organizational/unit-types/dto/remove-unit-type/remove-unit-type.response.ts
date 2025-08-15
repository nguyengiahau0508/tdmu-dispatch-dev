import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { RemoveUnitTypeOutput } from './remove-unit-type.output';

@ObjectType()
export class RemoveUnitTypeResponse extends ApiResponse(RemoveUnitTypeOutput) {}
