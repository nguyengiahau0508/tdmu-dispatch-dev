import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { CreateWorkflowTemplateInput } from './dto/create-workflow-template/create-workflow-template.input';
import { UpdateWorkflowTemplateInput } from './dto/update-workflow-template/update-workflow-template.input';
import { GetWorkflowTemplatePaginatedInput } from './dto/get-workflow-template-paginated/get-workflow-template-paginated.input';
import { WorkflowTemplatePageDto } from 'src/common/shared/pagination/page.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';

@Resolver(() => WorkflowTemplate)
@UseGuards(GqlAuthGuard)
export class WorkflowTemplatesResolver {
  constructor(
    private readonly workflowTemplatesService: WorkflowTemplatesService,
  ) {}

  @Mutation(() => WorkflowTemplate, {
    description: 'Tạo workflow template mới',
  })
  createWorkflowTemplate(
    @Args('createWorkflowTemplateInput')
    createWorkflowTemplateInput: CreateWorkflowTemplateInput,
    @CurrentUser() user: User,
  ) {
    return this.workflowTemplatesService.create(
      createWorkflowTemplateInput,
      user,
    );
  }

  @Query(() => [WorkflowTemplate], {
    name: 'workflowTemplates',
    description: 'Lấy tất cả workflow templates',
  })
  findAll() {
    return this.workflowTemplatesService.findAll();
  }

  @Query(() => WorkflowTemplatePageDto, {
    name: 'workflowTemplatesPaginated',
    description: 'Lấy danh sách workflow templates có phân trang',
  })
  findPaginated(@Args('input') input: GetWorkflowTemplatePaginatedInput) {
    return this.workflowTemplatesService.findPaginated(input);
  }

  @Query(() => WorkflowTemplate, {
    name: 'workflowTemplate',
    description: 'Lấy workflow template theo ID',
  })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowTemplatesService.findOne(id);
  }

  @Query(() => [WorkflowTemplate], {
    name: 'activeWorkflowTemplates',
    description: 'Lấy danh sách workflow templates đang hoạt động',
  })
  findActiveTemplates() {
    return this.workflowTemplatesService.findActiveTemplates();
  }

  @Mutation(() => WorkflowTemplate, {
    description: 'Cập nhật workflow template',
  })
  updateWorkflowTemplate(
    @Args('updateWorkflowTemplateInput')
    updateWorkflowTemplateInput: UpdateWorkflowTemplateInput,
  ) {
    return this.workflowTemplatesService.update(
      updateWorkflowTemplateInput.id,
      updateWorkflowTemplateInput,
    );
  }

  @Mutation(() => Boolean, { description: 'Xóa workflow template' })
  removeWorkflowTemplate(@Args('id', { type: () => Int }) id: number) {
    return this.workflowTemplatesService.remove(id);
  }
}
