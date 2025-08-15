  
import { IWorkflowStep } from '../../workflow-steps/interfaces/workflow-step.interfaces';

import { IUser } from '../../../../interfaces/user.interface';
import { IWorkflowInstance } from '../../workflow-instances/interfaces/workflow-instance.interfaces';

export interface IWorkflowTemplate {
  id: number
  name: string
  description?: string
  isActive: boolean
  createdByUserId: number
  createdByUser: IUser
  createdAt: Date
  updatedAt: Date
  steps: IWorkflowStep[]
  instances: IWorkflowInstance[]
}

export interface ICreateWorkflowTemplateInput {
  name: string
  description?: string
  isActive?: boolean
}

export interface IUpdateWorkflowTemplateInput {
  id: number
  name?: string
  description?: string
  isActive?: boolean
}

export interface IGetWorkflowTemplatePaginatedInput {
  page?: number
  take?: number
  search?: string
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

