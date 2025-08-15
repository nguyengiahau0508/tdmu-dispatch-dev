import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RoleDto {
  @Field()
  value: string;

  @Field()
  label: string;
}
