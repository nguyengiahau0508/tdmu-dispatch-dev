import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from 'src/common/graphql/api-response.dto';
import { DocumentCategory } from '../../entities/document-category.entity';

@ObjectType()
export class GetDocumentCategoriesPaginatedResponse extends PaginatedResponse(
  DocumentCategory,
) {}
