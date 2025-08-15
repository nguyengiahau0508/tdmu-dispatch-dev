import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { CreatePositionOutput } from './create-position.output';

@ObjectType()
export class CreatePositionResponse extends ApiResponse(CreatePositionOutput) {}
