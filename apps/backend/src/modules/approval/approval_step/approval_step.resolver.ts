import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ApprovalStepService } from './approval_step.service';
import { ApprovalStep } from './entities/approval_step.entity';
import { CreateApprovalStepInput } from './dto/create-approval_step.input';
import { UpdateApprovalStepInput } from './dto/update-approval_step.input';

@Resolver(() => ApprovalStep)
export class ApprovalStepResolver {
  constructor(private readonly approvalStepService: ApprovalStepService) {}

  @Mutation(() => ApprovalStep)
  createApprovalStep(
    @Args('createApprovalStepInput')
    createApprovalStepInput: CreateApprovalStepInput,
  ) {
    return this.approvalStepService.create(createApprovalStepInput);
  }

  @Query(() => [ApprovalStep], { name: 'approvalStep' })
  findAll() {
    return this.approvalStepService.findAll();
  }

  @Query(() => ApprovalStep, { name: 'approvalStep' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.approvalStepService.findOne(id);
  }

  @Mutation(() => ApprovalStep)
  updateApprovalStep(
    @Args('updateApprovalStepInput')
    updateApprovalStepInput: UpdateApprovalStepInput,
  ) {
    return this.approvalStepService.update(
      updateApprovalStepInput.id,
      updateApprovalStepInput,
    );
  }

  @Mutation(() => ApprovalStep)
  removeApprovalStep(@Args('id', { type: () => Int }) id: number) {
    return this.approvalStepService.remove(id);
  }
}
