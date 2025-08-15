import { Field, ObjectType } from "@nestjs/graphql";
import { IsArray } from "class-validator";
import { PageMetaDto } from "./page-meta.dto";

@ObjectType({ isAbstract: true })
export class PageDto<T> {
  @Field(() => [Object], { description: 'Array of data items' })
  @IsArray()
  readonly data: T[];

  @Field(() => PageMetaDto, { description: 'Pagination metadata' })
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}

// Import entity types
import { WorkflowTemplate } from "../../../modules/workflow/workflow-templates/entities/workflow-template.entity";
import { WorkflowInstance } from "../../../modules/workflow/workflow-instances/entities/workflow-instance.entity";  

// Create specific PageDto classes for each entity type
@ObjectType({ description: 'Paginated response for WorkflowTemplate' })
export class WorkflowTemplatePageDto {
  @Field(() => [WorkflowTemplate], { description: 'Array of workflow templates' })
  @IsArray()
  readonly data: WorkflowTemplate[];

  @Field(() => PageMetaDto, { description: 'Pagination metadata' })
  readonly meta: PageMetaDto;

  constructor(data: WorkflowTemplate[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}

@ObjectType({ description: 'Paginated response for WorkflowInstance' })
export class WorkflowInstancePageDto {
  @Field(() => [WorkflowInstance], { description: 'Array of workflow instances' })
  @IsArray()
  readonly data: WorkflowInstance[];

  @Field(() => PageMetaDto, { description: 'Pagination metadata' })
  readonly meta: PageMetaDto;

  constructor(data: WorkflowInstance[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
