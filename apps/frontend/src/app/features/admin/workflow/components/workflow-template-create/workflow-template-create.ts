import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICreateWorkflowTemplateInput } from '../../../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';
import { WorkflowTemplatesService } from '../../../../../core/modules/workflow/workflow-templates/workflow-templates.service';

@Component({
  selector: 'app-workflow-template-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WorkflowTemplatesService],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Tạo quy trình mới</h2>
          <button class="close-btn" (click)="close()">×</button>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-group">
            <label for="name">Tên quy trình *</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name" 
              placeholder="Nhập tên quy trình"
              [class.error]="form.get('name')?.invalid && form.get('name')?.touched"
            />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <span class="error-message">Tên quy trình là bắt buộc</span>
            }
          </div>

          <div class="form-group">
            <label for="description">Mô tả</label>
            <textarea 
              id="description" 
              formControlName="description" 
              placeholder="Nhập mô tả quy trình"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="isActive" />
              <span class="checkmark"></span>
              Kích hoạt quy trình
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="close()">Hủy</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting">
              @if (isSubmitting) {
                Đang tạo...
              } @else {
                Tạo quy trình
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
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
      width: 90%;
      max-width: 500px;
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

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .close-btn:hover {
      color: var(--color-text-primary);
    }

    .modal-body {
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

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 14px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
    }

    .form-group input.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: normal;
      color: var(--color-text-primary);
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-primary:disabled {
      background: var(--color-background-disabled);
      color: var(--color-text-secondary);
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
    }
  `]
})
export class WorkflowTemplateCreate {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() createdSuccessfully = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private workflowTemplatesService: WorkflowTemplatesService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      isActive: [true]
    });
  }

  close() {
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      const input: ICreateWorkflowTemplateInput = this.form.value;

      this.workflowTemplatesService.create(input).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.createdSuccessfully.emit();
          this.close();
          this.form.reset({ isActive: true });
        },
        error: (error: any) => {
          this.isSubmitting = false;
          console.error('Error creating workflow template:', error);
        }
      });
    }
  }
}
