import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskAssignmentService, AssignTaskInput } from '../../../core/services/dispatch/task-assignment.service';

@Component({
  selector: 'app-simple-task-assignment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Giao việc - {{ documentTitle }}</h3>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-group">
            <label for="assignedToUserId">Giao cho:</label>
            <select id="assignedToUserId" formControlName="assignedToUserId" class="form-control">
              <option value="">Chọn người được giao việc</option>
              <option *ngFor="let user of availableUsers" [value]="user.id">
                {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
              </option>
            </select>
            <div *ngIf="taskForm.get('assignedToUserId')?.invalid && taskForm.get('assignedToUserId')?.touched" class="error-message">
              Vui lòng chọn người được giao việc
            </div>
          </div>

          <div class="form-group">
            <label for="taskDescription">Mô tả công việc:</label>
            <textarea 
              id="taskDescription" 
              formControlName="taskDescription" 
              class="form-control" 
              rows="3"
              placeholder="Mô tả chi tiết công việc cần thực hiện...">
            </textarea>
          </div>

          <div class="form-group">
            <label for="deadline">Hạn hoàn thành:</label>
            <input 
              type="datetime-local" 
              id="deadline" 
              formControlName="deadline" 
              class="form-control">
          </div>

          <div class="form-group">
            <label for="instructions">Hướng dẫn thực hiện:</label>
            <textarea 
              id="instructions" 
              formControlName="instructions" 
              class="form-control" 
              rows="3"
              placeholder="Hướng dẫn chi tiết cách thực hiện công việc...">
            </textarea>
          </div>

          <div class="form-group">
            <label for="notes">Ghi chú:</label>
            <textarea 
              id="notes" 
              formControlName="notes" 
              class="form-control" 
              rows="2"
              placeholder="Ghi chú bổ sung...">
            </textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close()">Hủy</button>
            <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid || isSubmitting">
              <span *ngIf="isSubmitting">Đang giao việc...</span>
              <span *ngIf="!isSubmitting">Giao việc</span>
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
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .close-btn:hover {
      color: #333;
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

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }
  `]
})
export class SimpleTaskAssignmentModalComponent {
  @Input() documentId!: number;
  @Input() documentTitle!: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() taskAssigned = new EventEmitter<any>();

  taskForm: FormGroup;
  availableUsers: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }> = [];
  isLoadingUsers = false;
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private taskAssignmentService = inject(TaskAssignmentService);

  constructor() {
    this.taskForm = this.fb.group({
      assignedToUserId: ['', Validators.required],
      taskDescription: [''],
      deadline: [''],
      instructions: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadMockUsers();
  }

  loadMockUsers(): void {
    // Sử dụng mock data để tránh lỗi API
    this.availableUsers = [
      { id: 1, firstName: 'Nguyễn', lastName: 'Văn A', email: 'nguyenvana@tdmu.edu.vn' },
      { id: 2, firstName: 'Trần', lastName: 'Thị B', email: 'tranthib@tdmu.edu.vn' },
      { id: 3, firstName: 'Lê', lastName: 'Văn C', email: 'levanc@tdmu.edu.vn' },
    ];
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const formValues = this.taskForm.value;
    const assignTaskInput: AssignTaskInput = {
      documentId: this.documentId,
      assignedToUserId: parseInt(formValues.assignedToUserId, 10),
      taskDescription: formValues.taskDescription,
      deadline: formValues.deadline,
      instructions: formValues.instructions,
      notes: formValues.notes
    };

    this.taskAssignmentService.assignTask(assignTaskInput).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.taskAssigned.emit({
          success: true,
          task: result,
          message: 'Giao việc thành công!'
        });
        this.close();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error assigning task:', error);
        this.taskAssigned.emit({
          success: false,
          message: 'Có lỗi xảy ra khi giao việc: ' + (error.message || 'Lỗi không xác định')
        });
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}
