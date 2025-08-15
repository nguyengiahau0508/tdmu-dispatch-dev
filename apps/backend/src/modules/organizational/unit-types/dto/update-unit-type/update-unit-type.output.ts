import { Field, ObjectType } from '@nestjs/graphql';
import { UnitType } from '../../entities/unit-type.entity';

@ObjectType()
export class UpdateUnitTypeOutput {
  @Field(() => UnitType)
  unitType: UnitType;
}
