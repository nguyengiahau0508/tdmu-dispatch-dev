import { ObjectType, Field } from "@nestjs/graphql";
import { Position } from "../../entities/position.entity";

@ObjectType()
export class UpdatePositionOutput {
  @Field(() => Position, { description: 'Chức vụ đã cập nhật' })
  position: Position;
} 