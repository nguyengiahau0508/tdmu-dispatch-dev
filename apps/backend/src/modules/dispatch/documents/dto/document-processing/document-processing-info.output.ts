import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum PriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

registerEnumType(PriorityEnum, {
  name: 'PriorityEnum',
  description: 'Mức độ ưu tiên của document',
});

@ObjectType()
export class DocumentProcessingInfo {
  @Field(() => Int, { description: 'ID của document' })
  documentId: number;

  @Field(() => String, { description: 'Tiêu đề document' })
  documentTitle: string;

  @Field(() => String, { description: 'Loại document' })
  documentType: string;

  @Field(() => String, { description: 'Category của document' })
  documentCategory: string;

  @Field(() => String, { description: 'Trạng thái document' })
  status: string;

  @Field(() => Date, { description: 'Thời gian tạo' })
  createdAt: Date;

  @Field(() => Int, { nullable: true, description: 'ID của workflow instance' })
  workflowInstanceId?: number;

  @Field(() => Int, { nullable: true, description: 'ID của step hiện tại' })
  currentStepId?: number;

  @Field(() => String, { nullable: true, description: 'Tên step hiện tại' })
  currentStepName?: string;

  @Field(() => String, { nullable: true, description: 'Trạng thái workflow' })
  workflowStatus?: string;

  @Field(() => Boolean, { description: 'Cần xử lý không' })
  requiresAction: boolean;

  @Field(() => String, { nullable: true, description: 'Loại action có sẵn' })
  actionType?: string;

  @Field(() => Date, { nullable: true, description: 'Deadline' })
  deadline?: Date;

  @Field(() => PriorityEnum, { description: 'Mức độ ưu tiên' })
  priority: PriorityEnum;

  @Field(() => Int, { nullable: true, description: 'ID của người đang xử lý' })
  currentAssigneeUserId?: number;

  @Field(() => String, { nullable: true, description: 'Tên người đang xử lý' })
  currentAssigneeName?: string;

  @Field(() => String, { nullable: true, description: 'Email người đang xử lý' })
  currentAssigneeEmail?: string;

  @Field(() => Int, { nullable: true, description: 'ID của người tạo' })
  createdByUserId?: number;

  @Field(() => String, { nullable: true, description: 'Tên người tạo' })
  createdByName?: string;

  @Field(() => String, { nullable: true, description: 'Email người tạo' })
  createdByEmail?: string;
}

@ObjectType()
export class DocumentsForProcessingResponse {
  @Field(() => [DocumentProcessingInfo], { description: 'Danh sách documents cần xử lý' })
  documents: DocumentProcessingInfo[];
}

@ObjectType()
export class ProcessedDocumentsResponse {
  @Field(() => [DocumentProcessingInfo], { description: 'Danh sách documents đã xử lý' })
  documents: DocumentProcessingInfo[];
}
