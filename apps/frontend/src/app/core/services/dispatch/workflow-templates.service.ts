import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { gql } from 'apollo-angular';

export interface WorkflowTemplate {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  metadata: {
    statusCode: number;
    message: string;
  };
  data: T;
}

const GET_WORKFLOW_TEMPLATES = gql`
  query GetWorkflowTemplates {
    workflowTemplates {
      id
      name
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

const GET_ACTIVE_WORKFLOW_TEMPLATES = gql`
  query GetActiveWorkflowTemplates {
    activeWorkflowTemplates {
      id
      name
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class WorkflowTemplatesService {

  constructor(private apollo: Apollo) {}

  getWorkflowTemplates(): Observable<WorkflowTemplate[]> {
    return this.apollo.query<{ workflowTemplates: WorkflowTemplate[] }>({
      query: GET_WORKFLOW_TEMPLATES
    }).pipe(
      map(result => result.data.workflowTemplates)
    );
  }

  getActiveWorkflowTemplates(): Observable<WorkflowTemplate[]> {
    return this.apollo.query<{ activeWorkflowTemplates: WorkflowTemplate[] }>({
      query: GET_ACTIVE_WORKFLOW_TEMPLATES
    }).pipe(
      map(result => result.data.activeWorkflowTemplates)
    );
  }
}
