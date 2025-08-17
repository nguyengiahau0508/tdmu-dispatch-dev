import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskAssignmentService } from '../../../core/services/dispatch/task-assignment.service';

@Component({
  selector: 'app-task-assignment-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="btn btn-primary" 
      (click)="openAssignTaskModal()"
      [disabled]="!canAssignTask">
      <i class="fas fa-tasks"></i> Giao việc
    </button>
  `,
  styles: [`
    .btn {
      padding: 8px 16px;
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
  `]
})
export class TaskAssignmentButtonComponent {
  @Input() documentId!: number;
  @Input() documentTitle!: string;
  @Input() canAssignTask: boolean = true;
  @Output() assignTaskClicked = new EventEmitter<void>();

  private taskAssignmentService = inject(TaskAssignmentService);

  openAssignTaskModal(): void {
    this.assignTaskClicked.emit();
  }
}
