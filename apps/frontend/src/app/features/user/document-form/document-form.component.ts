import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentsService, Document, CreateDocumentInput, UpdateDocumentInput } from '../../../core/services/dispatch/documents.service';
import { DocumentCategoryService } from '../../../core/services/dispatch/document-category.service';
import { WorkflowTemplatesService, WorkflowTemplate } from '../../../core/services/dispatch/workflow-templates.service';
import { FileService } from '../../../core/services/file.service';
import { IDocumentCategory } from '../../../core/interfaces/dispatch.interface';
import { TaskAssignmentService } from '../../../core/services/dispatch/task-assignment.service';
import { TaskAssignmentModalComponent } from '../task-assignment/task-assignment-modal.component';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TaskAssignmentModalComponent],
  template: `
    <div class="document-form__backdrop" (click)="close()">
      <div class="document-form" (click)="$event.stopPropagation()">
        <div class="document-form__header">
          <div class="header__content">
            <h3 class="header__title">{{ isEditMode ? 'Chỉnh sửa văn bản' : 'Tạo văn bản mới' }}</h3>
            <p class="header__subtitle">{{ isEditMode ? 'Cập nhật thông tin văn bản' : 'Tạo văn bản mới trong hệ thống' }}</p>
          </div>
          <button class="header__close-btn" (click)="close()" title="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form [formGroup]="documentForm" (ngSubmit)="onSubmit()" class="document-form__content">
          <div class="form-section">
            <h4 class="form-section__title">Thông tin cơ bản</h4>
            
            <div class="form-group">
              <label for="title" class="form-group__label">
                Tiêu đề văn bản <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="title"
                formControlName="title"
                class="form-group__input"
                placeholder="Nhập tiêu đề văn bản"
              />
              @if (documentForm.get('title')?.invalid && documentForm.get('title')?.touched) {
                <div class="form-group__error">Tiêu đề là bắt buộc</div>
              }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="documentType" class="form-group__label">
                  Loại văn bản <span class="required">*</span>
                </label>
                <select 
                  id="documentType"
                  formControlName="documentType"
                  class="form-group__select"
                >
                  <option value="">Chọn loại văn bản</option>
                  <option value="INCOMING">📥 Công văn đến</option>
                  <option value="OUTGOING">📤 Công văn đi</option>
                  <option value="INTERNAL">🏢 Nội bộ</option>
                </select>
                @if (documentForm.get('documentType')?.invalid && documentForm.get('documentType')?.touched) {
                  <div class="form-group__error">Loại văn bản là bắt buộc</div>
                }
              </div>

              <div class="form-group">
                <label for="status" class="form-group__label">Trạng thái</label>
                <select 
                  id="status"
                  formControlName="status"
                  class="form-group__select"
                >
                  <option value="DRAFT">📝 Bản nháp</option>
                  <option value="PENDING">⏳ Chờ xử lý</option>
                  <option value="PROCESSING">🔄 Đang xử lý</option>
                  <option value="APPROVED">✅ Đã phê duyệt</option>
                  <option value="REJECTED">❌ Đã từ chối</option>
                  <option value="COMPLETED">🏁 Đã hoàn thành</option>
                  <option value="CANCELLED">🚫 Đã hủy</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="documentCategoryId" class="form-group__label">
                Nhóm văn bản <span class="required">*</span>
              </label>
              @if (isLoadingCategories) {
                <div class="form-group__loading">
                  <div class="loading-spinner"></div>
                  <span>Đang tải nhóm văn bản...</span>
                </div>
              } @else {
                <select 
                  id="documentCategoryId"
                  formControlName="documentCategoryId"
                  class="form-group__select"
                >
                  <option value="">Chọn nhóm văn bản</option>
                  @for (category of documentCategories; track category.id) {
                    <option [value]="category.id">{{ category.name }}</option>
                  }
                  @if (documentCategories.length === 0) {
                    <option value="" disabled>Không có nhóm văn bản nào</option>
                  }
                </select>
              }
              @if (documentForm.get('documentCategoryId')?.invalid && documentForm.get('documentCategoryId')?.touched) {
                <div class="form-group__error">Nhóm văn bản là bắt buộc</div>
              }
            </div>
          </div>

          <div class="form-section">
            <h4 class="form-section__title">Nội dung và quy trình</h4>
            
            <div class="form-group">
              <label for="content" class="form-group__label">Nội dung văn bản</label>
              <textarea 
                id="content"
                formControlName="content"
                class="form-group__textarea"
                rows="4"
                placeholder="Nhập nội dung văn bản..."
              ></textarea>
            </div>

            <div class="form-group">
              <label for="workflowTemplateId" class="form-group__label">Quy trình xét duyệt</label>
              @if (isLoadingTemplates) {
                <div class="form-group__loading">
                  <div class="loading-spinner"></div>
                  <span>Đang tải quy trình...</span>
                </div>
              } @else {
                <select 
                  id="workflowTemplateId"
                  formControlName="workflowTemplateId"
                  class="form-group__select"
                >
                  <option value="">Chọn quy trình xét duyệt (tùy chọn)</option>
                  @for (template of workflowTemplates; track template.id) {
                    <option [value]="template.id">{{ template.name }}</option>
                  }
                  @if (workflowTemplates.length === 0) {
                    <option value="" disabled>Không có quy trình nào</option>
                  }
                </select>
              }
              <div class="form-group__help">Nếu không chọn, hệ thống sẽ tự động chọn quy trình mặc định</div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="form-section__title">File đính kèm</h4>
            
            <div class="form-group">
              <label for="file" class="form-group__label">File đính kèm</label>
              <div class="file-upload">
                <input 
                  type="file" 
                  id="file"
                  (change)="onFileSelected($event)"
                  class="file-upload__input"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <label for="file" class="file-upload__label">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Chọn file hoặc kéo thả vào đây</span>
                  <small>Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, TXT</small>
                </label>
              </div>
              @if (selectedFile) {
                <div class="file-info">
                  <div class="file-info__content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                    <div class="file-info__details">
                      <span class="file-info__name">{{ selectedFile.name }}</span>
                      <span class="file-info__size">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</span>
                    </div>
                  </div>
                  <button type="button" class="file-info__remove" (click)="removeFile()" title="Xóa file">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>

          <div class="document-form__actions">
            @if (isEditMode && document) {
              <button 
                type="button" 
                class="btn btn-info" 
                (click)="showTaskAssignmentModal = true"
                title="Giao việc cho nhân viên"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Giao việc
              </button>
            }
            <div class="actions__group">
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="close()"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="documentForm.invalid || isSubmitting"
              >
                @if (isSubmitting) {
                  <div class="loading-spinner"></div>
                }
                {{ isEditMode ? 'Cập nhật' : 'Tạo văn bản' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Task Assignment Modal -->
    @if (showTaskAssignmentModal && document) {
      <app-task-assignment-modal
        [documentId]="document.id"
        (taskAssigned)="onTaskAssigned($event)"
        (cancelled)="showTaskAssignmentModal = false"
      ></app-task-assignment-modal>
    }
  `,
  styles: [`
    /* ===== Backdrop ===== */
    .document-form__backdrop {
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
    .document-form {
      background-color: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      width: 100%;
      max-width: 800px;
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
    .document-form__header {
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
    .document-form__content {
      padding: 2rem;
      flex: 1;
    }

    /* ===== Form Sections ===== */
    .form-section {
      margin-bottom: 2rem;
    }

    .form-section:last-child {
      margin-bottom: 0;
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

    .form-group__input,
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

    .form-group__input:focus,
    .form-group__select:focus,
    .form-group__textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
      background-color: var(--color-background-primary);
    }

    .form-group__textarea {
      resize: vertical;
      min-height: 120px;
      font-family: inherit;
    }

    .form-group__error {
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .form-group__error::before {
      content: '⚠️';
      font-size: 0.75rem;
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

    /* ===== Form Row ===== */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    /* ===== File Upload ===== */
    .file-upload {
      position: relative;
    }

    .file-upload__input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    .file-upload__label {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      border: 2px dashed var(--color-border);
      border-radius: 8px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      gap: 0.5rem;
    }

    .file-upload__label:hover {
      border-color: var(--color-primary);
      background-color: color-mix(in srgb, var(--color-primary) 5%, var(--color-background-secondary));
      color: var(--color-primary);
    }

    .file-upload__label svg {
      color: var(--color-text-secondary);
      transition: color 0.2s ease;
    }

    .file-upload__label:hover svg {
      color: var(--color-primary);
    }

    .file-upload__label span {
      font-weight: 500;
      font-size: 0.95rem;
    }

    .file-upload__label small {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    /* ===== File Info ===== */
    .file-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: color-mix(in srgb, var(--color-primary) 5%, var(--color-background-secondary));
      border: 1px solid color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
      border-radius: 8px;
      margin-top: 0.75rem;
    }

    .file-info__content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .file-info__content svg {
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .file-info__details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .file-info__name {
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: 0.9rem;
    }

    .file-info__size {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    .file-info__remove {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .file-info__remove:hover {
      background-color: #dc2626;
      color: white;
      transform: scale(1.05);
    }

    /* ===== Actions ===== */
    .document-form__actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-top: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      gap: 1rem;
    }

    .actions__group {
      display: flex;
      gap: 0.75rem;
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

    .btn-info {
      background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-secondary));
      color: var(--color-primary);
      border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
    }

    .btn-info:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 25%, var(--color-background-secondary));
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
      .document-form {
        max-width: 95%;
        margin: 0.5rem;
      }

      .document-form__header {
        padding: 1.5rem 1.5rem 1rem 1.5rem;
      }

      .document-form__content {
        padding: 1.5rem;
      }

      .document-form__actions {
        padding: 1rem 1.5rem;
        flex-direction: column;
        gap: 1rem;
      }

      .actions__group {
        width: 100%;
        justify-content: stretch;
      }

      .btn {
        flex: 1;
        justify-content: center;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .header__title {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .document-form__backdrop {
        padding: 0.5rem;
      }

      .document-form {
        max-width: 100%;
        margin: 0;
        border-radius: 8px;
      }

      .document-form__header {
        padding: 1rem;
      }

      .document-form__content {
        padding: 1rem;
      }

      .document-form__actions {
        padding: 1rem;
      }
    }
  `]
})
export class DocumentFormComponent implements OnInit {
  @Input() document?: Document;
  @Input() documentType?: 'INCOMING' | 'OUTGOING' | 'INTERNAL';
  @Output() saved = new EventEmitter<Document>();
  @Output() cancelled = new EventEmitter<void>();

  documentForm: FormGroup;
  documentCategories: IDocumentCategory[] = [];
  workflowTemplates: WorkflowTemplate[] = [];
  selectedFile: File | null = null;
  isSubmitting = false;
  showTaskAssignmentModal = false;
  isEditMode = false;
  isLoadingCategories = false;
  isLoadingTemplates = false;

  constructor(
    private fb: FormBuilder,
    private documentsService: DocumentsService,
    private documentCategoryService: DocumentCategoryService,
    private workflowTemplatesService: WorkflowTemplatesService,
    private fileService: FileService,
    private taskAssignmentService: TaskAssignmentService
  ) {
    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      documentType: ['', Validators.required],
      documentCategoryId: ['', Validators.required],
      content: [''],
      status: ['DRAFT'],
      workflowTemplateId: ['']
    });
  }

  ngOnInit(): void {
    console.log('=== DocumentFormComponent ngOnInit ===');
    console.log('Input document:', this.document);
    console.log('Input documentType:', this.documentType);
    
    this.loadDocumentCategories();
    this.loadWorkflowTemplates();
    
    if (this.document) {
      this.isEditMode = true;
      console.log('✅ Setting edit mode - document provided');
      console.log('Document ID:', this.document.id);
      console.log('Document title:', this.document.title);
      
      this.documentForm.patchValue({
        title: this.document.title,
        documentType: this.document.documentType,
        documentCategoryId: this.document.documentCategoryId,
        content: this.document.content,
        status: this.document.status
      });
    } else if (this.documentType) {
      this.isEditMode = false;
      console.log('✅ Setting create mode - only documentType provided');
      
      this.documentForm.patchValue({
        documentType: this.documentType
      });
    } else {
      this.isEditMode = false;
      console.log('✅ Setting create mode - no document or documentType');
    }
    
    console.log('Final isEditMode:', this.isEditMode);

    // Debug: Log form value changes
    this.documentForm.valueChanges.subscribe(values => {
      console.log('Form values changed:', values);
    });
  }

  loadDocumentCategories(): void {
    this.isLoadingCategories = true;
    this.documentCategoryService.getAllDocumentCategories().subscribe({
      next: (categories) => {
        this.documentCategories = categories || [];
        console.log('Loaded document categories:', this.documentCategories);
        this.isLoadingCategories = false;
      },
      error: (error: any) => {
        console.error('Error loading document categories:', error);
        // Fallback to empty array
        this.documentCategories = [];
        this.isLoadingCategories = false;
      }
    });
  }

  loadWorkflowTemplates(): void {
    this.isLoadingTemplates = true;
    this.workflowTemplatesService.getActiveWorkflowTemplates().subscribe({
      next: (templates) => {
        this.workflowTemplates = templates || [];
        console.log('Loaded workflow templates:', this.workflowTemplates);
        this.isLoadingTemplates = false;
      },
      error: (error: any) => {
        console.error('Error loading workflow templates:', error);
        // Fallback to empty array
        this.workflowTemplates = [];
        this.isLoadingTemplates = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    console.log('=== DocumentFormComponent onSubmit ===');
    console.log('isEditMode:', this.isEditMode);
    console.log('document:', this.document);
    console.log('documentForm.valid:', this.documentForm.valid);
    console.log('documentForm.value:', this.documentForm.value);
    
    if (this.documentForm.invalid) {
      console.log('❌ Form is invalid, returning');
      return;
    }

    this.isSubmitting = true;

    // Convert form values to proper types
    const formValues = this.documentForm.value;
    const processedValues = {
      ...formValues,
      documentCategoryId: parseInt(formValues.documentCategoryId, 10),
      workflowTemplateId: formValues.workflowTemplateId ? parseInt(formValues.workflowTemplateId, 10) : undefined
    };

    console.log('Processed values:', processedValues);

    // Validate that documentCategoryId is a valid number
    if (isNaN(processedValues.documentCategoryId)) {
      console.error('Invalid documentCategoryId:', formValues.documentCategoryId);
      this.isSubmitting = false;
      return;
    }

    // Validate workflowTemplateId if provided
    if (processedValues.workflowTemplateId && isNaN(processedValues.workflowTemplateId)) {
      console.error('Invalid workflowTemplateId:', formValues.workflowTemplateId);
      this.isSubmitting = false;
      return;
    }

    if (this.isEditMode && this.document) {
      console.log('✅ Executing UPDATE logic');
      const updateInput: UpdateDocumentInput = {
        id: this.document.id,
        ...processedValues
      };
      
      console.log('Update input:', updateInput);
      
      this.documentsService.updateDocument(updateInput).subscribe({
        next: (updatedDocument) => {
          console.log('✅ Update successful:', updatedDocument);
          this.saved.emit(updatedDocument);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('❌ Error updating document:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      console.log('✅ Executing CREATE logic');
      const createInput: CreateDocumentInput = processedValues;
      
      console.log('Create input:', createInput);
      
      this.documentsService.createDocument(createInput, this.selectedFile || undefined).subscribe({
        next: (createdDocument) => {
          console.log('✅ Create successful:', createdDocument);
          this.saved.emit(createdDocument);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('❌ Error creating document:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  close(): void {
    this.cancelled.emit();
  }

  // Debug method to test document categories API
  testDocumentCategories(): void {
    console.log('Testing document categories API...');
    this.documentCategoryService.getAllDocumentCategories().subscribe({
      next: (categories) => {
        console.log('Document categories received:', categories);
      },
      error: (error) => {
        console.error('Document categories error:', error);
      }
    });
  }

  openTaskAssignment(): void {
    if (this.document) {
      // Navigate to task management with document ID
      window.open(`/task-management?documentId=${this.document.id}`, '_blank');
    }
  }

  onTaskAssigned(result: any): void {
    this.showTaskAssignmentModal = false;
    // Show success message
    alert('Giao việc thành công!');
    console.log('Task assigned:', result);
  }
}
