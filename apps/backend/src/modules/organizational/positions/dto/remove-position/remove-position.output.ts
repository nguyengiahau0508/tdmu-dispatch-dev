import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class RemovePositionOutput {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean;
} 