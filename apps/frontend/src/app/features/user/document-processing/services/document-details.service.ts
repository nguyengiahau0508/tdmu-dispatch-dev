import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { WorkflowStepProgress } from '../components/workflow-progress.component';

export interface DocumentDetails {
  id: number;
  title: string;
  content?: string;
  documentNumber?: string;
  documentType: string;
  documentCategory: {
    id: number;
    name: string;
  };
  status: string;
  priority: string;
  deadline?: Date;
  assignedToUserId?: number;
  assignedToUser?: {
    id: number;
    fullName: string;
    email: string;
  };
  createdByUserId: number;
  createdByUser: {
    id: number;
    fullName: string;
    email: string;
  };
  file?: {
    id: number;
    driveFileId: string;
    originalName: string;
    mimeType: string;
    isPublic: boolean;
  };
  workflowInstanceId?: number;
  workflowInstance?: WorkflowInstanceDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowInstanceDetails {
  id: number;
  templateId: number;
  template: {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    steps: WorkflowStepDetail[];
  };
  documentId: number;
  currentStepId?: number;
  currentStep?: {
    id: number;
    name: string;
    description?: string;
    type: string;
    assignedRole: string;
    orderNumber: number;
    isActive: boolean;
  };
  currentAssigneeUserId?: number;
  currentAssigneeUser?: {
    id: number;
    fullName: string;
    email: string;
  };
  status: string;
  createdByUserId: number;
  createdByUser: {
    id: number;
    fullName: string;
    email: string;
  };
  notes?: string;
  logs: WorkflowActionLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStepDetail {
  id: number;
  name: string;
  description?: string;
  type: string;
  assignedRole: string;
  orderNumber: number;
  isActive: boolean;
  nextStepId?: number;
}

export interface WorkflowActionLog {
  id: number;
  instanceId: number;
  stepId: number;
  step: {
    id: number;
    name: string;
    type: string;
  };
  actionType: string;
  actionByUserId: number;
  actionByUser: {
    id: number;
    fullName: string;
    email: string;
  };
  actionAt: Date;
  note?: string;
  metadata?: string;
  createdAt: Date;
}

export interface DocumentDetailsResponse {
  metadata: {
    statusCode: number;
    message: string;
  };
  data: DocumentDetails;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentDetailsService {

  constructor(private apollo: Apollo) { }

  getDocumentDetails(documentId: number): Observable<DocumentDetails> {
    const query = gql`
      query GetDocumentDetails($id: Int!) {
        document(id: $id) {
          metadata {
            statusCode
            message
          }
          data {
            id
            title
            content
            documentNumber
            documentType
            documentCategory {
              id
              name
            }
            status
            priority
            deadline
            assignedToUserId
            assignedToUser {
              id
              fullName
              email
            }
            createdByUserId
            createdByUser {
              id
              fullName
              email
            }
            file {
              id
              driveFileId
              originalName
              mimeType
              isPublic
            }
            workflowInstanceId
            workflowInstance {
              id
              templateId
              template {
                id
                name
                description
                isActive
                steps {
                  id
                  name
                  description
                  type
                  assignedRole
                  orderNumber
                  isActive
                  nextStepId
                }
              }
              documentId
              currentStepId
              currentStep {
                id
                name
                description
                type
                assignedRole
                orderNumber
                isActive
              }
              currentAssigneeUserId
              currentAssigneeUser {
                id
                fullName
                email
              }
              status
              createdByUserId
              createdByUser {
                id
                fullName
                email
              }
              notes
              logs {
                id
                instanceId
                stepId
                step {
                  id
                  name
                  type
                }
                actionType
                actionByUserId
                actionByUser {
                  id
                  fullName
                  email
                }
                actionAt
                note
                metadata
                createdAt
              }
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
        }
      }
    `;

    return this.apollo.watchQuery<{ document: DocumentDetailsResponse }>({
      query,
      variables: { id: documentId },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data.document.data)
    );
  }

  getWorkflowInstanceDetails(workflowInstanceId: number): Observable<WorkflowInstanceDetails> {
    const query = gql`
      query GetWorkflowInstanceDetails($id: Int!) {
        workflowInstance(id: $id) {
          id
          templateId
          template {
            id
            name
            description
            isActive
            steps {
              id
              name
              description
              type
              assignedRole
              orderNumber
              isActive
              nextStepId
            }
          }
          documentId
          currentStepId
          currentStep {
            id
            name
            description
            type
            assignedRole
            orderNumber
            isActive
          }
          currentAssigneeUserId
          currentAssigneeUser {
            id
            fullName
            email
          }
          status
          createdByUserId
          createdByUser {
            id
            fullName
            email
          }
          notes
          logs {
            id
            instanceId
            stepId
            step {
              id
              name
              type
            }
            actionType
            actionByUserId
            actionByUser {
              id
              fullName
              email
            }
            actionAt
            note
            metadata
            createdAt
          }
          createdAt
          updatedAt
        }
      }
    `;

    return this.apollo.watchQuery<{ workflowInstance: WorkflowInstanceDetails }>({
      query,
      variables: { id: workflowInstanceId },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data.workflowInstance)
    );
  }

  createWorkflowProgressData(workflowInstance: WorkflowInstanceDetails): WorkflowStepProgress[] {
    console.log('🔧 createWorkflowProgressData called with:', workflowInstance);
    
    if (!workflowInstance.template?.steps) {
      console.log('❌ No template or steps found, returning empty array');
      return [];
    }

    const steps = [...workflowInstance.template.steps].sort((a, b) => a.orderNumber - b.orderNumber);
    const logs = workflowInstance.logs || [];
    const currentStepId = workflowInstance.currentStepId;
    
    console.log('📊 Processing workflow data:');
    console.log('  - Steps count:', steps.length);
    console.log('  - Logs count:', logs.length);
    console.log('  - Current step ID:', currentStepId);

    const result = steps.map(step => {
      // Tìm log cuối cùng cho step này
      const stepLogs = logs.filter(log => log.stepId === step.id);
      const lastLog = stepLogs.length > 0 ? stepLogs[stepLogs.length - 1] : null;

      // Xác định trạng thái của step
      let status: 'completed' | 'current' | 'pending' | 'skipped' = 'pending';
      let completedAt: Date | undefined;
      let completedBy: any = undefined;
      let notes: string | undefined;

      if (lastLog) {
        if (lastLog.actionType === 'COMPLETE' || lastLog.actionType === 'APPROVE') {
          status = 'completed';
          completedAt = lastLog.actionAt;
          completedBy = lastLog.actionByUser;
          notes = lastLog.note;
        } else if (lastLog.actionType === 'TRANSFER') {
          status = 'completed';
          completedAt = lastLog.actionAt;
          completedBy = lastLog.actionByUser;
          notes = lastLog.note;
        } else if (lastLog.actionType === 'REJECT') {
          status = 'skipped';
          notes = lastLog.note;
        }
      }

      // Nếu là step hiện tại
      if (step.id === currentStepId) {
        status = 'current';
      }

      return {
        id: step.id,
        name: step.name,
        description: step.description,
        type: step.type,
        assignedRole: step.assignedRole,
        orderNumber: step.orderNumber,
        isActive: step.isActive,
        status,
        completedAt,
        completedBy,
        notes
      };
    });
    
    console.log('✅ Created workflow progress steps:', result);
    return result;
  }
}
