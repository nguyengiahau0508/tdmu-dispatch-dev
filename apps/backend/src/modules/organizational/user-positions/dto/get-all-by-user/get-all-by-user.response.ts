import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { GetAllByUserOutput } from "./get-all-by-user.output";


@ObjectType()
export class GetAllByUserReponse extends ApiResponse(GetAllByUserOutput){}