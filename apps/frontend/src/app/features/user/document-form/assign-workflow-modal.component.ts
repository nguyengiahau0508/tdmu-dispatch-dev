import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DocumentsService } from '../../../core/services/dispatch/documents.service';


@Component({
  selector: 'app-assign-workflow-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="assign-workflow__backdrop" (click)="close()">
      <div class="assign-workflow" (click)="$event.stopPropagation()">
        <div class="assign-workflow__header">
          <div class="header__content">
            <h3 class="header__title">Gán quy trình xử lý cho văn bản</h3>
            <p class="header__subtitle">Chọn quy trình phù hợp để xử lý văn bản này</p>
          </div>
          <button class="header__close-btn" (click)="close()" title="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="assign-workflow__content">
          <div class="document-info">
            <h4 class="document-info__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
              </svg>
              Thông tin văn bản
            </h4>
            <div class="document-info__grid">
              <div class="info-item">
                <label class="info-item__label">Tiêu đề:</label>
                <span class="info-item__value">{{ document?.title }}</span>
              </div>
              <div class="info-item">
                <label class="info-item__label">Loại văn bản:</label>
                <span class="info-item__value">
                  <span class="document-type-badge" [class]="'type-' + (document?.documentType || '').toLowerCase()">
                    {{ getDocumentTypeLabel(document?.documentType) }}
                  </span>
                </span>
              </div>
              <div class="info-item">
                <label class="info-item__label">Trạng thái:</label>
                <span class="info-item__value">
                  <span class="status-badge" [class]="getStatusClass(document?.status)">
                    {{ getStatusLabel(document?.status) }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <form [formGroup]="workflowForm" (ngSubmit)="onSubmit()" class="workflow-form">
            <div class="form-section">
              <h4 class="form-section__title">Chọn quy trình</h4>
              
              <div class="form-group">
                <label class="form-group__label">
                  Mẫu quy trình <span class="required">*</span>
                </label>
                @if (isLoadingTemplates) {
                  <div class="form-group__loading">
                    <div class="loading-spinner"></div>
                    <span>Đang tải danh sách quy trình...</span>
                  </div>
                } @else {
                  <select formControlName="templateId" class="form-group__select">
                    <option value="">Chọn mẫu quy trình</option>
                    @for (template of suitableTemplates; track template.id) {
                      <option [value]="template.id">{{ template.name }}</option>
                    }
                  </select>
                  @if (suitableTemplates.length === 0) {
                    <div class="no-templates">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>Không có mẫu quy trình phù hợp cho loại văn bản này</span>
                    </div>
                  }
                }
              </div>

              <div class="form-group">
                <label class="form-group__label">Ghi chú</label>
                <textarea 
                  formControlName="notes" 
                  placeholder="Nhập ghi chú (tùy chọn)"
                  class="form-group__textarea"
                  rows="3"
                ></textarea>
                <div class="form-group__help">Ghi chú sẽ được hiển thị cho người xử lý quy trình</div>
              </div>
            </div>

            <div class="assign-workflow__actions">
              <button type="button" class="btn btn-secondary" (click)="close()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Hủy
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="workflowForm.invalid || isSubmitting || suitableTemplates.length === 0"
              >
                @if (isSubmitting) {
                  <div class="loading-spinner"></div>
                }
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                  <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                  <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
                  <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
                </svg>
                {{ isSubmitting ? 'Đang gán...' : 'Gán quy trình' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Backdrop ===== */
    .assign-workflow__backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 1rem;
      box-sizing: border-box;
      backdrop-filter: blur(4px);
    }

    /* ===== Container chính ===== */
    .assign-workflow {
      background-color: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.25s ease-in-out;
      border: 1px solid var(--color-border);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.98) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* ===== Header ===== */
    .assign-workflow__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 2rem 2rem 1.5rem 2rem;
      border-bottom: 1px solid var(--color-border);
      background: linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-secondary) 100%);
    }

    .header__content {
      flex: 1;
    }

    .header__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }

    .header__subtitle {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .header__close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 1rem;
    }

    .header__close-btn:hover {
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
      transform: scale(1.05);
    }

    /* ===== Content ===== */
    .assign-workflow__content {
      padding: 2rem;
      flex: 1;
    }

    /* ===== Document Info ===== */
    .document-info {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: color-mix(in srgb, var(--color-primary) 3%, var(--color-background-secondary));
      border: 1px solid color-mix(in srgb, var(--color-primary) 15%, var(--color-border));
      border-radius: 12px;
    }

    .document-info__title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .document-info__title svg {
      color: var(--color-primary);
    }

    .document-info__grid {
      display: grid;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 10%, var(--color-border));
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item__label {
      font-weight: 500;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }

    .info-item__value {
      color: var(--color-text-primary);
      font-weight: 500;
      font-size: 0.9rem;
    }

    /* ===== Document Type Badge ===== */
    .document-type-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
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

    /* ===== Status Badge ===== */
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
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
    .status-approved { 
      background: color-mix(in srgb, #10b981 15%, var(--color-background-secondary)); 
      color: #10b981; 
    }
    .status-rejected { 
      background: color-mix(in srgb, #ef4444 15%, var(--color-background-secondary)); 
      color: #ef4444; 
    }
    .status-completed { 
      background: color-mix(in srgb, #059669 15%, var(--color-background-secondary)); 
      color: #059669; 
    }
    .status-cancelled { 
      background: color-mix(in srgb, #6b7280 15%, var(--color-background-secondary)); 
      color: #6b7280; 
    }

    /* ===== Form Section ===== */
    .form-section {
      margin-bottom: 2rem;
    }

    .form-section__title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 1.25rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--color-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-section__title::before {
      content: '';
      width: 4px;
      height: 1.1rem;
      background: var(--color-primary);
      border-radius: 2px;
    }

    /* ===== Form Groups ===== */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group__label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .required {
      color: #dc2626;
      font-weight: 600;
    }

    .form-group__select,
    .form-group__textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .form-group__select:focus,
    .form-group__textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
      background-color: var(--color-background-primary);
    }

    .form-group__textarea {
      resize: vertical;
      min-height: 100px;
      font-family: inherit;
    }

    .form-group__help {
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      margin-top: 0.25rem;
      font-style: italic;
    }

    .form-group__loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }

    /* ===== No Templates ===== */
    .no-templates {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      background: color-mix(in srgb, #ef4444 5%, var(--color-background-secondary));
      border: 1px solid color-mix(in srgb, #ef4444 20%, var(--color-border));
      border-radius: 8px;
      color: #dc2626;
      font-size: 0.9rem;
      text-align: center;
    }

    .no-templates svg {
      color: #dc2626;
    }

    /* ===== Actions ===== */
    .assign-workflow__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem 2rem;
      border-top: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      margin: 0 -2rem -2rem -2rem;
    }

    /* ===== Buttons ===== */
    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    .btn-primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 90%, black);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 40%, transparent);
    }

    .btn-secondary {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
    }

    .btn-secondary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-text-secondary) 90%, black);
      transform: translateY(-1px);
    }

    /* ===== Loading Spinner ===== */
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* ===== Responsive Design ===== */
    @media (max-width: 768px) {
      .assign-workflow {
        max-width: 95%;
        margin: 0.5rem;
      }

      .assign-workflow__header {
        padding: 1.5rem 1.5rem 1rem 1.5rem;
      }

      .assign-workflow__content {
        padding: 1.5rem;
      }

      .assign-workflow__actions {
        padding: 1rem 1.5rem;
        flex-direction: column;
        gap: 0.75rem;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .header__title {
        font-size: 1.5rem;
      }

      .document-info__grid {
        gap: 0.75rem;
      }

      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }

    @media (max-width: 480px) {
      .assign-workflow__backdrop {
        padding: 0.5rem;
      }

      .assign-workflow {
        max-width: 100%;
        margin: 0;
        border-radius: 8px;
      }

      .assign-workflow__header {
        padding: 1rem;
      }

      .assign-workflow__content {
        padding: 1rem;
      }

      .assign-workflow__actions {
        padding: 1rem;
        margin: 0 -1rem -1rem -1rem;
      }
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
