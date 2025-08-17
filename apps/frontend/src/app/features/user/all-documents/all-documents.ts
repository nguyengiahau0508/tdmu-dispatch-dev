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
    <div class="documents">
      <div class="documents__header">
        <div class="header__group">
          <!-- <div class="header__title">
            <h2>Quản lý công văn</h2>
          </div> -->
          <div class="header__search">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="applyFilters()"
              placeholder="Tìm kiếm công văn..."
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
            <select [(ngModel)]="selectedDocumentType" (change)="applyFilters()" class="filter-select">
              <option value="">Tất cả loại</option>
              <option value="INCOMING">Công văn đến</option>
              <option value="OUTGOING">Công văn đi</option>
              <option value="INTERNAL">Nội bộ</option>
            </select>
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="filter-select">
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="pending">Chờ xử lý</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading">
        <div class="spinner">⏳</div>
        <p>Đang tải danh sách công văn...</p>
      </div>

      <div class="documents__main">
        @if (!isLoading && filteredDocuments.length > 0) {
        <table class="documents__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Nhóm</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (document of filteredDocuments; track document.id) {
            <tr class="document-row" (click)="viewDetail(document)">
              <td>{{ document.id }}</td>
              <td class="document-title-cell">
                <div class="document-title">{{ document.title }}</div>
                @if (document.content) {
                <div class="document-preview">{{ document.content | slice:0:100 }}{{ document.content.length > 100 ? '...' : '' }}</div>
                }
              </td>
              <td>
                <span class="document-type-badge" [class]="'type-' + document.documentType.toLowerCase()">
                  {{ getDocumentTypeLabel(document.documentType) }}
                </span>
              </td>
              <td>
                @if (document.documentCategory) {
                {{ document.documentCategory.name }}
                } @else {
                <span class="text-muted">Chưa phân loại</span>
                }
              </td>
              <td>
                                  <span class="document-status" [class]="'status-' + (document.status || 'DRAFT')">
                  {{ getStatusLabel(document.status || 'DRAFT') }}
                </span>
              </td>
              <td>
                {{ document.createdAt | date:'dd/MM/yyyy' }}
              </td>
              <td class="row-actions">
                <div class="actions-menu">
                  <button class="menu-button" (click)="toggleMenu(document.id)">⋮</button>

                  @if (selectedMenuId === document.id) {
                  <div class="dropdown-menu" (mouseleave)="toggleMenu(document.id)">
                    <button class="menu-item" (click)="viewDetail(document)">
                      <span class="btn-icon">👁️</span>
                      Xem chi tiết
                    </button>
                    <button class="menu-item" (click)="editDocument($event, document)">
                      <span class="btn-icon">✏️</span>
                      Chỉnh sửa
                    </button>
                    <button class="menu-item" (click)="deleteDocument($event, document)">
                      <span class="btn-icon">🗑️</span>
                      Xóa
                    </button>
                  </div>
                  }
                </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
        } @else if (!isLoading && filteredDocuments.length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📭</span>
          <h3>Không có công văn nào</h3>
          <p>Chưa có công văn nào được tạo hoặc không tìm thấy công văn phù hợp với bộ lọc.</p>
          <button class="btn btn-primary" (click)="createDocument()">
            <span class="btn-icon">+</span>
            Tạo công văn đầu tiên
          </button>
        </div>
        } @else {
        <div class="loading">
          <div class="spinner">⏳</div>
          <p>Đang tải danh sách công văn...</p>
        </div>
        }
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
    .documents {
      padding: 20px;
      background: var(--color-background-layout);
      min-height: 100vh;
    }

    /* Header chứa tìm kiếm và thêm */
    .documents__header {
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

    /* Ô tìm kiếm */
    .documents__header .header__search input {
      padding: 10px 15px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      width: 300px;
      font-size: 14px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .documents__header .header__search input::placeholder {
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    /* Nút Thêm */
    .documents__header .header__add button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .documents__header .header__add button:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    /* Filter options */
    .filter-options {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 10px 15px;
      font-size: 14px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
      min-width: 150px;
    }

    .documents__main {
      background: var(--color-background-primary);
      border-radius: 8px;
      box-shadow: var(--shadow-default);
      overflow: hidden;
    }

    /* Table style */
    .documents__table {
      width: 100%;
      border-collapse: collapse;
    }

    .documents__table thead {
      background: var(--color-background-secondary);
    }

    .documents__table th {
      background: var(--color-background-secondary);
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: var(--color-text-primary);
      border-bottom: 2px solid var(--color-border);
      font-size: 14px;
    }

    .documents__table td {
      padding: 15px;
      border-bottom: 1px solid var(--color-border);
      font-size: 14px;
      vertical-align: middle;
    }

    .documents__table tr:hover {
      background: color-mix(in srgb, var(--color-primary) 5%, var(--color-background-secondary));
      cursor: pointer;
    }

    /* Document title cell */
    .document-title-cell {
      max-width: 300px;
    }

    .document-title {
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .document-preview {
      font-size: 13px;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    /* Document type badges */
    .document-type-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .type-incoming {
      background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-secondary));
      color: var(--color-primary);
    }

    .type-outgoing {
      background: color-mix(in srgb, var(--color-accent) 15%, var(--color-background-secondary));
      color: var(--color-accent);
    }

    .type-internal {
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-background-secondary));
      color: var(--color-primary);
    }

    /* Document status */
    .document-status {
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

    .status-approved {
      background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-secondary));
      color: var(--color-primary);
    }

    .status-rejected {
      background: color-mix(in srgb, #dc3545 15%, var(--color-background-secondary));
      color: #dc3545;
    }

    /* Text muted */
    .text-muted {
      color: var(--color-text-secondary);
      font-style: italic;
    }

    /* Cột hành động */
    .row-actions {
      position: relative;
      text-align: right;
      width: 100px;
    }

    /* Nút 3 chấm */
    .menu-button {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      color: var(--color-text-secondary);
      transition: background-color 0.2s;
    }

    .menu-button:hover {
      background: var(--color-background-secondary);
      color: var(--color-primary);
    }

    /* Dropdown menu */
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      box-shadow: var(--shadow-default);
      z-index: 1000;
      min-width: 150px;
      padding: 8px 0;
    }

    .dropdown-menu button {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 15px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: var(--color-text-primary);
      transition: background-color 0.2s;
    }

    .dropdown-menu button:hover {
      background: var(--color-background-secondary);
      color: var(--color-primary);
    }

    /* Loading */
    .loading {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-secondary);
    }

    .spinner {
      font-size: 2rem;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Empty state */
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
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-primary:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .btn-icon {
      font-size: 16px;
    }

    /* Menu item styles */
    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 15px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: var(--color-text-primary);
      transition: background-color 0.2s;
    }

    .menu-item:hover {
      background: var(--color-background-secondary);
      color: var(--color-primary);
    }

    .menu-item .btn-icon {
      font-size: 14px;
    }

    /* Modal styles */
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
      background: var(--color-background-primary);
      border-radius: 8px;
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
      box-shadow: var(--shadow-default);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--color-border);
    }

    .modal-header h3 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--color-text-secondary);
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .btn-close:hover {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .modal-body {
      padding: 20px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .documents {
        padding: 10px;
      }

      .header__group {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .header__search input {
        width: 100%;
      }

      .filter-options {
        flex-direction: column;
      }

      .filter-select {
        width: 100%;
      }

      .documents__table {
        font-size: 12px;
      }

      .documents__table th,
      .documents__table td {
        padding: 10px 8px;
      }

      .document-title-cell {
        max-width: 200px;
      }

      .dropdown-menu {
        width: 150px;
      }
    }

    @media (max-width: 480px) {
      .documents__table {
        display: block;
        overflow-x: auto;
      }

      .documents__table th,
      .documents__table td {
        min-width: 100px;
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

  // Menu state
  selectedMenuId: number | null = null;

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
        // console.log('Full response:', response);
        // console.log('Response type:', typeof response);
        // console.log('Response keys:', Object.keys(response));
        
        // Handle paginated response structure
        this.documents = response.data || [];
        this.totalPages = Math.ceil((response.totalCount || 0) / this.pageSize);
        
        // console.log('Documents array:', this.documents);
        // console.log('Documents length:', this.documents.length);
        // console.log('Total pages:', this.totalPages);
        
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
    // console.log('applyFilters called');
    // console.log('this.documents:', this.documents);
    // console.log('this.documents length:', this.documents?.length);
    
    if (!this.documents) {
      console.log('Documents is null/undefined, setting empty array');
      this.filteredDocuments = [];
      return;
    }

    this.filteredDocuments = this.documents.filter(document => {
      // console.log('Filtering document:', document);
      
      // Search filter
      const matchesSearch = !this.searchTerm || 
        document.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        document.content?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Document type filter
      const matchesType = !this.selectedDocumentType || 
        document.documentType === this.selectedDocumentType;

      // Status filter
      const matchesStatus = !this.selectedStatus || 
        (document.status || 'DRAFT') === this.selectedStatus;

      const matches = matchesSearch && matchesType && matchesStatus;
      // console.log(`Document ${document.id} matches:`, matches, 'search:', matchesSearch, 'type:', matchesType, 'status:', matchesStatus);
      
      return matches;
    });
    
    // console.log('Filtered documents:', this.filteredDocuments);
    // console.log('Filtered documents length:', this.filteredDocuments.length);
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
      case 'DRAFT': return 'Nháp';
      case 'PENDING': return 'Chờ xử lý';
      case 'PROCESSING': return 'Đang xử lý';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  }

  toggleMenu(documentId: number): void {
    this.selectedMenuId = this.selectedMenuId === documentId ? null : documentId;
  }
}
