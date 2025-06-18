import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class RefreshTokenOutput {
  @Field(() => String)
  accessToken: string
}
