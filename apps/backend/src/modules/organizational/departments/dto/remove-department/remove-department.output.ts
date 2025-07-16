import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RemoveDepartmentOutput {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean;
} 