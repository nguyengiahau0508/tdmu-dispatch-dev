import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkflowApolloService } from '../../services/workflow-apollo.service';
import { WorkflowNavigationService } from '../../services/workflow-navigation.service';
import { WorkflowInstance } from '../../models/workflow-instance.model';

@Component({
  selector: 'app-pending-documents',
  standalone: true,
  imports: [CommonModule],
  providers: [WorkflowApolloService],
  template: `
    <div class="pending-documents">
      <div class="section-header">
        <h3>Văn bản cần xử lý</h3>
        <p>Danh sách văn bản đang chờ bạn xử lý</p>
      </div>

      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải danh sách văn bản...</p>
        </div>
      } @else if (pendingDocuments.length > 0) {
        <div class="documents-grid">
          @for (document of pendingDocuments; track document.id) {
            <div class="document-card" (click)="viewDocument(document.id)">
              <div class="document-header">
                <div class="document-type">
                  <span class="type-badge">{{ getDocumentTypeLabel(document.template.name) }}</span>
                </div>
                <div class="priority-indicator" [class]="getPriorityClass(document)">
                  <span class="priority-dot"></span>
                  {{ getPriorityLabel(document) }}
                </div>
              </div>

              <div class="document-content">
                <h4 class="document-title">{{ document.template.name }}</h4>
                <p class="document-description">{{ document.template.description || 'Không có mô tả' }}</p>
                
                <div class="document-meta">
                  <div class="meta-item">
                    <span class="meta-label">Người tạo:</span>
                    <span class="meta-value">{{ document.createdByUser.fullName }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Ngày tạo:</span>
                    <span class="meta-value">{{ document.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                                     <div class="meta-item">
                     <span class="meta-label">Bước hiện tại:</span>
                     <span class="meta-value step-name">{{ document.currentStep?.name || 'Không xác định' }}</span>
                   </div>
                </div>

                @if (document.notes) {
                  <div class="document-notes">
                    <span class="notes-label">Ghi chú:</span>
                    <p class="notes-content">{{ document.notes }}</p>
                  </div>
                }
              </div>

              <div class="document-actions">
                <button class="btn btn-primary" (click)="processDocument(document.id); $event.stopPropagation()">
                  Xử lý ngay
                </button>
                <button class="btn btn-secondary" (click)="viewDetails(document.id); $event.stopPropagation()">
                  Chi tiết
                </button>
              </div>
            </div>
          }
        </div>

        <div class="pagination-info">
          <p>Hiển thị {{ pendingDocuments.length }} văn bản cần xử lý</p>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">📄</div>
          <h4>Không có văn bản nào cần xử lý</h4>
          <p>Bạn đã xử lý hết tất cả văn bản đang chờ. Hãy kiểm tra lại sau!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .pending-documents {
      padding: 24px;
      background: #f8fafc;
      min-height: 400px;
    }

    .section-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .section-header h3 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .section-header p {
      margin: 0;
      color: #6b7280;
      font-size: 1rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #6b7280;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .document-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .document-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      transform: translateY(-2px);
    }

    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .type-badge {
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .priority-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .priority-indicator.high {
      color: #dc2626;
    }

    .priority-indicator.medium {
      color: #ea580c;
    }

    .priority-indicator.low {
      color: #059669;
    }

    .priority-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    .document-content {
      margin-bottom: 16px;
    }

    .document-title {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.4;
    }

    .document-description {
      margin: 0 0 16px 0;
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .document-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }

    .meta-label {
      color: #6b7280;
      font-weight: 500;
    }

    .meta-value {
      color: #374151;
      font-weight: 500;
    }

    .step-name {
      color: #3b82f6;
      font-weight: 600;
    }

    .document-notes {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
    }

    .notes-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .notes-content {
      margin: 0;
      font-size: 0.85rem;
      color: #374151;
      line-height: 1.4;
    }

    .document-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .pagination-info {
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .empty-state h4 {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .pending-documents {
        padding: 16px;
      }

      .documents-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .document-card {
        padding: 16px;
      }

      .document-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class PendingDocumentsComponent implements OnInit {
  pendingDocuments: WorkflowInstance[] = [];
  isLoading = true;

  constructor(
    private workflowApolloService: WorkflowApolloService,
    private router: Router,
    private navigationService: WorkflowNavigationService
  ) {}

  ngOnInit(): void {
    this.loadPendingDocuments();
  }

  async loadPendingDocuments(): Promise<void> {
    this.isLoading = true;
    try {
      this.workflowApolloService.getMyPendingWorkflows().subscribe({
        next: (workflows: WorkflowInstance[]) => {
          console.log(workflows);
          this.pendingDocuments = workflows;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading pending documents:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error loading pending documents:', error);
      this.isLoading = false;
    }
  }

  viewDocument(documentId: number): void {
    this.navigationService.navigateToWorkflow(documentId);
  }

  processDocument(documentId: number): void {
    this.navigationService.navigateToWorkflowProcess(documentId);
  }

  viewDetails(documentId: number): void {
    this.navigationService.navigateToWorkflowDetails(documentId);
  }

  getDocumentTypeLabel(templateName: string): string {
    // Map template names to shorter labels
    const typeMap: { [key: string]: string } = {
      'Quy trình phê duyệt văn bản thông thường': 'Văn bản thường',
      'Quy trình phê duyệt văn bản tài chính': 'Văn bản tài chính',
      'Quy trình phê duyệt văn bản đào tạo': 'Văn bản đào tạo',
    };
    return typeMap[templateName] || 'Văn bản';
  }

  getPriorityClass(document: WorkflowInstance): string {
    // Logic để xác định độ ưu tiên dựa trên thời gian tạo
    const createdAt = new Date(document.createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (diffHours > 48) return 'high';
    if (diffHours > 24) return 'medium';
    return 'low';
  }

  getPriorityLabel(document: WorkflowInstance): string {
    const priorityClass = this.getPriorityClass(document);
    const priorityLabels: { [key: string]: string } = {
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp'
    };
    return priorityLabels[priorityClass] || 'Thấp';
  }
}
