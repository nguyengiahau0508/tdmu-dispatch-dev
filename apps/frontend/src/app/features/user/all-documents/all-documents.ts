import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentsService, Document } from '../../../core/services/dispatch/documents.service';
import { DocumentFormComponent } from '../document-form/document-form.component';
import { DocumentDetailComponent } from '../document-detail/document-detail.component';

@Component({
  selector: 'app-all-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentFormComponent, DocumentDetailComponent],
  template: `
    <div class="all-documents-container">
      <div class="header">
        <h2>📋 Tất cả công văn</h2>
        <div class="actions">
          <button class="btn btn-primary" (click)="createDocument()">
            <i class="icon">📄</i> Tạo công văn mới
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="applyFilters()"
            placeholder="🔍 Tìm kiếm theo tiêu đề..."
            class="form-control"
          >
        </div>
        <div class="filter-options">
          <select [(ngModel)]="selectedDocumentType" (change)="applyFilters()" class="form-control">
            <option value="">Tất cả loại</option>
            <option value="INCOMING">Công văn đến</option>
            <option value="OUTGOING">Công văn đi</option>
            <option value="INTERNAL">Nội bộ</option>
          </select>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="form-control">
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending">Chờ xử lý</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading">
        <div class="spinner">⏳</div>
        <p>Đang tải danh sách công văn...</p>
      </div>

      <!-- Documents List -->
      <div *ngIf="!isLoading && filteredDocuments.length > 0" class="documents-list">
        <div class="document-item" *ngFor="let document of filteredDocuments" (click)="viewDetail(document)">
          <div class="document-header">
            <h3 class="document-title">{{ document.title }}</h3>
            <div class="document-type-badge" [class]="'type-' + document.documentType.toLowerCase()">
              {{ getDocumentTypeLabel(document.documentType) }}
            </div>
          </div>
          <div class="document-meta">
            <span class="document-category" *ngIf="document.documentCategory">
              📁 {{ document.documentCategory.name }}
            </span>
            <span class="document-status" [class]="'status-' + (document.status || 'draft')">
              {{ getStatusLabel(document.status || 'draft') }}
            </span>
            <span class="document-date">
              📅 {{ document.createdAt | date:'dd/MM/yyyy HH:mm' }}
            </span>
          </div>
          <div class="document-content" *ngIf="document.content">
            <p class="content-preview">{{ document.content | slice:0:150 }}{{ document.content.length > 150 ? '...' : '' }}</p>
          </div>
          <div class="document-actions">
            <button class="btn btn-sm btn-outline-primary" (click)="editDocument($event, document)">
              ✏️ Sửa
            </button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteDocument($event, document)">
              🗑️ Xóa
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredDocuments.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Không có công văn nào</h3>
        <p>Chưa có công văn nào được tạo hoặc không tìm thấy công văn phù hợp với bộ lọc.</p>
        <button class="btn btn-primary" (click)="createDocument()">
          📄 Tạo công văn đầu tiên
        </button>
      </div>

      <!-- Pagination -->
      <div *ngIf="!isLoading && totalPages > 1" class="pagination">
        <button 
          class="btn btn-outline-primary" 
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)"
        >
          ← Trước
        </button>
        <span class="page-info">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          class="btn btn-outline-primary" 
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)"
        >
          Sau →
        </button>
      </div>
    </div>

    <!-- Document Form Modal -->
    <div *ngIf="showDocumentForm" class="modal-overlay" (click)="onDocumentFormCancelled()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedDocument ? 'Sửa công văn' : 'Tạo công văn mới' }}</h3>
          <button class="btn-close" (click)="onDocumentFormCancelled()">×</button>
        </div>
        <div class="modal-body">
          <app-document-form
            [document]="selectedDocument || undefined"
            (saved)="onDocumentSaved($event)"
            (cancelled)="onDocumentFormCancelled()"
          ></app-document-form>
        </div>
      </div>
    </div>

    <!-- Document Detail Modal -->
    <div *ngIf="selectedDocument" class="modal-overlay" (click)="onDocumentDetailClosed()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Chi tiết công văn</h3>
          <button class="btn-close" (click)="onDocumentDetailClosed()">×</button>
        </div>
        <div class="modal-body">
          <app-document-detail
            [document]="selectedDocument"
            (closed)="onDocumentDetailClosed()"
            (editRequested)="onEditDocument($event)"
          ></app-document-detail>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .all-documents-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.8rem;
    }

    .actions .btn {
      padding: 10px 20px;
      font-size: 14px;
    }

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
    }

    .filter-options {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-options select {
      min-width: 150px;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      font-size: 2rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .documents-list {
      display: grid;
      gap: 15px;
    }

    .document-item {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .document-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      border-color: #3498db;
    }

    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .document-title {
      margin: 0;
      font-size: 1.2rem;
      color: #2c3e50;
      flex: 1;
      margin-right: 15px;
    }

    .document-type-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .type-incoming {
      background: #e8f5e8;
      color: #27ae60;
    }

    .type-outgoing {
      background: #fff3cd;
      color: #f39c12;
    }

    .type-internal {
      background: #e3f2fd;
      color: #2196f3;
    }

    .document-meta {
      display: flex;
      gap: 15px;
      margin-bottom: 10px;
      flex-wrap: wrap;
      font-size: 14px;
      color: #666;
    }

    .document-category {
      color: #3498db;
      font-weight: 500;
    }

    .document-status {
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-draft {
      background: #f8f9fa;
      color: #6c757d;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-approved {
      background: #d4edda;
      color: #155724;
    }

    .status-rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .document-content {
      margin-bottom: 15px;
    }

    .content-preview {
      color: #666;
      line-height: 1.5;
      margin: 0;
    }

    .document-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin-bottom: 10px;
      color: #2c3e50;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .page-info {
      font-weight: 500;
      color: #666;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .filters {
        flex-direction: column;
      }

      .filter-options {
        flex-direction: column;
      }

      .document-header {
        flex-direction: column;
        gap: 10px;
      }

      .document-meta {
        flex-direction: column;
        gap: 5px;
      }

      .document-actions {
        justify-content: stretch;
      }

      .btn-sm {
        flex: 1;
      }
    }
  `]
})
export class AllDocuments implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  isLoading = false;
  showDocumentForm = false;
  selectedDocument: Document | null = null;

  // Filter properties
  searchTerm = '';
  selectedDocumentType = '';
  selectedStatus = '';

  // Pagination properties
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;

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
    
    this.documentsService.getDocumentsPaginated({
      page: this.currentPage,
      take: this.pageSize,
      order: 'DESC'
    }).subscribe({
      next: (response) => {
        this.documents = response.data || [];
        // Calculate total pages based on totalCount and pageSize
        this.totalPages = Math.ceil((response.totalCount || 0) / this.pageSize);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    if (!this.documents) {
      this.filteredDocuments = [];
      return;
    }

    this.filteredDocuments = this.documents.filter(document => {
      // Search filter
      const matchesSearch = !this.searchTerm || 
        document.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        document.content?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Document type filter
      const matchesType = !this.selectedDocumentType || 
        document.documentType === this.selectedDocumentType;

      // Status filter
      const matchesStatus = !this.selectedStatus || 
        (document.status || 'draft') === this.selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDocuments();
    }
  }

  createDocument(): void {
    this.selectedDocument = null;
    this.showDocumentForm = true;
  }

  editDocument(event: Event, document: Document): void {
    event.stopPropagation();
    this.selectedDocument = document;
    this.showDocumentForm = true;
  }

  deleteDocument(event: Event, document: Document): void {
    event.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa công văn "${document.title}"?`)) {
      this.documentsService.removeDocument(document.id).subscribe({
        next: () => {
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          alert('Có lỗi xảy ra khi xóa công văn');
        }
      });
    }
  }

  viewDetail(document: Document): void {
    this.selectedDocument = document;
  }

  onDocumentSaved(document: Document): void {
    this.showDocumentForm = false;
    this.selectedDocument = null;
    this.loadDocuments();
  }

  onDocumentFormCancelled(): void {
    this.showDocumentForm = false;
    this.selectedDocument = null;
  }

  onDocumentDetailClosed(): void {
    this.selectedDocument = null;
  }

  onEditDocument(document: Document): void {
    this.selectedDocument = document;
    this.showDocumentForm = true;
  }

  getDocumentTypeLabel(type: string): string {
    switch (type) {
      case 'INCOMING': return 'Công văn đến';
      case 'OUTGOING': return 'Công văn đi';
      case 'INTERNAL': return 'Nội bộ';
      default: return type;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Nháp';
      case 'pending': return 'Chờ xử lý';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  }
}
