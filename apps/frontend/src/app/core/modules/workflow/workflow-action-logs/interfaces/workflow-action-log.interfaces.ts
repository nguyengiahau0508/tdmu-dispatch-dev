import { IUser } from "../../../../interfaces/user.interface"
import { IWorkflowInstance } from "../../workflow-instances/interfaces/workflow-instance.interfaces"
import { IWorkflowStep } from "../../workflow-steps/interfaces/workflow-step.interfaces"

export interface IWorkflowActionLog {
  id: number
  instanceId: number
  stepId: number
  actionType: string
  actionByUserId: number
  actionAt: Date
  note?: string
  metadata?: any
  createdAt: Date
  instance: IWorkflowInstance
  step: IWorkflowStep
  actionByUser: IUser
}

export interface ICreateWorkflowActionLogInput {
  instanceId: number
  stepId: number
  actionType: string
  note?: string
  metadata?: string
}

export interface IUpdateWorkflowActionLogInput {
  id: number
  instanceId?: number
  stepId?: number
  actionType?: string
  note?: string
  metadata?: string
}
