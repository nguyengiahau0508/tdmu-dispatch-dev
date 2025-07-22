import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { CreateWorkflowTemplateInput } from './dto/create-workflow-template//create-workflow-template.input';
import { UpdateWorkflowTemplateInput } from './dto/update-workflow-template//update-workflow-template.input';
import { GetWorkflowTemplateReponse } from './dto/get-workflow-template/get-workflow-template.response';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';

@Resolver(() => WorkflowTemplate)
export class WorkflowTemplatesResolver {
  constructor(private readonly workflowTemplatesService: WorkflowTemplatesService) { }

  @Mutation(() => GetWorkflowTemplateReponse)
  async createWorkflowTemplate(@Args('createWorkflowTemplateInput') createWorkflowTemplateInput: CreateWorkflowTemplateInput): Promise<GetWorkflowTemplateReponse> {
    const created = await this.workflowTemplatesService.create(createWorkflowTemplateInput);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, ""),
      data: { workflowTemplate: created }
    }
  }

  @Query(() => [WorkflowTemplate], { name: 'workflowTemplates' })
  findAll() {
    return this.workflowTemplatesService.findAll();
  }

  @Query(() => WorkflowTemplate, { name: 'workflowTemplate' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowTemplatesService.findOne(id);
  }

  @Mutation(() => WorkflowTemplate)
  updateWorkflowTemplate(@Args('updateWorkflowTemplateInput') updateWorkflowTemplateInput: UpdateWorkflowTemplateInput) {
    return this.workflowTemplatesService.update(updateWorkflowTemplateInput.id, updateWorkflowTemplateInput);
  }

  @Mutation(() => WorkflowTemplate)
  removeWorkflowTemplate(@Args('id', { type: () => Int }) id: number) {
    return this.workflowTemplatesService.remove(id);
  }
}
