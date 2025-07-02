import { ObjectType, Field } from "@nestjs/graphql";
import { Position } from "../../entities/position.entity";

@ObjectType()
export class GetPositionOutput {
  @Field(() => Position, { description: 'Thông tin chức vụ' })
  position: Position;
} 