import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowInstancesService } from '../../../core/modules/workflow/workflow-instances/workflow-instances.service';
import { IWorkflowInstance } from '../../../core/modules/workflow/workflow-instances/interfaces/workflow-instance.interfaces';
import { WorkflowInstanceCreate } from './components/workflow-instance-create/workflow-instance-create';
import { WorkflowInstanceDetail } from './components/workflow-instance-detail/workflow-instance-detail';

@Component({
  selector: 'app-workflow-instances',
  standalone: true,
  imports: [CommonModule, FormsModule, WorkflowInstanceCreate, WorkflowInstanceDetail],
  template: `
    <div class="workflow-instances">
      <div class="header">
        <h2>Quy trình xử lý</h2>
        <button class="btn btn-primary" (click)="showCreateModal = true">+ Tạo quy trình mới</button>
      </div>
      
      <div class="filters">
        <input 
          type="text" 
          placeholder="Tìm kiếm..." 
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          class="search-input"
        />
        <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="IN_PROGRESS">Đang xử lý</option>
          <option value="COMPLETED">Đã hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>
      </div>
      
      <div class="instances-grid">
        @for (instance of filteredInstances; track instance.id) {
          <div class="instance-card">
            <div class="instance-header">
              <span class="instance-id">#{{ instance.id }}</span>
              <span class="status-badge" [class]="getStatusClass(instance.status)">
                {{ getStatusLabel(instance.status) }}
              </span>
            </div>
            
            <div class="instance-body">
              <h4>{{ instance.template.name }}</h4>
              <p>ID Công văn: {{ instance.documentId }}</p>
                             <p>Người tạo: {{ instance.createdByUser.fullName || 'N/A' }}</p>
              <p>Ngày tạo: {{ instance.createdAt | date:'dd/MM/yyyy' }}</p>
              
              @if (instance.currentStep) {
                <div class="current-step-info">
                  <span>Bước hiện tại: {{ instance.currentStep.name }}</span>
                </div>
              }
              
              @if (instance.notes) {
                <div class="notes">
                  <span>Ghi chú: {{ instance.notes }}</span>
                </div>
              }
            </div>
            
            <div class="instance-actions">
              <button class="btn btn-secondary" (click)="viewDetail(instance)">Chi tiết</button>
              @if (instance.status === 'IN_PROGRESS') {
                <button class="btn btn-primary" (click)="processInstance(instance)">Xử lý</button>
              }
            </div>
          </div>
        }
      </div>
      
      @if (filteredInstances.length === 0) {
        <div class="empty-state">
          <p>Chưa có quy trình xử lý nào.</p>
          <button class="btn btn-primary" (click)="showCreateModal = true">Tạo quy trình đầu tiên</button>
        </div>
      }
    </div>

    <!-- Create Modal -->
    @if (showCreateModal) {
      <app-workflow-instance-create 
        [isOpen]="showCreateModal"
        (closeModal)="showCreateModal = false"
        (createdSuccessfully)="onInstanceCreated()"
      />
    }

    <!-- Detail Modal -->
    @if (showDetailModal && selectedInstanceId) {
      <app-workflow-instance-detail 
        [workflowInstanceId]="selectedInstanceId"
        [isOpen]="showDetailModal"
        (closeModal)="showDetailModal = false"
        (actionCompleted)="onActionCompleted()"
      />
    }
  `,
  styles: [`
    .workflow-instances {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .search-input, .filter-select {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }

    .search-input {
      flex: 1;
      min-width: 300px;
    }

    .instances-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .instance-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      overflow: hidden;
    }

    .instance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .instance-id {
      font-weight: 600;
      color: #374151;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-IN_PROGRESS { background: #dbeafe; color: #1e40af; }
    .status-COMPLETED { background: #d1fae5; color: #065f46; }
    .status-CANCELLED { background: #fee2e2; color: #991b1b; }
    .status-REJECTED { background: #fef3c7; color: #92400e; }

    .instance-body {
      padding: 16px;
    }

    .instance-body h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .instance-body p {
      margin: 0 0 4px 0;
      color: #6b7280;
      font-size: 14px;
    }

    .current-step-info {
      margin-top: 12px;
      padding: 8px 12px;
      background: #f3f4f6;
      border-radius: 6px;
      font-size: 14px;
    }

    .notes {
      margin-top: 8px;
      padding: 8px 12px;
      background: #fef3c7;
      border-radius: 6px;
      font-size: 14px;
      color: #92400e;
    }

    .instance-actions {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      display: flex;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }
  `]
})
export class WorkflowInstances implements OnInit {
  instances: IWorkflowInstance[] = [];
  filteredInstances: IWorkflowInstance[] = [];
  searchTerm = '';
  statusFilter = '';
  showCreateModal = false;
  showDetailModal = false;
  selectedInstanceId?: number;

  constructor(private workflowInstancesService: WorkflowInstancesService) {}

  ngOnInit(): void {
    this.loadInstances();
  }

  loadInstances(): void {
    this.workflowInstancesService.findMyInstances().subscribe({
      next: (instances) => {
        this.instances = instances;
        this.filteredInstances = instances;
      },
      error: (error) => {
        console.error('Error loading workflow instances:', error);
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredInstances = this.instances.filter(instance => {
      const matchesSearch = !this.searchTerm || 
                 instance.template.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         (instance.createdByUser?.fullName || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || instance.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  viewDetail(instance: IWorkflowInstance): void {
    this.selectedInstanceId = instance.id;
    this.showDetailModal = true;
  }

  processInstance(instance: IWorkflowInstance): void {
    this.selectedInstanceId = instance.id;
    this.showDetailModal = true;
  }

  onInstanceCreated(): void {
    this.loadInstances();
  }

  onActionCompleted(): void {
    this.loadInstances();
  }

  getStatusLabel(status: string): string {
    return this.workflowInstancesService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.workflowInstancesService.getStatusClass(status);
  }
}
