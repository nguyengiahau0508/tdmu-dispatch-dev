import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { GetPositionOutput } from "./get-position.output";

@ObjectType()
export class GetPositionResponse extends ApiResponse(GetPositionOutput) {} 