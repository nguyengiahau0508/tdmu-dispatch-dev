
import { IUser } from "../../../../interfaces/user.interface"
import { IWorkflowTemplate } from "../../workflow-templates/interfaces/workflow-templates.interface"
import { IWorkflowStep } from "../../workflow-steps/interfaces/workflow-step.interfaces"
import { IWorkflowActionLog } from "../../workflow-action-logs/interfaces/workflow-action-log.interfaces"

export interface IWorkflowInstances {
  id: number
  templateId: number
  documentId: number
  currentStepId: number
  status: string
  createdByUserId: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  template: IWorkflowTemplate
  currentStep?: IWorkflowStep
  createdByUser: IUser
  logs: IWorkflowActionLog[]
}

export interface ICreateWorkflowInstanceInput {
  templateId: number
  documentId: number
  notes?: string
}

export interface IUpdateWorkflowInstanceInput {
  id: number
  templateId?: number
  documentId?: number
  currentStepId?: number
  status?: string
  notes?: string
}





