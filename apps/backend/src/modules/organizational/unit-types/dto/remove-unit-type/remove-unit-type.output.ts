import { Field, ObjectType } from "@nestjs/graphql";
import { UnitType } from "../../entities/unit-type.entity";

@ObjectType()
export class RemoveUnitTypeOutput {
  @Field(() => UnitType)
  unitType: UnitType
} 