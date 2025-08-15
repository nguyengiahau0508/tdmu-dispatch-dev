import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { RemovePositionOutput } from './remove-position.output';

@ObjectType()
export class RemovePositionResponse extends ApiResponse(RemovePositionOutput) {}
