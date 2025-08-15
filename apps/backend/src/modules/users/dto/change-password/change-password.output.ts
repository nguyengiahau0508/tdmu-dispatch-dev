import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChangePasswordOutput {
  @Field(() => String)
  status: 'success' | 'failed';
}
