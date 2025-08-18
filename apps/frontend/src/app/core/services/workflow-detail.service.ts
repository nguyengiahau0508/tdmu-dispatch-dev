import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { IApiResponse } from '../../shared/models/api-response.model';

// GraphQL Query
const GET_DOCUMENT_WORKFLOW_QUERY = gql`
  query GetDocumentWorkflow($input: GetDocumentWorkflowInput!) {
    getDocumentWorkflow(input: $input) {
      metadata {
        statusCode
        message
      }
      data {
        documentId
        documentTitle
        documentType
        currentStatus
        workflowTemplateId
        workflowTemplateName
        workflowTemplateDescription
        steps {
          id
          name
          description
          order
          status
          assignedTo
          startedAt
          completedAt
          notes
          requiredActions
        }
        currentStepIndex
        totalSteps
        completedSteps
        createdAt
        estimatedCompletion
        processingGuide
      }
    }
  }
`;

// Interfaces
export interface IWorkflowStepInfo {
  id: number;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: string;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  requiredActions?: string[];
}

export interface IDocumentWorkflowInfo {
  documentId: number;
  documentTitle: string;
  documentType: string;
  currentStatus: string;
  workflowTemplateId: number;
  workflowTemplateName: string;
  workflowTemplateDescription: string;
  steps: IWorkflowStepInfo[];
  currentStepIndex: number;
  totalSteps: number;
  completedSteps: number;
  createdAt: Date;
  estimatedCompletion?: Date;
  processingGuide?: string;
}

export interface IGetDocumentWorkflowInput {
  documentId: number;
}

@Injectable({ providedIn: 'root' })
export class WorkflowDetailService {
  private apollo = inject(Apollo);

  /**
   * Lấy thông tin chi tiết quy trình của tài liệu
   */
  getDocumentWorkflow(input: IGetDocumentWorkflowInput): Observable<IApiResponse<IDocumentWorkflowInfo>> {
    return this.apollo.query<{
      getDocumentWorkflow: IApiResponse<IDocumentWorkflowInfo>;
    }>({
      query: GET_DOCUMENT_WORKFLOW_QUERY,
      variables: { input },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.getDocumentWorkflow)
    );
  }

  /**
   * Tính toán tiến độ hoàn thành
   */
  calculateProgress(completedSteps: number, totalSteps: number): number {
    if (totalSteps === 0) return 0;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  /**
   * Lấy trạng thái hiển thị cho bước
   */
  getStepStatusDisplay(status: string): { text: string; color: string; icon: string } {
    switch (status) {
      case 'completed':
        return { text: 'Hoàn thành', color: '#10b981', icon: '/icons/check_circle.svg' };
      case 'in_progress':
        return { text: 'Đang xử lý', color: '#3b82f6', icon: '/icons/schedule.svg' };
      case 'skipped':
        return { text: 'Bỏ qua', color: '#6b7280', icon: '/icons/skip_next.svg' };
      case 'pending':
      default:
        return { text: 'Chờ xử lý', color: '#9ca3af', icon: '/icons/pending.svg' };
    }
  }

  /**
   * Lấy bước hiện tại
   */
  getCurrentStep(steps: IWorkflowStepInfo[], currentStepIndex: number): IWorkflowStepInfo | null {
    return steps[currentStepIndex] || null;
  }

  /**
   * Lấy các bước tiếp theo
   */
  getNextSteps(steps: IWorkflowStepInfo[], currentStepIndex: number, limit: number = 3): IWorkflowStepInfo[] {
    return steps.slice(currentStepIndex + 1, currentStepIndex + 1 + limit);
  }

  /**
   * Lấy các bước đã hoàn thành
   */
  getCompletedSteps(steps: IWorkflowStepInfo[]): IWorkflowStepInfo[] {
    return steps.filter(step => step.status === 'completed');
  }

  /**
   * Lấy thời gian xử lý của bước
   */
  getStepDuration(startedAt?: Date, completedAt?: Date): string {
    if (!startedAt) return '';
    if (!completedAt) return 'Đang xử lý...';

    const duration = completedAt.getTime() - startedAt.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
