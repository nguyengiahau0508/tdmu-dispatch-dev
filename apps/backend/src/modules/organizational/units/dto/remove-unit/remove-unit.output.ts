import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class RemoveUnitOutput {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean
} 