import { ObjectType, Field } from '@nestjs/graphql';
import { Document } from '../../entities/document.entity';

@ObjectType()
export class GetDocumentOutput {
  @Field(() => Document, { description: 'Thông tin văn bản' })
  document: Document;
}
