
import { IWorkflowActionLog } from "../../workflow-action-logs/interfaces/workflow-action-log.interfaces"
import { IWorkflowStep } from "../../workflow-steps/interfaces/workflow-step.interfaces"
import { IWorkflowTemplate } from "../../workflow-templates/interfaces/workflow-templates.interface"

export enum WorkflowStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IWorkflowInstances {
  id: number
  templateId: number
  template: IWorkflowTemplate
  documentId: number
  currentStepId: number
  currentStep?: IWorkflowStep
  status: WorkflowStatus
  logs: IWorkflowActionLog[]
}





