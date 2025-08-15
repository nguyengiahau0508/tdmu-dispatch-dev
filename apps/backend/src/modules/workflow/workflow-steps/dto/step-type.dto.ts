import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StepTypeDto {
  @Field()
  value: string;

  @Field()
  label: string;
}
