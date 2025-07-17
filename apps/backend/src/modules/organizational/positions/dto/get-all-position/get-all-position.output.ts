import { ObjectType } from "@nestjs/graphql";
import { Position } from "../../entities/position.entity";

@ObjectType()
export class GetPositionsOutput{
    positions: Position[]
}