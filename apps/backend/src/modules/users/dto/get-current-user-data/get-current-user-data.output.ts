import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../../entities/user.entity";

@ObjectType()
export class GetCurrentUserDataOutput {
  @Field(() => User)
  user: User
}
