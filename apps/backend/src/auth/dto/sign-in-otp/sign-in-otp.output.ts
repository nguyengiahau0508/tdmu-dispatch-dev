import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SignInOtpOutput {
  @Field(() => String)
  accessToken: string;
}
