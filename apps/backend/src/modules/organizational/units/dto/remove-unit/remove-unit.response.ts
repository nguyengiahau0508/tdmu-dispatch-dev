import { ObjectType, Field } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { RemoveUnitOutput } from './remove-unit.output';

@ObjectType()
export class RemoveUnitResponse extends ApiResponse(RemoveUnitOutput) {}
