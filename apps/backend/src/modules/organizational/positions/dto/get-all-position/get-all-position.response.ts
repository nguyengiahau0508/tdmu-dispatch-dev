import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { GetPositionsOutput } from "./get-all-position.output";


@ObjectType()
export class GetPositionsResponse extends ApiResponse(GetPositionsOutput){}