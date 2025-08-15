import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { UpdateDocumentTypeOutput } from './update-document-type.output';

@ObjectType()
export class UpdateDocumentTypeResponse extends ApiResponse(
  UpdateDocumentTypeOutput,
) {
  // This class is intentionally left empty as a placeholder for future fields or methods.
}
