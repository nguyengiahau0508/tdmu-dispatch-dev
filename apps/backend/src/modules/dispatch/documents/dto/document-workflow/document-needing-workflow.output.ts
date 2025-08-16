import { ObjectType, Field, Int } from '@nestjs/graphql';
import { DocumentTypeEnum } from '../../entities/document.entity';

@ObjectType()
export class DocumentNeedingWorkflow {
  @Field(() => Int, { description: 'ID của document' })
  id: number;

  @Field(() => String, { description: 'Tiêu đề document' })
  title: string;

  @Field(() => DocumentTypeEnum, { description: 'Loại document' })
  documentType: DocumentTypeEnum;

  @Field(() => String, { nullable: true, description: 'Trạng thái document' })
  status?: string;

  @Field(() => String, { nullable: true, description: 'Tên category' })
  documentCategory?: string;

  @Field(() => Date, { description: 'Thời gian tạo' })
  createdAt: Date;
}

@ObjectType()
export class DocumentsNeedingWorkflowResponse {
  @Field(() => [DocumentNeedingWorkflow], { description: 'Danh sách documents' })
  documents: DocumentNeedingWorkflow[];
}
