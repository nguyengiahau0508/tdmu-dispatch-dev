import { Field, ObjectType } from '@nestjs/graphql';
import { UnitType } from '../../entities/unit-type.entity';

@ObjectType()
export class GetUnitTypeOutput {
  @Field(() => UnitType)
  unitType: UnitType;
}
