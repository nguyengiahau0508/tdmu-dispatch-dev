import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { User } from "../../entities/user.entity";

@ObjectType()
export class UserResponse extends ApiResponse(User) { }
