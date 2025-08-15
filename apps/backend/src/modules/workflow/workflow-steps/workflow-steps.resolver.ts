import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowStepsService } from './workflow-steps.service';
import { WorkflowStep } from './entities/workflow-step.entity';
import { CreateWorkflowStepInput } from './dto/create-workflow-step.input';
import { UpdateWorkflowStepInput } from './dto/update-workflow-step.input';
import { GetWorkflowStepPaginatedInput } from './dto/get-workflow-step-paginated/get-workflow-step-paginated.input';
import { WorkflowStepPageDto } from 'src/common/shared/pagination/page.dto';
import { StepTypeDto } from './dto/step-type.dto';
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

  @Query(() => WorkflowStepPageDto, { name: 'workflowStepsPaginated', description: 'Lấy danh sách workflow steps có phân trang' })
  findPaginated(@Args('input') input: GetWorkflowStepPaginatedInput) {
    return this.workflowStepsService.findPaginated(input);
  }

  @Query(() => WorkflowStep, { name: 'workflowStep', description: 'Lấy workflow step theo ID' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowStepsService.findOne(id);
  }

  @Query(() => [WorkflowStep], { name: 'workflowStepsByTemplate', description: 'Lấy workflow steps theo template ID' })
  findByTemplateId(@Args('templateId', { type: () => Int }) templateId: number) {
    return this.workflowStepsService.findByTemplateId(templateId);
  }

  @Query(() => [StepTypeDto], { name: 'workflowStepTypes', description: 'Lấy danh sách các loại workflow step' })
  getStepTypes() {
    return this.workflowStepsService.getStepTypes();
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

  @Mutation(() => [WorkflowStep], { description: 'Di chuyển workflow step đến vị trí mới' })
  moveWorkflowStep(
    @Args('stepId', { type: () => Int }) stepId: number,
    @Args('newOrder', { type: () => Int }) newOrder: number
  ) {
    return this.workflowStepsService.moveStep(stepId, newOrder);
  }

  @Mutation(() => WorkflowStep, { description: 'Sao chép workflow step' })
  duplicateWorkflowStep(@Args('stepId', { type: () => Int }) stepId: number) {
    return this.workflowStepsService.duplicateStep(stepId);
  }

  @Mutation(() => [WorkflowStep], { description: 'Sắp xếp lại thứ tự các workflow steps' })
  reorderWorkflowSteps(@Args('templateId', { type: () => Int }) templateId: number) {
    return this.workflowStepsService.reorderSteps(templateId);
  }
}
