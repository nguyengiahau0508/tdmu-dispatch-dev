import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class WorkflowStepInfo {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => Int)
  order: number;

  @Field(() => String)
  status: string; // 'pending', 'in_progress', 'completed', 'skipped'

  @Field(() => String, { nullable: true })
  assignedTo?: string;

  @Field(() => Date, { nullable: true })
  startedAt?: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => [String], { nullable: true })
  requiredActions?: string[];
}

@ObjectType()
export class DocumentWorkflowInfo {
  @Field(() => Int)
  documentId: number;

  @Field(() => String)
  documentTitle: string;

  @Field(() => String)
  documentType: string;

  @Field(() => String)
  currentStatus: string;

  @Field(() => Int)
  workflowTemplateId: number;

  @Field(() => String)
  workflowTemplateName: string;

  @Field(() => String)
  workflowTemplateDescription: string;

  @Field(() => [WorkflowStepInfo])
  steps: WorkflowStepInfo[];

  @Field(() => Int)
  currentStepIndex: number;

  @Field(() => Int)
  totalSteps: number;

  @Field(() => Int)
  completedSteps: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  estimatedCompletion?: Date;

  @Field(() => String, { nullable: true })
  processingGuide?: string;
}

@ObjectType()
export class GetDocumentWorkflowResponse {
  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => DocumentWorkflowInfo)
  data: DocumentWorkflowInfo;
}
