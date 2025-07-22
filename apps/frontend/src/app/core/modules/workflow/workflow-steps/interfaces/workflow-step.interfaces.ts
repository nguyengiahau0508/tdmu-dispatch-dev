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
  type: StepType
  assignedRole: string;
  orderNumber: number;
  nextStepId?: number;
  templateId: number
  template: IWorkflowTemplate;
}
