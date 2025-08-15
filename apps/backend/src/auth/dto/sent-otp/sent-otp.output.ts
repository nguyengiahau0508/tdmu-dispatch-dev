import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SentOtpOutput {
  @Field(() => Boolean)
  status: boolean;
}
