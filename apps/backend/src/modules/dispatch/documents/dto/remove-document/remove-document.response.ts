import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { RemoveDocumentOutput } from './remove-document.output';

@ObjectType()
export class RemoveDocumentResponse extends ApiResponse(RemoveDocumentOutput) {}
