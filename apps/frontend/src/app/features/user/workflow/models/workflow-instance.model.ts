export interface WorkflowInstance {
  id: number;
  templateId: number;
  template: {
    id: number;
    name: string;
    description?: string;
  };
  documentId: number;
  currentStepId: number;
  currentStep?: {
    id: number;
    name: string;
    description?: string;
    type: string;
    assignedRole: string;
    orderNumber: number;
  };
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  createdByUserId: number;
  createdByUser: {
    id: number;
    fullName: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  logs: WorkflowActionLog[];
}

export interface WorkflowActionLog {
  id: number;
  actionType: string;
  actionByUser?: {
    id: number;
    fullName: string;
  };
  actionAt: string;
  note?: string;
  createdAt: string;
}
