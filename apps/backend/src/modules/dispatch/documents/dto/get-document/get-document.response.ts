import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { GetDocumentOutput } from './get-document.output';

@ObjectType()
export class GetDocumentResponse extends ApiResponse(GetDocumentOutput) {}
