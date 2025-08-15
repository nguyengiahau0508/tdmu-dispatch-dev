import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ApprovalHistoryService } from './approval_history.service';
import { ApprovalHistory } from './entities/approval_history.entity';
import { CreateApprovalHistoryInput } from './dto/create-approval_history.input';
import { UpdateApprovalHistoryInput } from './dto/update-approval_history.input';

@Resolver(() => ApprovalHistory)
export class ApprovalHistoryResolver {
  constructor(
    private readonly approvalHistoryService: ApprovalHistoryService,
  ) {}

  @Mutation(() => ApprovalHistory)
  createApprovalHistory(
    @Args('createApprovalHistoryInput')
    createApprovalHistoryInput: CreateApprovalHistoryInput,
  ) {
    return this.approvalHistoryService.create(createApprovalHistoryInput);
  }

  @Query(() => [ApprovalHistory], { name: 'approvalHistory' })
  findAll() {
    return this.approvalHistoryService.findAll();
  }

  @Query(() => ApprovalHistory, { name: 'approvalHistory' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.approvalHistoryService.findOne(id);
  }

  @Mutation(() => ApprovalHistory)
  updateApprovalHistory(
    @Args('updateApprovalHistoryInput')
    updateApprovalHistoryInput: UpdateApprovalHistoryInput,
  ) {
    return this.approvalHistoryService.update(
      updateApprovalHistoryInput.id,
      updateApprovalHistoryInput,
    );
  }

  @Mutation(() => ApprovalHistory)
  removeApprovalHistory(@Args('id', { type: () => Int }) id: number) {
    return this.approvalHistoryService.remove(id);
  }
}
