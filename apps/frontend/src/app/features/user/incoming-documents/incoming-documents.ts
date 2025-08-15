import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incoming-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="incoming-documents">
      <div class="header">
        <h2>Công văn đến</h2>
        <button class="btn btn-primary" (click)="createDocument()">+ Tạo công văn mới</button>
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
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Đã hoàn thành</option>
        </select>
      </div>
      
      <div class="documents-grid">
        @for (document of filteredDocuments; track document.id) {
          <div class="document-card">
            <div class="document-header">
              <span class="document-id">#{{ document.id }}</span>
              <span class="status-badge" [class]="getStatusClass(document.status)">
                {{ getStatusLabel(document.status) }}
              </span>
            </div>
            
            <div class="document-body">
              <h4>{{ document.title }}</h4>
              <p>Từ: {{ document.sender }}</p>
              <p>Số: {{ document.documentNumber }}</p>
              <p>Ngày: {{ document.receivedDate | date:'dd/MM/yyyy' }}</p>
              
              @if (document.workflowInstance) {
                <div class="workflow-info">
                  <span>Quy trình: {{ document.workflowInstance.template.name }}</span>
                </div>
              }
            </div>
            
            <div class="document-actions">
              <button class="btn btn-secondary" (click)="viewDetail(document)">Chi tiết</button>
              @if (document.workflowInstance?.status === 'IN_PROGRESS') {
                <button class="btn btn-primary" (click)="processWorkflow(document)">Xử lý</button>
              }
            </div>
          </div>
        }
      </div>
      
      @if (filteredDocuments.length === 0) {
        <div class="empty-state">
          <p>Chưa có công văn đến nào.</p>
          <button class="btn btn-primary" (click)="createDocument()">Tạo công văn đầu tiên</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .incoming-documents {
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

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .document-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      overflow: hidden;
    }

    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .document-id {
      font-weight: 600;
      color: #374151;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-pending { background: #fef3c7; color: #92400e; }
    .status-processing { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #d1fae5; color: #065f46; }

    .document-body {
      padding: 16px;
    }

    .document-body h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .document-body p {
      margin: 0 0 4px 0;
      color: #6b7280;
      font-size: 14px;
    }

    .workflow-info {
      margin-top: 12px;
      padding: 8px 12px;
      background: #f3f4f6;
      border-radius: 6px;
      font-size: 14px;
    }

    .document-actions {
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
export class IncomingDocuments implements OnInit {
  documents: any[] = [];
  filteredDocuments: any[] = [];
  searchTerm = '';
  statusFilter = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    // Mock data
    this.documents = [
      {
        id: 1,
        title: 'Công văn về việc tổ chức họp định kỳ',
        sender: 'Phòng Tổ chức - Hành chính',
        documentNumber: 'CV-001/2024',
        receivedDate: new Date('2024-01-15'),
        status: 'pending',
        workflowInstance: {
          template: { name: 'Quy trình phê duyệt công văn' },
          status: 'IN_PROGRESS'
        }
      },
      {
        id: 2,
        title: 'Báo cáo tình hình công việc tháng 1',
        sender: 'Phòng Kế hoạch',
        documentNumber: 'CV-002/2024',
        receivedDate: new Date('2024-01-20'),
        status: 'processing',
        workflowInstance: {
          template: { name: 'Quy trình xử lý báo cáo' },
          status: 'IN_PROGRESS'
        }
      }
    ];
    this.filteredDocuments = this.documents;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesSearch = !this.searchTerm || 
        doc.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || doc.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  createDocument(): void {
    console.log('Create document');
  }

  viewDetail(document: any): void {
    console.log('View document detail:', document);
  }

  processWorkflow(document: any): void {
    console.log('Process workflow for document:', document);
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'completed': 'Đã hoàn thành'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed'
    };
    return statusClasses[status] || 'status-default';
  }
}
