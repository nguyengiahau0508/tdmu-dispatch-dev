import { Injectable, inject } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { WORKFLOW_STEP_QUERY_FIND_PAGINATED, WORKFLOW_STEP_QUERY_FIND_ALL, WORKFLOW_STEP_QUERY_FIND_ONE, WORKFLOW_STEP_QUERY_BY_TEMPLATE, WORKFLOW_STEP_QUERY_TYPES, WORKFLOW_STEP_QUERY_ROLES } from './graphqls/workflow-steps.queries';
import { WORKFLOW_STEP_MUTATION_CREATE, WORKFLOW_STEP_MUTATION_UPDATE, WORKFLOW_STEP_MUTATION_REMOVE, WORKFLOW_STEP_MUTATION_MOVE, WORKFLOW_STEP_MUTATION_DUPLICATE, WORKFLOW_STEP_MUTATION_REORDER } from './graphqls/workflow-steps.mutations';
import { IWorkflowStep, ICreateWorkflowStepInput, IUpdateWorkflowStepInput, IGetWorkflowStepPaginatedInput, IPaginatedResponse } from './interfaces/workflow-step.interfaces';

@Injectable({ providedIn: 'root' })
export class WorkflowStepsService {
  private apollo = inject(Apollo)
  private findPaginatedQueryRef!: QueryRef<{
    workflowStepsPaginated: IPaginatedResponse<IWorkflowStep>
  }, {
    input: IGetWorkflowStepPaginatedInput
  }>

  initFindPagianted(input: IGetWorkflowStepPaginatedInput): Observable<IPaginatedResponse<IWorkflowStep>> {
    this.findPaginatedQueryRef = this.apollo.watchQuery<{
      workflowStepsPaginated: IPaginatedResponse<IWorkflowStep>
    }, {
      input: IGetWorkflowStepPaginatedInput
    }>({
      query: WORKFLOW_STEP_QUERY_FIND_PAGINATED,
      variables: { input },
      fetchPolicy: 'network-only'
    })
    return this.findPaginatedQueryRef.valueChanges.pipe(
      map(result => result.data.workflowStepsPaginated)
    )
  }

  refetchFindPagianted(input: IGetWorkflowStepPaginatedInput) {
    if (!this.findPaginatedQueryRef) {
      return this.initFindPagianted(input).toPromise()
    }
    return this.findPaginatedQueryRef.refetch({ input })
  }

  findAll(): Observable<IWorkflowStep[]> {
    return this.apollo.query<{ workflowSteps: IWorkflowStep[] }>({
      query: WORKFLOW_STEP_QUERY_FIND_ALL,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.workflowSteps)
    )
  }

  findOne(id: number): Observable<IWorkflowStep> {
    return this.apollo.query<{ workflowStep: IWorkflowStep }>({
      query: WORKFLOW_STEP_QUERY_FIND_ONE,
      variables: { id },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.workflowStep)
    )
  }

  findByTemplateId(templateId: number): Observable<IWorkflowStep[]> {
    return this.apollo.query<{ workflowStepsByTemplate: IWorkflowStep[] }>({
      query: WORKFLOW_STEP_QUERY_BY_TEMPLATE,
      variables: { templateId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.workflowStepsByTemplate)
    )
  }

  getStepTypes(): Observable<{ value: string; label: string }[]> {
    return this.apollo.query<{ workflowStepTypes: { value: string; label: string }[] }>({
      query: WORKFLOW_STEP_QUERY_TYPES,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.workflowStepTypes)
    )
  }

  getRoles(): Observable<{ value: string; label: string }[]> {
    return this.apollo.query<{ workflowRoles: { value: string; label: string }[] }>({
      query: WORKFLOW_STEP_QUERY_ROLES,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.workflowRoles)
    )
  }

  create(input: ICreateWorkflowStepInput): Observable<IWorkflowStep> {
    return this.apollo.mutate<{ createWorkflowStep: IWorkflowStep }>({
      mutation: WORKFLOW_STEP_MUTATION_CREATE,
      variables: { createWorkflowStepInput: input }
    }).pipe(
      map(result => result.data!.createWorkflowStep)
    )
  }

  update(input: IUpdateWorkflowStepInput): Observable<IWorkflowStep> {
    return this.apollo.mutate<{ updateWorkflowStep: IWorkflowStep }>({
      mutation: WORKFLOW_STEP_MUTATION_UPDATE,
      variables: { updateWorkflowStepInput: input }
    }).pipe(
      map(result => result.data!.updateWorkflowStep)
    )
  }

  remove(id: number): Observable<boolean> {
    return this.apollo.mutate<{ removeWorkflowStep: boolean }>({
      mutation: WORKFLOW_STEP_MUTATION_REMOVE,
      variables: { id }
    }).pipe(
      map(result => result.data!.removeWorkflowStep)
    )
  }

  moveStep(stepId: number, newOrder: number): Observable<IWorkflowStep[]> {
    return this.apollo.mutate<{ moveWorkflowStep: IWorkflowStep[] }>({
      mutation: WORKFLOW_STEP_MUTATION_MOVE,
      variables: { stepId, newOrder }
    }).pipe(
      map(result => result.data!.moveWorkflowStep)
    )
  }

  duplicateStep(stepId: number): Observable<IWorkflowStep> {
    return this.apollo.mutate<{ duplicateWorkflowStep: IWorkflowStep }>({
      mutation: WORKFLOW_STEP_MUTATION_DUPLICATE,
      variables: { stepId }
    }).pipe(
      map(result => result.data!.duplicateWorkflowStep)
    )
  }

  reorderSteps(templateId: number): Observable<IWorkflowStep[]> {
    return this.apollo.mutate<{ reorderWorkflowSteps: IWorkflowStep[] }>({
      mutation: WORKFLOW_STEP_MUTATION_REORDER,
      variables: { templateId }
    }).pipe(
      map(result => result.data!.reorderWorkflowSteps)
    )
  }
}
