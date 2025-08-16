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
      <div class="incoming-documents__header">
        <div class="header__group">
          <!-- <div class="header__title">
            <h2>Quản lý công văn đến</h2>
          </div> -->
          <div class="header__search">
            <input 
              type="text" 
              placeholder="Tìm kiếm công văn..." 
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              class="search-input"
            />
          </div>
          <div class="header__add">
            <button class="btn btn-primary" (click)="createDocument()">
              <span class="btn-icon">+</span>
              Tạo công văn mới
            </button>
          </div>
        </div>
        <div class="header__group header__group--block">
          <div class="filter-options">
            <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="filter-select">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Đã hoàn thành</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="incoming-documents__main">
        @if (filteredDocuments.length > 0) {
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
                  <h4 class="document-title">{{ document.title }}</h4>
                  <div class="document-info">
                    <p><strong>Loại:</strong> {{ document.documentCategory?.name || 'Chưa phân loại' }}</p>
                    <p><strong>Ngày tạo:</strong> {{ document.createdAt | date:'dd/MM/yyyy' }}</p>
                    <p><strong>Trạng thái:</strong> {{ getStatusLabel(document.status || 'draft') }}</p>
                  </div>
                  
                  @if (document.content) {
                    <div class="content-preview">
                      <p>{{ document.content | slice:0:100 }}{{ document.content.length > 100 ? '...' : '' }}</p>
                    </div>
                  }
                </div>
                
                <div class="document-actions">
                  <button class="btn btn-secondary" (click)="viewDetail(document)">
                    <span class="btn-icon">👁️</span>
                    Chi tiết
                  </button>
                  <button class="btn btn-primary" (click)="editDocument(document)">
                    <span class="btn-icon">✏️</span>
                    Chỉnh sửa
                  </button>
                  <button class="btn btn-danger" (click)="deleteDocument(document)">
                    <span class="btn-icon">🗑️</span>
                    Xóa
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <span class="empty-icon">📥</span>
            <h3>Không có công văn đến nào</h3>
            <p>Chưa có công văn đến nào được tạo hoặc không tìm thấy công văn phù hợp với bộ lọc.</p>
            <button class="btn btn-primary" (click)="createDocument()">
              <span class="btn-icon">+</span>
              Tạo công văn đầu tiên
            </button>
          </div>
        }
      </div>
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
      background: var(--color-background-layout);
      min-height: 100vh;
    }

    .incoming-documents__header {
      background: var(--color-background-primary);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: var(--shadow-default);
    }

    .header__group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .header__group:last-child {
      margin-bottom: 0;
    }

    .header__group--block {
      display: block;
    }

    .header__title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header__title h2 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header__search {
      display: flex;
      align-items: center;
    }

    .search-input {
      padding: 10px 15px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      width: 300px;
      font-size: 14px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .search-input::placeholder {
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .header__add {
      display: flex;
      align-items: center;
    }

    .filter-options {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 10px 15px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 14px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
      min-width: 150px;
    }

    .incoming-documents__main {
      background: var(--color-background-primary);
      border-radius: 8px;
      box-shadow: var(--shadow-default);
      overflow: hidden;
      padding: 20px;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .document-card {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-background-primary);
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }

    .document-card:hover {
      box-shadow: var(--shadow-default);
    }

    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--color-background-secondary);
      border-bottom: 1px solid var(--color-border);
    }

    .document-id {
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 14px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-draft { 
      background: var(--color-background-disabled); 
      color: var(--color-text-secondary); 
    }
    .status-pending { 
      background: color-mix(in srgb, var(--color-accent) 15%, var(--color-background-secondary)); 
      color: var(--color-accent); 
    }
    .status-processing { 
      background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-secondary)); 
      color: var(--color-primary); 
    }
    .status-completed { 
      background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-secondary)); 
      color: var(--color-primary); 
    }

    .document-body {
      padding: 16px;
    }

    .document-title {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
      line-height: 1.4;
    }

    .document-info {
      margin-bottom: 12px;
    }

    .document-info p {
      margin: 0 0 6px 0;
      color: var(--color-text-secondary);
      font-size: 14px;
      line-height: 1.4;
    }

    .document-info strong {
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .content-preview {
      margin-top: 12px;
      padding: 12px;
      background: var(--color-background-secondary);
      border-radius: 6px;
      border-left: 3px solid var(--color-primary);
    }

    .content-preview p {
      margin: 0;
      font-style: italic;
      color: var(--color-text-secondary);
      font-size: 13px;
      line-height: 1.4;
    }

    .document-actions {
      padding: 16px;
      border-top: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-secondary);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
      color: var(--color-text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .empty-state p {
      margin-bottom: 1.5rem;
      color: var(--color-text-secondary);
      font-size: 16px;
    }

    /* Button styles */
    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-primary:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .btn-secondary {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
    }

    .btn-secondary:hover {
      background: color-mix(in srgb, var(--color-text-secondary) 80%, black);
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: color-mix(in srgb, #ef4444 80%, black);
    }

    .btn-icon {
      font-size: 14px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .incoming-documents {
        padding: 10px;
      }

      .header__group {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .header__search {
        width: 100%;
      }

      .search-input {
        width: 100%;
      }

      .filter-options {
        flex-direction: column;
      }

      .filter-select {
        width: 100%;
      }

      .documents-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .document-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .incoming-documents__main {
        padding: 16px;
      }

      .document-card {
        margin: 0 -8px;
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
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
