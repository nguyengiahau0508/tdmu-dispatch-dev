import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WorkflowInstancesService } from '../../../../../core/modules/workflow/workflow-instances/workflow-instances.service';
import { WorkflowTemplatesService } from '../../../../../core/modules/workflow/workflow-templates/workflow-templates.service';
import { ICreateWorkflowInstanceInput } from '../../../../../core/modules/workflow/workflow-instances/interfaces/workflow-instance.interfaces';
import { IWorkflowTemplate } from '../../../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';

@Component({
  selector: 'app-workflow-instance-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WorkflowInstancesService, WorkflowTemplatesService],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Tạo quy trình xử lý mới</h3>
          <button class="btn btn-icon" (click)="close()">✕</button>
        </div>
        
        <form [formGroup]="instanceForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-group">
            <label>Mẫu quy trình *</label>
            <select formControlName="templateId" class="form-control">
              <option value="">Chọn mẫu quy trình</option>
              @for (template of activeTemplates; track template.id) {
                <option [value]="template.id">{{ template.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label>ID Công văn *</label>
            <input 
              type="number" 
              formControlName="documentId" 
              placeholder="Nhập ID công văn"
              class="form-control"
            />
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
            <button type="submit" class="btn btn-primary" [disabled]="instanceForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Đang tạo...' : 'Tạo quy trình' }}
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
      max-width: 500px;
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

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
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
export class WorkflowInstanceCreate implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() createdSuccessfully = new EventEmitter<void>();

  instanceForm: FormGroup;
  activeTemplates: IWorkflowTemplate[] = [];
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private workflowInstancesService = inject(WorkflowInstancesService);
  private workflowTemplatesService = inject(WorkflowTemplatesService);

  constructor() {
    this.instanceForm = this.fb.group({
      templateId: ['', Validators.required],
      documentId: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadActiveTemplates();
  }

  loadActiveTemplates(): void {
    this.workflowTemplatesService.findAll().subscribe({
      next: (templates) => {
        this.activeTemplates = templates.filter(template => template.isActive);
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.instanceForm.valid) {
      this.isSubmitting = true;
      
      const input: ICreateWorkflowInstanceInput = {
        templateId: this.instanceForm.value.templateId,
        documentId: this.instanceForm.value.documentId,
        notes: this.instanceForm.value.notes || undefined
      };

      this.workflowInstancesService.create(input).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.instanceForm.reset();
          this.createdSuccessfully.emit();
          this.closeModal.emit();
        },
        error: (error) => {
          console.error('Error creating workflow instance:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
