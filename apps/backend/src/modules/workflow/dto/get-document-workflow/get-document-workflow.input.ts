import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';

@InputType()
export class GetDocumentWorkflowInput {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  documentId: number;
}
