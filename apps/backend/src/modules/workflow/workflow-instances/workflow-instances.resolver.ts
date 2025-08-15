import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { CreateWorkflowInstanceInput } from './dto/create-workflow-instance.input';
import { UpdateWorkflowInstanceInput } from './dto/update-workflow-instance.input';
import { GetWorkflowInstancePaginatedInput } from './dto/get-workflow-instance-paginated/get-workflow-instance-paginated.input';
import { WorkflowInstancePageDto } from 'src/common/shared/pagination/page.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';

@Resolver(() => WorkflowInstance)
@UseGuards(GqlAuthGuard)
export class WorkflowInstancesResolver {
  constructor(private readonly workflowInstancesService: WorkflowInstancesService) {}

  @Mutation(() => WorkflowInstance, { description: 'Tạo workflow instance mới' })
  createWorkflowInstance(
    @Args('createWorkflowInstanceInput') createWorkflowInstanceInput: CreateWorkflowInstanceInput,
    @CurrentUser() user: User
  ) {
    return this.workflowInstancesService.create(createWorkflowInstanceInput, user);
  }

  @Query(() => [WorkflowInstance], { name: 'workflowInstances', description: 'Lấy tất cả workflow instances' })
  findAll() {
    return this.workflowInstancesService.findAll();
  }

  @Query(() => WorkflowInstancePageDto, { name: 'workflowInstancesPaginated', description: 'Lấy danh sách workflow instances có phân trang' })
  findPaginated(@Args('input') input: GetWorkflowInstancePaginatedInput) {
    return this.workflowInstancesService.findPaginated(input);
  }

  @Query(() => WorkflowInstance, { name: 'workflowInstance', description: 'Lấy workflow instance theo ID' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowInstancesService.findOne(id);
  }

  @Mutation(() => WorkflowInstance, { description: 'Cập nhật workflow instance' })
  updateWorkflowInstance(
    @Args('updateWorkflowInstanceInput') updateWorkflowInstanceInput: UpdateWorkflowInstanceInput
  ) {
    return this.workflowInstancesService.update(updateWorkflowInstanceInput.id, updateWorkflowInstanceInput);
  }

  @Mutation(() => Boolean, { description: 'Xóa workflow instance' })
  removeWorkflowInstance(@Args('id', { type: () => Int }) id: number) {
    return this.workflowInstancesService.remove(id);
  }

  @Mutation(() => WorkflowInstance, { description: 'Chuyển đến bước tiếp theo trong workflow' })
  advanceToNextStep(@Args('instanceId', { type: () => Int }) instanceId: number) {
    return this.workflowInstancesService.advanceToNextStep(instanceId);
  }

  @Query(() => WorkflowInstance, { name: 'workflowHistory', description: 'Lấy lịch sử workflow với logs' })
  getWorkflowHistory(@Args('instanceId', { type: () => Int }) instanceId: number) {
    return this.workflowInstancesService.getWorkflowHistory(instanceId);
  }
}
