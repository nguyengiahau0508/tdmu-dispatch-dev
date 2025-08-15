import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { DatePipe } from '@angular/common';
import { WorkflowTemplatesService } from '../../../core/modules/workflow/workflow-templates/workflow-templates.service';
import { IWorkflowTemplate } from '../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';
import { WorkflowTemplateCreate } from './components/workflow-template-create/workflow-template-create';
import { WorkflowTemplateUpdate } from './components/workflow-template-update/workflow-template-update';
import { WorkflowTemplateDetail } from './components/workflow-template-detail/workflow-template-detail';
import { Order, IPageOptions } from '../../../core/interfaces/page-options.interface';

@Component({
  selector: 'app-workflow',
  imports: [CommonModule, Pagination, DatePipe, WorkflowTemplateCreate, WorkflowTemplateUpdate, WorkflowTemplateDetail],
  providers: [WorkflowTemplatesService],
  templateUrl: './workflow.html',
  styleUrl: './workflow.css'
})
export class Workflow implements OnInit {
  // Export Order enum để có thể sử dụng trong template
  Order = Order;
  
  workflowTemplates: IWorkflowTemplate[] = []
  totalCount = 0
  pageOptions: IPageOptions & { search?: string } = {
    page: 1,
    take: 10,
    search: '',
    order: Order.DESC
  }
  selectedMenuId: number | null = null
  selectedWorkflowTemplate: IWorkflowTemplate | null = null
  isWorkflowTemplateCreateOpen = false
  isWorkflowTemplateUpdateOpen = false
  isWorkflowTemplateDetailOpen = false

  constructor(private workflowTemplatesService: WorkflowTemplatesService) { }

  ngOnInit(): void { this.initFindPaginatedQuery() }

  initFindPaginatedQuery() {
    this.workflowTemplatesService.initFindPagianted(this.pageOptions).subscribe({
      next: (response: any) => {
        this.workflowTemplates = response.data ?? []
        this.totalCount = response.meta?.itemCount ?? 0
      },
      error: (error: any) => { console.log(error) }
    })
  }

  toggleWorkflowTemplateCreate() { this.isWorkflowTemplateCreateOpen = !this.isWorkflowTemplateCreateOpen }
  toggleWorkflowTemplateUpdate() { this.isWorkflowTemplateUpdateOpen = !this.isWorkflowTemplateUpdateOpen }
  toggleWorkflowTemplateDetail() { this.isWorkflowTemplateDetailOpen = !this.isWorkflowTemplateDetailOpen }

  onPageSizeChange(take: number) { this.pageOptions.take = take; this.pageOptions.page = 1; this.refreshWorkflowTemplates() }
  onOrderChange(order: Order) { this.pageOptions.order = order; this.refreshWorkflowTemplates() }
  onPageChange(page: number) { this.pageOptions.page = page; this.refreshWorkflowTemplates() }

  refreshWorkflowTemplates() {
    this.workflowTemplatesService.refetchFindPagianted(this.pageOptions).then((response: any) => {
      this.workflowTemplates = response.data.workflowTemplatesPaginated.data ?? []
      this.totalCount = response.data.workflowTemplatesPaginated.meta?.itemCount ?? 0
    }).catch((err: any) => { console.log(err) })
  }

  toggleMenu(workflowTemplateId: number) { this.selectedMenuId = this.selectedMenuId === workflowTemplateId ? null : workflowTemplateId }

  onWorkflowTemplateCreated() { this.refreshWorkflowTemplates() }
  onWorkflowTemplateUpdated() { this.refreshWorkflowTemplates(); this.selectedWorkflowTemplate = null }
  onWorkflowTemplateDetailClosed() { this.selectedWorkflowTemplate = null }

  editWorkflowTemplate(workflowTemplate: IWorkflowTemplate) { this.selectedWorkflowTemplate = workflowTemplate; this.toggleWorkflowTemplateUpdate(); this.selectedMenuId = null }
  viewWorkflowTemplateDetail(workflowTemplate: IWorkflowTemplate) { this.selectedWorkflowTemplate = workflowTemplate; this.toggleWorkflowTemplateDetail(); this.selectedMenuId = null }

  deleteWorkflowTemplate(workflowTemplate: IWorkflowTemplate) {
    if (confirm(`Bạn có chắc chắn muốn xóa quy trình "${workflowTemplate.name}"?`)) {
      this.workflowTemplatesService.remove(workflowTemplate.id).subscribe({
        next: () => { this.refreshWorkflowTemplates(); this.selectedMenuId = null },
        error: (error: any) => { console.error('Error deleting workflow template:', error) }
      })
    }
  }

  getStatusLabel(isActive: boolean): string { return isActive ? 'Đang hoạt động' : 'Không hoạt động' }
  getStatusClass(isActive: boolean): string { return isActive ? 'status-active' : 'status-inactive' }
}
