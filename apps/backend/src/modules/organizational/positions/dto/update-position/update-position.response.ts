import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { UpdatePositionOutput } from "./update-position.output";

@ObjectType()
export class UpdatePositionResponse extends ApiResponse(UpdatePositionOutput) {} 