import { ObjectType, Field } from "@nestjs/graphql";
import { Position } from "../../entities/position.entity";

@ObjectType()
export class GetPositionsOutput{
     @Field(() => [Position])
    positions: Position[]
}