import { ObjectType, Field } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { GetUnitOutput } from './get-unit.output';

@ObjectType()
export class GetUnitResponse extends ApiResponse(GetUnitOutput) {}
