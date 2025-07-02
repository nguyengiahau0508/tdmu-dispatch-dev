import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponse } from "src/common/graphql/api-response.dto";
import { Position } from "../../entities/position.entity";

@ObjectType()
export class GetPositionsPaginatedResponse extends PaginatedResponse(Position) {} 