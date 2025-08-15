import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IWorkflowTemplate, IUpdateWorkflowTemplateInput } from '../../../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';
import { WorkflowTemplatesService } from '../../../../../core/modules/workflow/workflow-templates/workflow-templates.service';

@Component({
  selector: 'app-workflow-template-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WorkflowTemplatesService],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Cập nhật quy trình</h2>
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
                Đang cập nhật...
              } @else {
                Cập nhật quy trình
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
      background: white;
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
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
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
      color: #333;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
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
      background: #007bff;
      color: white;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }
  `]
})
export class WorkflowTemplateUpdate implements OnInit {
  @Input() isOpen = false;
  @Input() workflowTemplate: IWorkflowTemplate | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() updatedSuccessfully = new EventEmitter<void>();

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

  ngOnInit() {
    if (this.workflowTemplate) {
      this.form.patchValue({
        name: this.workflowTemplate.name,
        description: this.workflowTemplate.description || '',
        isActive: this.workflowTemplate.isActive
      });
    }
  }

  close() {
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.form.valid && this.workflowTemplate) {
      this.isSubmitting = true;
      const input: IUpdateWorkflowTemplateInput = {
        id: this.workflowTemplate.id,
        ...this.form.value
      };

      this.workflowTemplatesService.update(input).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.updatedSuccessfully.emit();
          this.close();
        },
        error: (error: any) => {
          this.isSubmitting = false;
          console.error('Error updating workflow template:', error);
        }
      });
    }
  }
}
