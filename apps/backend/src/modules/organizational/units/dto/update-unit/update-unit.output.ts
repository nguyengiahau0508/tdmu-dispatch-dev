import { ObjectType, Field } from "@nestjs/graphql";
import { Unit } from "../../entities/unit.entity";

@ObjectType()
export class UpdateUnitOutput {
  @Field(() => Unit, { description: 'Đơn vị đã cập nhật' })
  unit: Unit
} 