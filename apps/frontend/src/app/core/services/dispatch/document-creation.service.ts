import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { gql } from 'apollo-angular';

export interface CreateDocumentFromTaskInput {
  taskRequestId: number;
  title: string;
  content: string;
  category?: string;
  priority: string;
  notes?: string;
}

export interface DocumentCreationResult {
  documentId: number;
  workflowInstanceId: number;
  success: boolean;
  message: string;
}

const CREATE_DOCUMENT_FROM_TASK = gql`
  mutation CreateDocumentFromTask($input: CreateDocumentFromTaskInput!) {
    createDocumentFromTask(input: $input) {
      documentId
      workflowInstanceId
      success
      message
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class DocumentCreationService {
  constructor(private apollo: Apollo) {}

  createDocumentFromTask(input: CreateDocumentFromTaskInput): Observable<DocumentCreationResult> {
    return this.apollo.mutate<{
      createDocumentFromTask: DocumentCreationResult
    }>({
      mutation: CREATE_DOCUMENT_FROM_TASK,
      variables: { input }
    }).pipe(
      map(result => result.data!.createDocumentFromTask)
    );
  }
}
