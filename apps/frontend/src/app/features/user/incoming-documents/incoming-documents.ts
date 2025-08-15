import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentsService, Document } from '../../../core/services/dispatch/documents.service';
import { DocumentFormComponent } from '../document-form/document-form.component';
import { DocumentDetailComponent } from '../document-detail/document-detail.component';

@Component({
  selector: 'app-incoming-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentFormComponent, DocumentDetailComponent],
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
              <span class="status-badge" [class]="getStatusClass(document.status || 'draft')">
                {{ getStatusLabel(document.status || 'draft') }}
              </span>
            </div>
            
            <div class="document-body">
              <h4>{{ document.title }}</h4>
              <p>Loại: {{ document.documentCategory?.name || 'Chưa phân loại' }}</p>
              <p>Ngày tạo: {{ document.createdAt | date:'dd/MM/yyyy' }}</p>
              <p>Trạng thái: {{ getStatusLabel(document.status || 'draft') }}</p>
              
              @if (document.content) {
                <p class="content-preview">{{ document.content | slice:0:100 }}{{ document.content.length > 100 ? '...' : '' }}</p>
              }
            </div>
            
            <div class="document-actions">
              <button class="btn btn-secondary" (click)="viewDetail(document)">Chi tiết</button>
              <button class="btn btn-primary" (click)="editDocument(document)">Chỉnh sửa</button>
              <button class="btn btn-danger" (click)="deleteDocument(document)">Xóa</button>
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

    @if (showDocumentForm) {
      <app-document-form
        [documentType]="'INCOMING'"
        (saved)="onDocumentSaved($event)"
        (cancelled)="onDocumentFormCancelled()"
      ></app-document-form>
    }

    @if (selectedDocument) {
      <app-document-detail
        [document]="selectedDocument"
        (closed)="onDocumentDetailClosed()"
        (editRequested)="onEditDocument($event)"
      ></app-document-detail>
    }
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

    .status-draft { background: #f3f4f6; color: #374151; }
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

    .content-preview {
      margin-top: 8px !important;
      font-style: italic;
      color: #9ca3af !important;
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

    .btn-danger {
      background: #ef4444;
      color: white;
    }
  `]
})
export class IncomingDocuments implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  searchTerm = '';
  statusFilter = '';
  showDocumentForm = false;
  selectedDocument?: Document;
  isLoading = false;

  constructor(private documentsService: DocumentsService) {
    // Initialize arrays to prevent undefined errors
    this.documents = [];
    this.filteredDocuments = [];
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentsService.getIncomingDocuments(1, 20, this.searchTerm || '').subscribe({
      next: (response) => {
        this.documents = response.data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.loadDocuments();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.documents) {
      this.filteredDocuments = [];
      return;
    }
    
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesSearch = !this.searchTerm || 
        doc.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || (doc.status || 'draft') === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  createDocument(): void {
    this.showDocumentForm = true;
  }

  editDocument(document: Document): void {
    // TODO: Implement edit functionality
    console.log('Edit document:', document);
  }

  deleteDocument(document: Document): void {
    if (confirm('Bạn có chắc chắn muốn xóa văn bản này?')) {
      this.documentsService.removeDocument(document.id).subscribe({
        next: () => {
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
        }
      });
    }
  }

  viewDetail(document: Document): void {
    this.selectedDocument = document;
  }

  onDocumentSaved(document: Document): void {
    this.showDocumentForm = false;
    this.loadDocuments();
  }

  onDocumentFormCancelled(): void {
    this.showDocumentForm = false;
  }

  onDocumentDetailClosed(): void {
    this.selectedDocument = undefined;
  }

  onEditDocument(document: Document): void {
    this.selectedDocument = undefined;
    // TODO: Implement edit functionality
    console.log('Edit document:', document);
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'draft': 'Bản nháp',
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'completed': 'Đã hoàn thành'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'draft': 'status-draft',
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed'
    };
    return statusClasses[status] || 'status-default';
  }
}
