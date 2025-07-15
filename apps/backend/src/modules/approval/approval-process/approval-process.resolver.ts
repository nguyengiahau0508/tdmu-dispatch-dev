import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ApprovalProcessService } from './approval-process.service';
import { ApprovalProcess } from './entities/approval-process.entity';
import { CreateApprovalProcessInput } from './dto/create-approval-process.input';
import { UpdateApprovalProcessInput } from './dto/update-approval-process.input';

@Resolver(() => ApprovalProcess)
export class ApprovalProcessResolver {
  constructor(private readonly approvalProcessService: ApprovalProcessService) {}

  @Mutation(() => ApprovalProcess)
  createApprovalProcess(@Args('createApprovalProcessInput') createApprovalProcessInput: CreateApprovalProcessInput) {
    return this.approvalProcessService.create(createApprovalProcessInput);
  }

  @Query(() => [ApprovalProcess], { name: 'approvalProcess' })
  findAll() {
    return this.approvalProcessService.findAll();
  }

  @Query(() => ApprovalProcess, { name: 'approvalProcess' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.approvalProcessService.findOne(id);
  }

  @Mutation(() => ApprovalProcess)
  updateApprovalProcess(@Args('updateApprovalProcessInput') updateApprovalProcessInput: UpdateApprovalProcessInput) {
    return this.approvalProcessService.update(updateApprovalProcessInput.id, updateApprovalProcessInput);
  }

  @Mutation(() => ApprovalProcess)
  removeApprovalProcess(@Args('id', { type: () => Int }) id: number) {
    return this.approvalProcessService.remove(id);
  }
}
