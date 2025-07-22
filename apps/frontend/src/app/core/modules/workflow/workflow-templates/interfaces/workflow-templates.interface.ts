import { IUser } from "../../../../interfaces/user.interface"
import { IWorkflowInstances } from "../../workflow-instances/interfaces/workflow-instance.interfaces"
import { IWorkflowStep } from "../../workflow-steps/interfaces/workflow-step.interfaces"


export interface IWorkflowTemplate {
  id: number
  name: string
  description?: string
  createdByUserId: number
  createdByUser: IUser
  createAt: Date
  steps: IWorkflowStep[]
  instances: IWorkflowInstances[]
}

