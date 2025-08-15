
import { IWorkflowTemplate } from '../../workflow-templates/interfaces/workflow-templates.interface';
import { IWorkflowStep } from '../../workflow-steps/interfaces/workflow-step.interfaces';
import { IWorkflowActionLog } from '../../workflow-action-logs/interfaces/workflow-action-log.interfaces';
import { IUser } from '../../../../interfaces/user.interface';

export enum WorkflowStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export interface IWorkflowInstance {
  id: number;
  templateId: number;
  template: IWorkflowTemplate;
  documentId: number;
  currentStepId: number;
  currentStep?: IWorkflowStep;
  status: WorkflowStatus;
  createdByUserId: number;
  createdByUser: IUser;
  notes?: string;
  logs: IWorkflowActionLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateWorkflowInstanceInput {
  templateId: number;
  documentId: number;
  notes?: string;
}

export interface IUpdateWorkflowInstanceInput {
  id: number;
  notes?: string;
}

export interface IWorkflowActionInput {
  instanceId: number;
  stepId: number;
  actionType: string;
  note?: string;
  metadata?: string;
}





