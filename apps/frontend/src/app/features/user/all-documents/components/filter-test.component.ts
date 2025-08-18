import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentsService, Document } from '../../../../core/services/dispatch/documents.service';

@Component({
  selector: 'app-filter-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-test">
      <h3>Test Lọc Công Văn</h3>
      
      <div class="filter-controls">
        <div class="filter-group">
          <label>Loại văn bản:</label>
          <select [(ngModel)]="selectedDocumentType" (change)="applyFilters()">
            <option value="">Tất cả loại</option>
            <option value="INCOMING">Công văn đến</option>
            <option value="OUTGOING">Công văn đi</option>
            <option value="INTERNAL">Nội bộ</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()">
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Tìm kiếm:</label>
          <input type="text" [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Tìm kiếm...">
        </div>
      </div>

      <div class="filter-info">
        <p><strong>Bộ lọc hiện tại:</strong></p>
        <ul>
          <li>Loại: {{ selectedDocumentType || 'Tất cả' }}</li>
          <li>Trạng thái: {{ selectedStatus || 'Tất cả' }}</li>
          <li>Tìm kiếm: {{ searchTerm || 'Không có' }}</li>
        </ul>
        <p><strong>Kết quả:</strong> {{ filteredDocuments.length }} / {{ allDocuments.length }} văn bản</p>
      </div>

      @if (isLoading) {
        <p>Đang tải...</p>
      } @else if (filteredDocuments.length > 0) {
        <div class="documents-list">
          @for (doc of filteredDocuments; track doc.id) {
            <div class="document-item">
              <div class="doc-header">
                <span class="doc-id">#{{ doc.id }}</span>
                <span class="doc-type">{{ getDocumentTypeLabel(doc.documentType) }}</span>
                <span class="doc-status" [class]="'status-' + (doc.status || 'DRAFT')">
                  {{ getStatusLabel(doc.status || 'DRAFT') }}
                </span>
              </div>
              <div class="doc-title">{{ doc.title }}</div>
              <div class="doc-meta">
                <span>Ngày tạo: {{ doc.createdAt | date:'dd/MM/yyyy' }}</span>
                <span>Loại: {{ doc.documentType }}</span>
                <span>Status: {{ doc.status }}</span>
              </div>
            </div>
          }
        </div>
      } @else {
        <p>Không có văn bản nào phù hợp với bộ lọc</p>
      }

      @if (error) {
        <div class="error">
          <p>Lỗi: {{ error }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .filter-test {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .filter-controls {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-group label {
      font-weight: 600;
      font-size: 14px;
    }

    .filter-group select,
    .filter-group input {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
    }

    .filter-info {
      margin-bottom: 20px;
      padding: 15px;
      background: #f0f9ff;
      border-radius: 8px;
    }

    .filter-info ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .document-item {
      padding: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }

    .doc-header {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
    }

    .doc-id {
      font-weight: 600;
      color: #6b7280;
    }

    .doc-type {
      padding: 2px 8px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 4px;
      font-size: 12px;
    }

    .doc-status {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-DRAFT { background: #f3f4f6; color: #6b7280; }
    .status-PENDING { background: #fef3c7; color: #92400e; }
    .status-PROCESSING { background: #dbeafe; color: #1e40af; }
    .status-APPROVED { background: #d1fae5; color: #065f46; }
    .status-REJECTED { background: #fee2e2; color: #991b1b; }
    .status-COMPLETED { background: #d1fae5; color: #065f46; }
    .status-CANCELLED { background: #fee2e2; color: #991b1b; }

    .doc-title {
      font-weight: 600;
      margin-bottom: 8px;
    }

    .doc-meta {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #6b7280;
    }

    .error {
      padding: 15px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
    }
  `]
})
export class FilterTestComponent implements OnInit {
  allDocuments: Document[] = [];
  filteredDocuments: Document[] = [];
  selectedDocumentType: string = '';
  selectedStatus: string = '';
  searchTerm: string = '';
  isLoading = false;
  error: string | null = null;

  constructor(private documentsService: DocumentsService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.error = null;

    this.documentsService.getDocumentsPaginated({
      page: 1,
      take: 50,
      order: 'DESC'
    }).subscribe({
      next: (response) => {
        this.allDocuments = response.data || [];
        this.applyFilters();
        this.isLoading = false;
        console.log('Loaded documents:', this.allDocuments);
      },
      error: (error) => {
        this.error = error.message || 'Lỗi khi tải dữ liệu';
        this.isLoading = false;
        console.error('Error loading documents:', error);
      }
    });
  }

  applyFilters(): void {
    console.log('Applying filters:', {
      selectedDocumentType: this.selectedDocumentType,
      selectedStatus: this.selectedStatus,
      searchTerm: this.searchTerm
    });

    this.filteredDocuments = this.allDocuments.filter(document => {
      // Search filter
      const matchesSearch = !this.searchTerm || 
        document.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        document.content?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Document type filter
      const matchesType = !this.selectedDocumentType || 
        document.documentType === this.selectedDocumentType;

      // Status filter
      const matchesStatus = !this.selectedStatus || 
        document.status === this.selectedStatus;

      const matches = matchesSearch && matchesType && matchesStatus;
      
      console.log(`Document ${document.id}:`, {
        title: document.title,
        type: document.documentType,
        status: document.status,
        matchesSearch,
        matchesType,
        matchesStatus,
        matches
      });

      return matches;
    });

    console.log('Filtered results:', this.filteredDocuments.length);
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
}
