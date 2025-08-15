import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from 'src/common/graphql/api-response.dto';
import { Unit } from '../../entities/unit.entity';

@ObjectType()
export class GetUnitsPaginatedResponse extends PaginatedResponse(Unit) {}
