import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowStepsService } from './workflow-steps.service';
import { WorkflowStep } from './entities/workflow-step.entity';
import { CreateWorkflowStepInput } from './dto/create-workflow-step.input';
import { UpdateWorkflowStepInput } from './dto/update-workflow-step.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => WorkflowStep)
@UseGuards(GqlAuthGuard)
export class WorkflowStepsResolver {
  constructor(private readonly workflowStepsService: WorkflowStepsService) {}

  @Mutation(() => WorkflowStep, { description: 'Tạo workflow step mới' })
  createWorkflowStep(
    @Args('createWorkflowStepInput') createWorkflowStepInput: CreateWorkflowStepInput
  ) {
    return this.workflowStepsService.create(createWorkflowStepInput);
  }

  @Query(() => [WorkflowStep], { name: 'workflowSteps', description: 'Lấy tất cả workflow steps' })
  findAll() {
    return this.workflowStepsService.findAll();
  }

  @Query(() => [WorkflowStep], { name: 'workflowStepsByTemplate', description: 'Lấy workflow steps theo template ID' })
  findByTemplateId(@Args('templateId', { type: () => Int }) templateId: number) {
    return this.workflowStepsService.findByTemplateId(templateId);
  }

  @Query(() => WorkflowStep, { name: 'workflowStep', description: 'Lấy workflow step theo ID' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowStepsService.findOne(id);
  }

  @Query(() => WorkflowStep, { name: 'nextWorkflowStep', description: 'Lấy workflow step tiếp theo', nullable: true })
  findNextStep(@Args('currentStepId', { type: () => Int }) currentStepId: number) {
    return this.workflowStepsService.findNextStep(currentStepId);
  }

  @Mutation(() => WorkflowStep, { description: 'Cập nhật workflow step' })
  updateWorkflowStep(
    @Args('updateWorkflowStepInput') updateWorkflowStepInput: UpdateWorkflowStepInput
  ) {
    return this.workflowStepsService.update(updateWorkflowStepInput.id, updateWorkflowStepInput);
  }

  @Mutation(() => Boolean, { description: 'Xóa workflow step' })
  removeWorkflowStep(@Args('id', { type: () => Int }) id: number) {
    return this.workflowStepsService.remove(id);
  }

  @Mutation(() => [WorkflowStep], { description: 'Sắp xếp lại thứ tự các workflow steps' })
  reorderWorkflowSteps(
    @Args('templateId', { type: () => Int }) templateId: number,
    @Args('stepIds', { type: () => [Int] }) stepIds: number[]
  ) {
    return this.workflowStepsService.reorderSteps(templateId, stepIds);
  }
}
