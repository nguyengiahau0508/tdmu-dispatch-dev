import { ObjectType, Field } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { CreateUnitOutput } from './create-unit.output';

@ObjectType()
export class CreateUnitResponse extends ApiResponse(CreateUnitOutput) {}
