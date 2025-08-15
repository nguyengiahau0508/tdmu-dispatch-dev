import { CreateApprovalStepInput } from './create-approval_step.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateApprovalStepInput extends PartialType(
  CreateApprovalStepInput,
) {
  @Field(() => Int)
  id: number;
}
