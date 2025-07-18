import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { CreateUserPositionOutput } from "./create-user-position.output";


@ObjectType()
export class CreateUserPositionResponse extends ApiResponse(CreateUserPositionOutput){}