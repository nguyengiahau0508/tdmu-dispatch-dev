import { InputType, Int, Field } from '@nestjs/graphql';
import { DocumentTypeEnum } from '../entities/document.entity';

@InputType()
export class CreateDocumentInput {
  @Field(() => String, { description: 'Tiêu đề văn bản' })
  title: string;

  @Field(() => String, { nullable: true, description: 'Nội dung' })
  content?: string;

  @Field(() => DocumentTypeEnum, { description: 'Loại văn bản' })
  documentType: DocumentTypeEnum;

  @Field(() => Int, { description: 'ID nhóm văn bản' })
  documentCategoryId: number;

  @Field(() => Int, { nullable: true, description: 'ID file đính kèm' })
  fileId?: number;

  @Field(() => String, { nullable: true, description: 'Trạng thái' })
  status?: string;
}
