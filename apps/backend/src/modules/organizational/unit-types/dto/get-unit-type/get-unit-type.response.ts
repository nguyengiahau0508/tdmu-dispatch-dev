import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { GetUnitTypeOutput } from './get-unit-type.output';

@ObjectType()
export class GetUnitTypeResponse extends ApiResponse(GetUnitTypeOutput) {}
