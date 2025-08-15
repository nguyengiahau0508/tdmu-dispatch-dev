import { ObjectType } from '@nestjs/graphql';
import { UnitType } from '../../entities/unit-type.entity';
import { PaginatedResponse } from 'src/common/graphql/api-response.dto';

@ObjectType()
export class GetUnitTypesPaginatedResponse extends PaginatedResponse(
  UnitType,
) {}
