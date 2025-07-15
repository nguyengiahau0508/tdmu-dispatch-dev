import { inject, Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IDocumentCategory } from '../../interfaces/dispatch.interface';
import { IApiResponse, IPaginatedResponse } from '../../../shared/models/api-response.model';
import {
  GET_DOCUMENT_CATEGORIES_QUERY,
  GET_ALL_DOCUMENT_CATEGORIES_QUERY,
  CREATE_DOCUMENT_CATEGORY_MUTATION,
  UPDATE_DOCUMENT_CATEGORY_MUTATION,
  REMOVE_DOCUMENT_CATEGORY_MUTATION
} from '../../../features/document-catalog/document-category/graphql/document-category.gql';

@Injectable({ providedIn: 'root' })
export class DocumentCategoryService {
  private apollo = inject(Apollo);
  private queryRef!: QueryRef<{
    documentCategories: IPaginatedResponse<IDocumentCategory>;
  }, { input: any }>;

  initDocumentCategoriesQuery(input: any): Observable<IPaginatedResponse<IDocumentCategory>> {
    this.queryRef = this.apollo.watchQuery<{
      documentCategories: IPaginatedResponse<IDocumentCategory>;
    }, { input: any }>({
      query: GET_DOCUMENT_CATEGORIES_QUERY,
      variables: { input },
      fetchPolicy: 'network-only'
    });
    return this.queryRef.valueChanges.pipe(
      map(result => result.data.documentCategories)
    );
  }

  getAllDocumentCategories(): Observable<IApiResponse<IDocumentCategory[]>> {
    return this.apollo.query<{
      allDocumentCategories: IApiResponse<IDocumentCategory[]>
    }>({
      query: GET_ALL_DOCUMENT_CATEGORIES_QUERY
    }).pipe(
      map(response => response.data.allDocumentCategories)
    );
  }

  createDocumentCategory(input: any): Observable<IApiResponse<{ documentCategory: IDocumentCategory }>> {
    return this.apollo.mutate<{ createDocumentCategory: IApiResponse<{ documentCategory: IDocumentCategory }> }>({
      mutation: CREATE_DOCUMENT_CATEGORY_MUTATION,
      variables: { createDocumentCategoryInput: input }
    }).pipe(
      map(result => result.data!.createDocumentCategory)
    );
  }

  updateDocumentCategory(input: any): Observable<IApiResponse<{ documentCategory: IDocumentCategory }>> {
    return this.apollo.mutate<{ updateDocumentCategory: IApiResponse<{ documentCategory: IDocumentCategory }> }>({
      mutation: UPDATE_DOCUMENT_CATEGORY_MUTATION,
      variables: { updateDocumentCategoryInput: input }
    }).pipe(
      map(result => result.data!.updateDocumentCategory)
    );
  }

  removeDocumentCategory(id: number): Observable<IApiResponse<{ success: boolean }>> {
    return this.apollo.mutate<{ removeDocumentCategory: IApiResponse<{ success: boolean }> }>({
      mutation: REMOVE_DOCUMENT_CATEGORY_MUTATION,
      variables: { id }
    }).pipe(
      map(result => result.data!.removeDocumentCategory)
    );
  }
} 