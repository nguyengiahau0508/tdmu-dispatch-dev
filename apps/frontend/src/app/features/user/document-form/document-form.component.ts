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
    <div class="document-form-overlay" (click)="close()">
      <div class="document-form-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Chỉnh sửa văn bản' : 'Tạo văn bản mới' }}</h3>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <form [formGroup]="documentForm" (ngSubmit)="onSubmit()" class="form-content">
          <div class="form-group">
            <label for="title">Tiêu đề *</label>
            <input 
              type="text" 
              id="title"
              formControlName="title"
              class="form-control"
              placeholder="Nhập tiêu đề văn bản"
            />
            @if (documentForm.get('title')?.invalid && documentForm.get('title')?.touched) {
              <div class="error-message">Tiêu đề là bắt buộc</div>
            }
          </div>

          <div class="form-group">
            <label for="documentType">Loại văn bản *</label>
            <select 
              id="documentType"
              formControlName="documentType"
              class="form-control"
            >
              <option value="">Chọn loại văn bản</option>
              <option value="INCOMING">Công văn đến</option>
              <option value="OUTGOING">Công văn đi</option>
              <option value="INTERNAL">Nội bộ</option>
            </select>
            @if (documentForm.get('documentType')?.invalid && documentForm.get('documentType')?.touched) {
              <div class="error-message">Loại văn bản là bắt buộc</div>
            }
          </div>

          <div class="form-group">
            <label for="documentCategoryId">Nhóm văn bản *</label>
            @if (isLoadingCategories) {
              <div class="loading-categories">Đang tải nhóm văn bản...</div>
            } @else {
              <select 
                id="documentCategoryId"
                formControlName="documentCategoryId"
                class="form-control"
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
              <div class="error-message">Nhóm văn bản là bắt buộc</div>
            }
            <button type="button" class="btn btn-secondary btn-sm" (click)="testDocumentCategories()" style="margin-top: 8px;">
              Test API
            </button>
          </div>

          <div class="form-group">
            <label for="content">Nội dung</label>
            <textarea 
              id="content"
              formControlName="content"
              class="form-control"
              rows="4"
              placeholder="Nhập nội dung văn bản"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="status">Trạng thái</label>
            <select 
              id="status"
              formControlName="status"
              class="form-control"
            >
              <option value="DRAFT">Bản nháp</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="APPROVED">Đã phê duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div class="form-group">
            <label for="workflowTemplateId">Quy trình xét duyệt</label>
            @if (isLoadingTemplates) {
              <div class="loading-templates">Đang tải quy trình...</div>
            } @else {
              <select 
                id="workflowTemplateId"
                formControlName="workflowTemplateId"
                class="form-control"
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
            <small class="form-text">Nếu không chọn, hệ thống sẽ tự động chọn quy trình mặc định</small>
          </div>

          <div class="form-group">
            <label for="file">File đính kèm</label>
            <input 
              type="file" 
              id="file"
              (change)="onFileSelected($event)"
              class="form-control"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            @if (selectedFile) {
              <div class="file-info">
                <span>{{ selectedFile.name }}</span>
                <button type="button" class="remove-file-btn" (click)="removeFile()">Xóa</button>
              </div>
            }
          </div>

          <div class="form-actions">
            @if (isEditMode && document) {
              <button 
                type="button" 
                class="btn btn-info" 
                (click)="showTaskAssignmentModal = true"
                title="Giao việc cho nhân viên"
              >
                <img src="/icons/assignment.svg" alt="Giao việc" style="width: 16px; height: 16px; margin-right: 8px;">
                Giao việc
              </button>
            }
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
                <span class="loading-spinner"></span>
              }
              {{ isEditMode ? 'Cập nhật' : 'Tạo' }}
            </button>
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
    .document-form-overlay {
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

    .document-form-modal {
      background: var(--color-background-primary);
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
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
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .close-btn:hover {
      color: var(--color-text-primary);
    }

    .form-content {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 14px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
    }

    .error-message {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }

    .loading-categories {
      padding: 10px 12px;
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-text-secondary);
      font-size: 14px;
      font-style: italic;
    }

    .file-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--color-background-secondary);
      border-radius: 6px;
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    .remove-file-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--color-background-disabled);
      color: var(--color-text-secondary);
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-secondary {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--color-text-on-primary);
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
    this.loadDocumentCategories();
    this.loadWorkflowTemplates();
    
    if (this.document) {
      this.isEditMode = true;
      this.documentForm.patchValue({
        title: this.document.title,
        documentType: this.document.documentType,
        documentCategoryId: this.document.documentCategoryId,
        content: this.document.content,
        status: this.document.status
      });
    } else if (this.documentType) {
      this.documentForm.patchValue({
        documentType: this.documentType
      });
    }

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
    if (this.documentForm.invalid) {
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
      const updateInput: UpdateDocumentInput = {
        id: this.document.id,
        ...processedValues
      };
      
      this.documentsService.updateDocument(updateInput).subscribe({
        next: (updatedDocument) => {
          this.saved.emit(updatedDocument);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating document:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      const createInput: CreateDocumentInput = processedValues;
      
      console.log('Creating document with input:', createInput);
      
      this.documentsService.createDocument(createInput, this.selectedFile || undefined).subscribe({
        next: (createdDocument) => {
          this.saved.emit(createdDocument);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating document:', error);
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
