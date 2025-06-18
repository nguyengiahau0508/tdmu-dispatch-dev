import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { GetCurrentUserDataOutput } from "./get-current-user-data.output";

@ObjectType()
export class getCurrentUserDataReponse extends ApiResponse(GetCurrentUserDataOutput) { }
