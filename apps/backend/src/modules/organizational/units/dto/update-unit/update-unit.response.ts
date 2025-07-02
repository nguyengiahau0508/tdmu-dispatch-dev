import { ObjectType, Field } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { UpdateUnitOutput } from "./update-unit.output";

@ObjectType()
export class UpdateUnitResponse extends ApiResponse(UpdateUnitOutput) {} 