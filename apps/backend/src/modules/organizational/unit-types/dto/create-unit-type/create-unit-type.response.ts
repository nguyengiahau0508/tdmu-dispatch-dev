import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { CreateUnitTypeOutput } from "./create-unit-type.output";

@ObjectType()
export class CreateUnitTypeResponse extends ApiResponse(CreateUnitTypeOutput) { }
