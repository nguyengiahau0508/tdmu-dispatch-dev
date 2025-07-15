import { CreateApprovalProcessInput } from './create-approval-process.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateApprovalProcessInput extends PartialType(CreateApprovalProcessInput) {
  @Field(() => Int)
  id: number;
}
