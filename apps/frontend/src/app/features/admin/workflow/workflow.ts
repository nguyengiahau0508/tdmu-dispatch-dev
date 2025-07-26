import { Component, OnInit } from '@angular/core';
import { IWorkflowTemplate } from '../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';
import { IGetWorkflowTemplatePaginatedInput } from '../../../core/modules/workflow/workflow-templates/interfaces/get-workflow-template-paginated.interfaces';
import { Order } from '../../../core/interfaces/page-options.interface';
import { WorkflowTemplatesService } from '../../../core/modules/workflow/workflow-templates/workflow-templates.service';
import { Pagination } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-workflow',
  imports: [Pagination],
  templateUrl: './workflow.html',
  styleUrl: './workflow.css'
})
export class Workflow implements OnInit {
  workflowTemplates: IWorkflowTemplate[] = []
  totalCount = 0;

  pageOptions: IGetWorkflowTemplatePaginatedInput = {
    page: 1,
    take: 10,
    order: Order.ASC
  }

  selectedMenuId: number | null = null

  constructor(
    private workflowTemplatesService: WorkflowTemplatesService
  ) { }

  ngOnInit(): void {
    this.initFindPaginatedQuery()
  }

  initFindPaginatedQuery() {
    this.workflowTemplatesService.initFindPagianted(this.pageOptions).subscribe({
      next: response => {
        this.workflowTemplates = response.data ?? []
        this.totalCount = response.totalCount ?? 0
      },
      error: err => {
        console.log(err)
      }
    })
  }

  toggleUserCreate() {

  }

  onPageSizeChange(take: number) {

  }

  onOrderChange(order: Order) {

  }

  onPageChange(page: number) {

  }

  toggleMenu(workflowTemplateId:number) {

  }
}
