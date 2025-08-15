import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-outgoing-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="outgoing-documents">
      <div class="header">
        <h2>Công văn đi</h2>
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
          <option value="draft">Bản nháp</option>
          <option value="pending">Chờ phê duyệt</option>
          <option value="approved">Đã phê duyệt</option>
          <option value="sent">Đã gửi</option>
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
              <p>Đến: {{ document.recipient }}</p>
              <p>Số: {{ document.documentNumber }}</p>
              <p>Ngày: {{ document.createdDate | date:'dd/MM/yyyy' }}</p>
              
              @if (document.workflowInstance) {
                <div class="workflow-info">
                  <span>Quy trình: {{ document.workflowInstance.template.name }}</span>
                </div>
              }
            </div>
            
            <div class="document-actions">
              <button class="btn btn-secondary" (click)="viewDetail(document)">Chi tiết</button>
              @if (document.status === 'draft') {
                <button class="btn btn-primary" (click)="submitForApproval(document)">Gửi phê duyệt</button>
              }
              @if (document.status === 'approved') {
                <button class="btn btn-success" (click)="sendDocument(document)">Gửi</button>
              }
            </div>
          </div>
        }
      </div>
      
      @if (filteredDocuments.length === 0) {
        <div class="empty-state">
          <p>Chưa có công văn đi nào.</p>
          <button class="btn btn-primary" (click)="createDocument()">Tạo công văn đầu tiên</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .outgoing-documents {
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

    .status-draft { background: #f3f4f6; color: #374151; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-sent { background: #dbeafe; color: #1e40af; }

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

    .btn-success {
      background: #10b981;
      color: white;
    }
  `]
})
export class OutgoingDocuments implements OnInit {
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
        title: 'Công văn trả lời về việc tổ chức họp',
        recipient: 'Phòng Tổ chức - Hành chính',
        documentNumber: 'CV-001/2024',
        createdDate: new Date('2024-01-15'),
        status: 'draft'
      },
      {
        id: 2,
        title: 'Báo cáo kết quả công việc tháng 1',
        recipient: 'Ban Giám hiệu',
        documentNumber: 'CV-002/2024',
        createdDate: new Date('2024-01-20'),
        status: 'approved',
        workflowInstance: {
          template: { name: 'Quy trình phê duyệt báo cáo' },
          status: 'COMPLETED'
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
    console.log('Create outgoing document');
  }

  viewDetail(document: any): void {
    console.log('View outgoing document detail:', document);
  }

  submitForApproval(document: any): void {
    console.log('Submit for approval:', document);
  }

  sendDocument(document: any): void {
    console.log('Send document:', document);
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'draft': 'Bản nháp',
      'pending': 'Chờ phê duyệt',
      'approved': 'Đã phê duyệt',
      'sent': 'Đã gửi'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'draft': 'status-draft',
      'pending': 'status-pending',
      'approved': 'status-approved',
      'sent': 'status-sent'
    };
    return statusClasses[status] || 'status-default';
  }
}
