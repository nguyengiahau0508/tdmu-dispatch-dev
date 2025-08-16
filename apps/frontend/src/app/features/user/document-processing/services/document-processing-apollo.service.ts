import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface DocumentProcessingInfo {
  documentId: number;
  documentTitle: string;
  documentType: string;
  documentCategory: string;
  status: string;
  createdAt: Date;
  workflowInstanceId?: number;
  currentStepId?: number;
  currentStepName?: string;
  workflowStatus?: string;
  requiresAction: boolean;
  actionType?: string;
  deadline?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface ProcessingStatistics {
  totalDocuments: number;
  pendingCount: number;
  completedCount: number;
  inProgressCount: number;
  completionRate: number;
}

export interface DocumentActionInput {
  documentId: number;
  actionType: 'APPROVE' | 'REJECT' | 'TRANSFER' | 'COMPLETE';
  notes?: string;
  transferToUserId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentProcessingApolloService {

  constructor(private apollo: Apollo) { }

  // Get documents for processing
  getDocumentsForProcessing(): Observable<DocumentProcessingInfo[]> {
    const query = gql`
      query {
        documentsForProcessing {
          documents {
            documentId
            documentTitle
            documentType
            documentCategory
            status
            createdAt
            workflowInstanceId
            currentStepId
            currentStepName
            workflowStatus
            requiresAction
            actionType
            deadline
            priority
          }
        }
      }
    `;

    return this.apollo.watchQuery<any>({ query }).valueChanges.pipe(
      map(result => result.data.documentsForProcessing.documents)
    );
  }

  // Get processed documents
  getProcessedDocuments(): Observable<DocumentProcessingInfo[]> {
    const query = gql`
      query {
        processedDocuments {
          documents {
            documentId
            documentTitle
            documentType
            documentCategory
            status
            createdAt
            workflowInstanceId
            currentStepId
            currentStepName
            workflowStatus
            requiresAction
            actionType
            deadline
            priority
          }
        }
      }
    `;

    return this.apollo.watchQuery<any>({ query }).valueChanges.pipe(
      map(result => result.data.processedDocuments.documents)
    );
  }

  // Get processing statistics
  getProcessingStatistics(): Observable<ProcessingStatistics> {
    const query = gql`
      query {
        processingStatistics {
          data {
            totalDocuments
            pendingCount
            completedCount
            inProgressCount
            completionRate
          }
        }
      }
    `;

    return this.apollo.watchQuery<any>({ query }).valueChanges.pipe(
      map(result => result.data.processingStatistics.data)
    );
  }

  // Get urgent documents
  getUrgentDocuments(): Observable<DocumentProcessingInfo[]> {
    const query = gql`
      query {
        urgentDocuments {
          documents {
            documentId
            documentTitle
            documentType
            documentCategory
            status
            createdAt
            workflowInstanceId
            currentStepId
            currentStepName
            workflowStatus
            requiresAction
            actionType
            deadline
            priority
          }
        }
      }
    `;

    return this.apollo.watchQuery<any>({ query }).valueChanges.pipe(
      map(result => result.data.urgentDocuments.documents)
    );
  }

  // Get documents by priority
  getDocumentsByPriority(priority: string): Observable<DocumentProcessingInfo[]> {
    const query = gql`
      query GetDocumentsByPriority($priority: String!) {
        documentsByPriority(priority: $priority) {
          documents {
            documentId
            documentTitle
            documentType
            documentCategory
            status
            createdAt
            workflowInstanceId
            currentStepId
            currentStepName
            workflowStatus
            requiresAction
            actionType
            deadline
            priority
          }
        }
      }
    `;

    return this.apollo.watchQuery<any>({ 
      query, 
      variables: { priority } 
    }).valueChanges.pipe(
      map(result => result.data.documentsByPriority.documents)
    );
  }

  // Process document action
  processDocumentAction(input: DocumentActionInput): Observable<any> {
    const mutation = gql`
      mutation ProcessDocumentAction($input: DocumentActionInput!) {
        processDocumentAction(input: $input) {
          metadata {
            statusCode
            message
          }
          data {
            documentId
            workflowInstanceId
            actionType
            message
            workflowStatus
          }
        }
      }
    `;

    return this.apollo.mutate<any>({
      mutation,
      variables: { input }
    }).pipe(
      map(result => result.data?.processDocumentAction)
    );
  }

  // Get pending document count for notification
  getPendingDocumentCount(): Observable<number> {
    return this.getDocumentsForProcessing().pipe(
      map(documents => documents.length)
    );
  }
}
