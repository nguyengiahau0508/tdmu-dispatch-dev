import { IWorkflowTemplate } from '../../workflow-templates/interfaces/workflow-templates.interface';
import { IWorkflowActionLog } from '../../workflow-action-logs/interfaces/workflow-action-log.interfaces';

export interface IWorkflowStep {
  id: number
  name: string
  description?: string
  type: string
  assignedRole: string
  orderNumber: number
  isActive: boolean
  templateId: number
  createdAt: Date
  updatedAt: Date
  template?: IWorkflowTemplate
  actionLogs?: IWorkflowActionLog[]
}

export interface ICreateWorkflowStepInput {
  name: string
  description?: string
  type: string
  assignedRole: string
  orderNumber?: number
  isActive?: boolean
  templateId: number
}

export interface IUpdateWorkflowStepInput {
  id: number
  name?: string
  description?: string
  type?: string
  assignedRole?: string
  orderNumber?: number
  isActive?: boolean
}

export interface IGetWorkflowStepPaginatedInput {
  page?: number
  take?: number
  search?: string
  templateId?: number
  type?: string
  order?: 'ASC' | 'DESC'
}

export interface IPaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    take: number
    itemCount: number
    pageCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export interface IStepType {
  value: string
  label: string
}
