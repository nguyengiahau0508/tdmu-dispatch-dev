import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { RefreshTokenOutput } from "./refresh-token.output";


@ObjectType()
export class RefreshTokenReponse extends ApiResponse(RefreshTokenOutput){}
