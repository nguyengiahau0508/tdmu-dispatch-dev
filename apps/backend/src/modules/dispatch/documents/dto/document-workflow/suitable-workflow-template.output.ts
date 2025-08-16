import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SuitableWorkflowTemplate {
  @Field(() => Int, { description: 'ID của template' })
  id: number;

  @Field(() => String, { description: 'Tên template' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Mô tả template' })
  description?: string;

  @Field(() => Boolean, { description: 'Template có đang hoạt động không' })
  isActive: boolean;
}

@ObjectType()
export class SuitableWorkflowTemplatesResponse {
  @Field(() => [SuitableWorkflowTemplate], { description: 'Danh sách templates' })
  templates: SuitableWorkflowTemplate[];
}
