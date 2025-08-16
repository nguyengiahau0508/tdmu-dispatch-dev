import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { WorkflowInstance } from '../models/workflow-instance.model';
import { WorkflowActionInput } from '../models/workflow-action-input.model';


@Injectable({
  providedIn: 'root'
})
export class WorkflowInstancesService {
  private apiUrl = `${environment.apiBaseUrl}/graphql`;

  constructor(private http: HttpClient) {}

  // Lấy tất cả workflow instances
  getAllWorkflowInstances(): Observable<WorkflowInstance[]> {
    const query = `
      query {
        workflowInstances {
          id
          templateId
          template {
            id
            name
            description
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
          }
          status
          createdByUserId
          createdByUser {
            id
            fullName
            email
          }
          notes
          createdAt
          updatedAt
          logs {
            id
            actionType
            actionByUser {
              id
              fullName
            }
            actionAt
            note
            createdAt
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query });
  }

  // Lấy workflow instances của user hiện tại
  getMyWorkflowInstances(): Observable<WorkflowInstance[]> {
    const query = `
      query {
        myWorkflowInstances {
          id
          templateId
          template {
            id
            name
            description
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
          }
          status
          createdByUserId
          createdByUser {
            id
            fullName
            email
          }
          notes
          createdAt
          updatedAt
          logs {
            id
            actionType
            actionByUser {
              id
              fullName
            }
            actionAt
            note
            createdAt
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query });
  }

  // Lấy workflow instances đang chờ xử lý
  getMyPendingWorkflows(): Observable<WorkflowInstance[]> {
    const query = `
      query {
        myPendingWorkflows {
          id
          templateId
          template {
            id
            name
            description
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
          }
          status
          createdByUserId
          createdByUser {
            id
            fullName
            email
          }
          notes
          createdAt
          updatedAt
          logs {
            id
            actionType
            actionByUser {
              id
              fullName
            }
            actionAt
            note
            createdAt
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query });
  }

  // Lấy workflow instance theo ID
  getWorkflowInstance(id: number): Observable<WorkflowInstance> {
    const query = `
      query {
        workflowInstance(id: ${id}) {
          id
          templateId
          template {
            id
            name
            description
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
          }
          status
          createdByUserId
          createdByUser {
            id
            fullName
            email
          }
          notes
          createdAt
          updatedAt
          logs {
            id
            actionType
            actionByUser {
              id
              fullName
            }
            actionAt
            note
            createdAt
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query });
  }

  // Thực hiện action trên workflow
  executeWorkflowAction(actionInput: WorkflowActionInput): Observable<WorkflowInstance> {
    const mutation = `
      mutation {
        executeWorkflowAction(workflowActionInput: {
          instanceId: ${actionInput.instanceId}
          stepId: ${actionInput.stepId}
          actionType: ${actionInput.actionType}
          note: "${actionInput.note || ''}"
          metadata: "${actionInput.metadata || ''}"
        }) {
          id
          status
          currentStepId
          currentStep {
            id
            name
            description
            type
            assignedRole
          }
          logs {
            id
            actionType
            actionByUser {
              id
              fullName
            }
            actionAt
            note
            createdAt
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query: mutation });
  }

  // Lấy danh sách actions có thể thực hiện
  getAvailableActions(instanceId: number): Observable<string[]> {
    const query = `
      query {
        availableActions(instanceId: ${instanceId})
      }
    `;

    return this.http.post<any>(this.apiUrl, { query });
  }

  // Tạo workflow instance mới
  createWorkflowInstance(input: any): Observable<WorkflowInstance> {
    const mutation = `
      mutation {
        createWorkflowInstance(createWorkflowInstanceInput: {
          templateId: ${input.templateId}
          documentId: ${input.documentId || 0}
          notes: "${input.notes || ''}"
        }) {
          id
          templateId
          template {
            id
            name
            description
          }
          documentId
          currentStepId
          currentStep {
            id
            name
            description
            type
            assignedRole
          }
          status
          createdByUserId
          createdByUser {
            id
            fullName
            email
          }
          notes
          createdAt
          updatedAt
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query: mutation });
  }
}
