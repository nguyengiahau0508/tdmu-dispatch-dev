import { IWorkflowTemplate } from "../../workflow-templates/interfaces/workflow-templates.interface";

export enum StepType {
  START = 'START',
  APPROVAL = 'APPROVAL',
  TRANSFER = 'TRANSFER',
  END = 'END',
}

export interface IWorkflowStep {
  id: number
  name: string
  description?: string
  type: string
  assignedRole: string
  orderNumber: number
  nextStepId?: number
  isActive: boolean
  templateId: number
  createdAt: Date
  updatedAt: Date
}

export interface ICreateWorkflowStepInput {
  name: string
  description?: string
  type: string
  assignedRole: string
  orderNumber: number
  nextStepId?: number
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
  nextStepId?: number
  isActive?: boolean
  templateId?: number
}
