import { Field, ObjectType } from "@nestjs/graphql";
import { UnitType } from "../../entities/unit-type.entity";

@ObjectType()
export class CreateUnitTypeOutput {
  @Field(() => UnitType)
  unitType: UnitType
}
