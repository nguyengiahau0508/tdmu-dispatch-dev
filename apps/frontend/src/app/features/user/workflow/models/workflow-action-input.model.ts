export interface WorkflowActionInput {
  instanceId: number;
  stepId: number;
  actionType: 'APPROVE' | 'REJECT' | 'TRANSFER' | 'CANCEL' | 'START' | 'COMPLETE';
  note?: string;
  metadata?: string;
}
