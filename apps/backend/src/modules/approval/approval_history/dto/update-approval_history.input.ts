import { CreateApprovalHistoryInput } from './create-approval_history.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateApprovalHistoryInput extends PartialType(
  CreateApprovalHistoryInput,
) {
  @Field(() => Int)
  id: number;
}
