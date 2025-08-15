import { Injectable, inject } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { WORKFLOW_TEMPLATE_QUERY_FIND_PAGINATED, WORKFLOW_TEMPLATE_QUERY_FIND_ALL, WORKFLOW_TEMPLATE_QUERY_FIND_ONE, WORKFLOW_TEMPLATE_QUERY_ACTIVE_TEMPLATES } from './graphqls/workflow-templates.queries';
import { WORKFLOW_TEMPLATE_MUTATION_CREATE, WORKFLOW_TEMPLATE_MUTATION_UPDATE, WORKFLOW_TEMPLATE_MUTATION_REMOVE } from './graphqls/workflow-templates.mutations';
import { IWorkflowTemplate, ICreateWorkflowTemplateInput, IUpdateWorkflowTemplateInput, IGetWorkflowTemplatePaginatedInput, IPaginatedResponse } from './interfaces/workflow-templates.interface';

@Injectable({ providedIn: 'root' })
export class WorkflowTemplatesService {
  private apollo = inject(Apollo)
  private findPaginatedQueryRef!: QueryRef<{
    workflowTemplatesPaginated: IPaginatedResponse<IWorkflowTemplate>
  }, {
    input: IGetWorkflowTemplatePaginatedInput
  }>

  initFindPagianted(input: IGetWorkflowTemplatePaginatedInput): Observable<IPaginatedResponse<IWorkflowTemplate>> {
    this.findPaginatedQueryRef = this.apollo.watchQuery<{
      workflowTemplatesPaginated: IPaginatedResponse<IWorkflowTemplate>
    }, {
      input: IGetWorkflowTemplatePaginatedInput
    }>({
      query: WORKFLOW_TEMPLATE_QUERY_FIND_PAGINATED,
      variables: { input },
      fetchPolicy: 'network-only'
    })
    return this.findPaginatedQueryRef.valueChanges.pipe(
      map(result => result.data.workflowTemplatesPaginated)
    )
  }

  refetchFindPagianted(input: IGetWorkflowTemplatePaginatedInput) {
    if (!this.findPaginatedQueryRef) {
      return this.initFindPagianted(input).toPromise()
    }
    return this.findPaginatedQueryRef.refetch({ input })
  }

  findAll(): Observable<IWorkflowTemplate[]> {
    return this.apollo.query<{ workflowTemplates: IWorkflowTemplate[] }>({
      query: WORKFLOW_TEMPLATE_QUERY_FIND_ALL,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.workflowTemplates)
    )
  }

  findOne(id: number): Observable<IWorkflowTemplate> {
    return this.apollo.query<{ workflowTemplate: IWorkflowTemplate }>({
      query: WORKFLOW_TEMPLATE_QUERY_FIND_ONE,
      variables: { id },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.workflowTemplate)
    )
  }

  findActiveTemplates(): Observable<IWorkflowTemplate[]> {
    return this.apollo.query<{ activeWorkflowTemplates: IWorkflowTemplate[] }>({
      query: WORKFLOW_TEMPLATE_QUERY_ACTIVE_TEMPLATES,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.activeWorkflowTemplates)
    )
  }

  create(input: ICreateWorkflowTemplateInput): Observable<IWorkflowTemplate> {
    return this.apollo.mutate<{ createWorkflowTemplate: IWorkflowTemplate }>({
      mutation: WORKFLOW_TEMPLATE_MUTATION_CREATE,
      variables: { createWorkflowTemplateInput: input }
    }).pipe(
      map(result => result.data!.createWorkflowTemplate)
    )
  }

  update(input: IUpdateWorkflowTemplateInput): Observable<IWorkflowTemplate> {
    return this.apollo.mutate<{ updateWorkflowTemplate: IWorkflowTemplate }>({
      mutation: WORKFLOW_TEMPLATE_MUTATION_UPDATE,
      variables: { updateWorkflowTemplateInput: input }
    }).pipe(
      map(result => result.data!.updateWorkflowTemplate)
    )
  }

  remove(id: number): Observable<boolean> {
    return this.apollo.mutate<{ removeWorkflowTemplate: boolean }>({
      mutation: WORKFLOW_TEMPLATE_MUTATION_REMOVE,
      variables: { id }
    }).pipe(
      map(result => result.data!.removeWorkflowTemplate)
    )
  }
}
