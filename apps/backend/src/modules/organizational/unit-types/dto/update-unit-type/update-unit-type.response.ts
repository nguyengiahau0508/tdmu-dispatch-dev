import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { UpdateUnitTypeOutput } from "./update-unit-type.output";

@ObjectType()
export class UpdateUnitTypeResponse extends ApiResponse(UpdateUnitTypeOutput) { } 