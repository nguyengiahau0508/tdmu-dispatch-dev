import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DocumentsService } from '../../../core/services/dispatch/documents.service';


@Component({
  selector: 'app-assign-workflow-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Gán quy trình xử lý cho văn bản</h3>
          <button class="btn btn-icon" (click)="close()">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="document-info">
            <h4>Thông tin văn bản</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Tiêu đề:</label>
                <span>{{ document?.title }}</span>
              </div>
              <div class="info-item">
                <label>Loại văn bản:</label>
                <span>{{ getDocumentTypeLabel(document?.documentType) }}</span>
              </div>
              <div class="info-item">
                <label>Trạng thái:</label>
                <span class="status-badge" [class]="getStatusClass(document?.status)">
                  {{ getStatusLabel(document?.status) }}
                </span>
              </div>
            </div>
          </div>

          <form [formGroup]="workflowForm" (ngSubmit)="onSubmit()" class="workflow-form">
            <div class="form-group">
              <label>Mẫu quy trình *</label>
              @if (isLoadingTemplates) {
                <div class="loading-templates">Đang tải danh sách quy trình...</div>
              } @else {
                <select formControlName="templateId" class="form-control">
                  <option value="">Chọn mẫu quy trình</option>
                  @for (template of suitableTemplates; track template.id) {
                    <option [value]="template.id">{{ template.name }}</option>
                  }
                </select>
                @if (suitableTemplates.length === 0) {
                  <div class="no-templates">
                    Không có mẫu quy trình phù hợp cho loại văn bản này
                  </div>
                }
              }
            </div>

            <div class="form-group">
              <label>Ghi chú</label>
              <textarea 
                formControlName="notes" 
                placeholder="Nhập ghi chú (tùy chọn)"
                class="form-control"
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="close()">Hủy</button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="workflowForm.invalid || isSubmitting || suitableTemplates.length === 0"
              >
                {{ isSubmitting ? 'Đang gán...' : 'Gán quy trình' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .modal-body {
      padding: 20px;
    }

    .document-info {
      margin-bottom: 24px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .document-info h4 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    .info-grid {
      display: grid;
      gap: 8px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .info-item label {
      font-weight: 500;
      color: #6b7280;
    }

    .info-item span {
      color: #374151;
    }

    .status-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-draft { background: #f3f4f6; color: #6b7280; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-processing { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #d1fae5; color: #065f46; }

    .workflow-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .loading-templates {
      padding: 10px 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      color: #6b7280;
      font-size: 14px;
      font-style: italic;
    }

    .no-templates {
      padding: 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      color: #991b1b;
      font-size: 14px;
      text-align: center;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
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
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      font-size: 16px;
    }
  `]
})
export class AssignWorkflowModalComponent implements OnInit {
  @Input() document?: any;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() workflowAssigned = new EventEmitter<any>();

  workflowForm: FormGroup;
  suitableTemplates: any[] = [];
  isLoadingTemplates = false;
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private documentsService = inject(DocumentsService);

  constructor() {
    this.workflowForm = this.fb.group({
      templateId: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.document) {
      this.loadSuitableTemplates();
    }
  }

  async loadSuitableTemplates(): Promise<void> {
    if (!this.document?.documentType) return;

    this.isLoadingTemplates = true;
    try {
      // This would need to be implemented in the service
      // For now, use mock data
      this.suitableTemplates = [
        { id: 1, name: 'Quy trình phê duyệt văn bản thông thường', description: 'Quy trình chuẩn cho văn bản đi' },
        { id: 2, name: 'Quy trình xử lý văn bản đến', description: 'Quy trình xử lý văn bản đến' },
        { id: 3, name: 'Quy trình nội bộ', description: 'Quy trình cho văn bản nội bộ' },
      ];
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      this.isLoadingTemplates = false;
    }
  }

  onSubmit(): void {
    if (this.workflowForm.valid && this.document) {
      this.isSubmitting = true;
      
      const formData = this.workflowForm.value;
      
      // This would need to be implemented in the service
      console.log('Assigning workflow:', {
        documentId: this.document.id,
        templateId: formData.templateId,
        notes: formData.notes
      });

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.workflowAssigned.emit({
          documentId: this.document.id,
          templateId: formData.templateId,
          success: true
        });
        this.close();
      }, 1000);
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  getDocumentTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      'INCOMING': 'Công văn đến',
      'OUTGOING': 'Công văn đi',
      'INTERNAL': 'Nội bộ'
    };
    return labels[type || ''] || type || '';
  }

  getStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Bản nháp',
      'PENDING': 'Chờ xử lý',
      'PROCESSING': 'Đang xử lý',
      'APPROVED': 'Đã phê duyệt',
      'REJECTED': 'Đã từ chối',
      'COMPLETED': 'Đã hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return labels[status || ''] || status || '';
  }

  getStatusClass(status?: string): string {
    return `status-${status || 'DRAFT'}`;
  }
}
