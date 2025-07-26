import { inject, Injectable } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import { IApiResponse, IPaginatedResponse } from "../../../../shared/models/api-response.model";
import { IWorkflowTemplate } from "./interfaces/workflow-templates.interface";
import { IGetWorkflowTemplatePaginatedInput } from "./interfaces/get-workflow-template-paginated.interfaces";
import { map, Observable } from "rxjs";
import { WORKFLOW_TEMPLATE_QUERY_FIND_PAGINATED } from "./graphqls/workflow-templates.queries";
import { IGetUnitsPaginatedInput } from "../../../../features/admin/organizational/units/interfaces/get-units-paginated.interface";

@Injectable({ providedIn: 'root' })
export class WorkflowTemplatesService {
  private apollo = inject(Apollo)

  private findPaginatedQueryRef!: QueryRef<{
    findPaginated: IPaginatedResponse<IWorkflowTemplate>
  }, {
    input: IGetWorkflowTemplatePaginatedInput
  }>

  initFindPagianted(input: IGetWorkflowTemplatePaginatedInput): Observable<IPaginatedResponse<IWorkflowTemplate>> {
    this.findPaginatedQueryRef = this.apollo.watchQuery<{
      findPaginated: IPaginatedResponse<IWorkflowTemplate>
    }, {
      input: IGetWorkflowTemplatePaginatedInput
    }>({
      query: WORKFLOW_TEMPLATE_QUERY_FIND_PAGINATED,
      variables: { input },
      fetchPolicy: 'network-only'
    })

    return this.findPaginatedQueryRef.valueChanges.pipe(
      map(result => result.data.findPaginated)
    )
  }

  refetchFindPagianted(input: IGetUnitsPaginatedInput) {
    return this.findPaginatedQueryRef.refetch({ input })
  }

  // create(): Observable<IApiResponse<IWorkflowTemplate>> {
  //
  // }
}
