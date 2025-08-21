import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface Document {
  id: number;
  title: string;
  content?: string;
  documentType: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  documentCategoryId: number;
  documentCategory?: {
    id: number;
    name: string;
  };
  fileId?: number;
  file?: {
    id: number;
    driveFileId: string;
    isPublic: boolean;
  };
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentInput {
  title: string;
  content?: string;
  documentType: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  documentCategoryId: number;
  fileId?: number;
  status?: string;
  workflowTemplateId?: number;
}

export interface UpdateDocumentInput {
  id: number;
  title?: string;
  content?: string;
  documentType?: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  documentCategoryId?: number;
  fileId?: number;
  status?: string;
}

export interface GetDocumentsPaginatedInput {
  search?: string;
  documentType?: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  page?: number;
  take?: number;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  metadata: {
    statusCode: number;
    message: string;
  };
  data: T;
}

const GET_DOCUMENTS_PAGINATED = gql`
  query GetDocumentsPaginated($input: GetDocumentsPaginatedInput!) {
    documents(input: $input) {
      metadata {
        statusCode
        message
      }
      data {
        id
        title
        content
        documentType
        documentCategoryId
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          isPublic
        }
        status
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

const GET_DOCUMENTS = gql`
  query GetDocuments {
    documents {
      metadata {
        statusCode
        message
      }
      data {
        id
        title
        content
        documentType
        documentCategoryId
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_DOCUMENT = gql`
  query GetDocument($id: Int!) {
    document(id: $id) {
      metadata {
        statusCode
        message
      }
      data {
        id
        title
        content
        documentType
        documentCategoryId
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
`;

const CREATE_DOCUMENT = gql`
  mutation CreateDocument($createDocumentInput: CreateDocumentInput!, $file: Upload) {
    createDocument(createDocumentInput: $createDocumentInput, file: $file) {
      metadata {
        statusCode
        message
      }
      data {
        id
        title
        content
        documentType
        documentCategoryId
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($updateDocumentInput: UpdateDocumentInput!) {
    updateDocument(updateDocumentInput: $updateDocumentInput) {
      metadata {
        statusCode
        message
      }
      data {
        id
        title
        content
        documentType
        documentCategoryId
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
`;

const REMOVE_DOCUMENT = gql`
  mutation RemoveDocument($id: Int!) {
    removeDocument(id: $id) {
      metadata {
        statusCode
        message
      }
      data {
        success
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  constructor(private apollo: Apollo) {}

  getDocumentsPaginated(input: GetDocumentsPaginatedInput): Observable<PaginatedResponse<Document>> {
    return this.apollo.watchQuery<{
      documents: {
        metadata: { statusCode: number; message: string };
        data: Document[];
        totalCount: number;
        hasNextPage: boolean;
      }
    }>({
      query: GET_DOCUMENTS_PAGINATED,
      variables: { input }
    }).valueChanges.pipe(
      map(result => {
        console.log('Service response:', result.data);
        return {
          data: result.data.documents.data,
          totalCount: result.data.documents.totalCount,
          hasNextPage: result.data.documents.hasNextPage
        };
      })
    );
  }

  getDocument(id: number): Observable<Document> {
    return this.apollo.watchQuery<{
      document: ApiResponse<Document>
    }>({
      query: GET_DOCUMENT,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.document.data)
    );
  }

  getDocuments(): Observable<{ data: Document[] }> {
    return this.apollo.watchQuery<{
      documents: ApiResponse<Document[]>
    }>({
      query: GET_DOCUMENTS,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => ({
        data: result.data.documents.data || []
      }))
    );
  }

  createDocument(input: CreateDocumentInput, file?: File): Observable<Document> {
    return this.apollo.mutate<{
      createDocument: ApiResponse<Document>
    }>({
      mutation: CREATE_DOCUMENT,
      variables: { 
        createDocumentInput: input,
        file: file
      },
      refetchQueries: [
        {
          query: GET_DOCUMENTS_PAGINATED,
          variables: { input: { page: 1, take: 10, order: 'DESC' } }
        }
      ]
    }).pipe(
      map(result => result.data!.createDocument.data)
    );
  }

  updateDocument(input: UpdateDocumentInput): Observable<Document> {
    console.log('=== DocumentsService.updateDocument ===');
    console.log('Update input:', input);
    
    return this.apollo.mutate<{
      updateDocument: ApiResponse<Document>
    }>({
      mutation: UPDATE_DOCUMENT,
      variables: { updateDocumentInput: input },
      refetchQueries: [
        {
          query: GET_DOCUMENTS,
          variables: {}
        },
        {
          query: GET_DOCUMENTS_PAGINATED,
          variables: { input: { page: 1, take: 10, order: 'DESC' } }
        }
      ]
    }).pipe(
      map(result => {
        console.log('Update mutation result:', result);
        return result.data!.updateDocument.data;
      })
    );
  }

  removeDocument(id: number): Observable<boolean> {
    return this.apollo.mutate<{
      removeDocument: ApiResponse<{ success: boolean }>
    }>({
      mutation: REMOVE_DOCUMENT,
      variables: { id },
      refetchQueries: [
        {
          query: GET_DOCUMENTS_PAGINATED,
          variables: { input: { page: 1, take: 10, order: 'DESC' } }
        }
      ]
    }).pipe(
      map(result => result.data!.removeDocument.data.success)
    );
  }

  deleteDocument(id: number): Observable<boolean> {
    return this.removeDocument(id);
  }

  // Helper methods for specific document types
  getIncomingDocuments(page: number = 1, take: number = 10, search?: string): Observable<PaginatedResponse<Document>> {
    return this.getDocumentsPaginated({
      search,
      documentType: 'INCOMING',
      page,
      take,
      order: 'DESC'
    });
  }

  getOutgoingDocuments(page: number = 1, take: number = 10, search?: string): Observable<PaginatedResponse<Document>> {
    return this.getDocumentsPaginated({
      search,
      documentType: 'OUTGOING',
      page,
      take,
      order: 'DESC'
    });
  }
}
