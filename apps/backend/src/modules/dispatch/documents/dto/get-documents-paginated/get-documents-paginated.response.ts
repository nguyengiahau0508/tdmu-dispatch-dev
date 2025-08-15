import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from 'src/common/graphql/api-response.dto';
import { Document } from '../../entities/document.entity';

@ObjectType()
export class GetDocumentsPaginatedResponse extends PaginatedResponse(
  Document,
) {}
