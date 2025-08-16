import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface DocumentProcessingInfo {
  documentId: number;
  documentTitle: string;
  documentType: string;
  documentCategory: string;
  status: string;
  createdAt: Date;
  workflowInstanceId?: number;
  currentStepId?: number;
  currentStepName?: string;
  workflowStatus?: string;
  requiresAction: boolean;
  actionType?: string;
  deadline?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

interface DialogData {
  document: DocumentProcessingInfo;
  action: string;
}

@Component({
  selector: 'app-document-action-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon [class]="getActionIcon(data.action)">{{ getActionIcon(data.action) }}</mat-icon>
        {{ getActionTitle(data.action) }}
      </h2>

      <mat-dialog-content>
        <div class="document-info">
          <h3>{{ data.document.documentTitle }}</h3>
          <div class="document-meta">
            <span class="meta-item">
              <mat-icon>description</mat-icon>
              {{ data.document.documentType }}
            </span>
            <span class="meta-item">
              <mat-icon>category</mat-icon>
              {{ data.document.documentCategory }}
            </span>
            <span class="meta-item">
              <mat-icon>schedule</mat-icon>
              {{ data.document.createdAt | date:'dd/MM/yyyy' }}
            </span>
          </div>

          <div class="priority-info" *ngIf="data.document.priority">
            <mat-chip [color]="getPriorityColor(data.document.priority)" selected>
              {{ getPriorityLabel(data.document.priority) }}
            </mat-chip>
          </div>

          <div class="current-step" *ngIf="data.document.currentStepName">
            <span class="label">Bước hiện tại:</span>
            <span class="value">{{ data.document.currentStepName }}</span>
          </div>

          <div class="deadline-info" *ngIf="data.document.deadline">
            <span class="label">Deadline:</span>
            <span class="value" [class.overdue]="isOverdue(data.document.deadline)">
              {{ data.document.deadline | date:'dd/MM/yyyy HH:mm' }}
            </span>
          </div>
        </div>

        <form [formGroup]="actionForm" class="action-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ghi chú</mat-label>
            <textarea matInput formControlName="notes" 
                      placeholder="Nhập ghi chú cho action này (tùy chọn)"
                      rows="3"></textarea>
            <mat-hint>Ghi chú sẽ được lưu trong lịch sử xử lý</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" 
                          *ngIf="data.action === 'TRANSFER'">
            <mat-label>Chuyển tiếp cho</mat-label>
            <mat-select formControlName="transferToUserId">
              <mat-option value="">Chọn người nhận</mat-option>
              <mat-option *ngFor="let user of availableUsers" [value]="user.id">
                {{ user.name }} ({{ user.role }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="actionForm.get('transferToUserId')?.hasError('required')">
              Vui lòng chọn người nhận
            </mat-error>
          </mat-form-field>

          <div class="confirmation-message" *ngIf="data.action === 'REJECT'">
            <mat-icon color="warn">warning</mat-icon>
            <span>Bạn có chắc chắn muốn từ chối văn bản này?</span>
          </div>

          <div class="confirmation-message" *ngIf="data.action === 'APPROVE'">
            <mat-icon color="primary">check_circle</mat-icon>
            <span>Bạn sẽ phê duyệt văn bản này và chuyển sang bước tiếp theo</span>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Hủy
        </button>
        <button mat-raised-button 
                [color]="getActionButtonColor(data.action)"
                [disabled]="actionForm.invalid || processing"
                (click)="onConfirm()">
          <mat-icon>{{ getActionIcon(data.action) }}</mat-icon>
          <span *ngIf="!processing">{{ getActionButtonText(data.action) }}</span>
          <span *ngIf="processing">Đang xử lý...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 600px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #333;
    }

    .document-info {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .document-info h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .document-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 10px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.9rem;
      color: #666;
    }

    .meta-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .priority-info {
      margin-bottom: 10px;
    }

    .current-step, .deadline-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #333;
    }

    .value.overdue {
      color: #f44336;
      font-weight: bold;
    }

    .action-form {
      margin-top: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    .confirmation-message {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 0.9rem;
    }

    .confirmation-message mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }

    mat-dialog-actions button {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .approve-icon { color: #4caf50; }
    .reject-icon { color: #f44336; }
    .transfer-icon { color: #ff9800; }
    .complete-icon { color: #2196f3; }
  `]
})
export class DocumentActionDialogComponent {
  actionForm: FormGroup;
  processing = false;
  availableUsers = [
    { id: 1, name: 'Nguyễn Văn A', role: 'Trưởng phòng' },
    { id: 2, name: 'Trần Thị B', role: 'Phó phòng' },
    { id: 3, name: 'Lê Văn C', role: 'Chuyên viên' },
  ];

  constructor(
    private dialogRef: MatDialogRef<DocumentActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    this.actionForm = this.fb.group({
      notes: [''],
      transferToUserId: [''],
    });

    // Add validation for TRANSFER action
    if (data.action === 'TRANSFER') {
      this.actionForm.get('transferToUserId')?.setValidators([Validators.required]);
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'APPROVE': return 'check';
      case 'REJECT': return 'close';
      case 'TRANSFER': return 'forward';
      case 'COMPLETE': return 'done_all';
      default: return 'help';
    }
  }

  getActionTitle(action: string): string {
    switch (action) {
      case 'APPROVE': return 'Phê duyệt Văn bản';
      case 'REJECT': return 'Từ chối Văn bản';
      case 'TRANSFER': return 'Chuyển tiếp Văn bản';
      case 'COMPLETE': return 'Hoàn thành Văn bản';
      default: return 'Xử lý Văn bản';
    }
  }

  getActionButtonText(action: string): string {
    switch (action) {
      case 'APPROVE': return 'Phê duyệt';
      case 'REJECT': return 'Từ chối';
      case 'TRANSFER': return 'Chuyển tiếp';
      case 'COMPLETE': return 'Hoàn thành';
      default: return 'Xác nhận';
    }
  }

  getActionButtonColor(action: string): string {
    switch (action) {
      case 'APPROVE': return 'primary';
      case 'REJECT': return 'warn';
      case 'TRANSFER': return 'accent';
      case 'COMPLETE': return 'primary';
      default: return 'primary';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'warn';
      case 'HIGH': return 'accent';
      case 'MEDIUM': return 'primary';
      case 'LOW': return '';
      default: return '';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'KHẨN CẤP';
      case 'HIGH': return 'CAO';
      case 'MEDIUM': return 'TRUNG BÌNH';
      case 'LOW': return 'THẤP';
      default: return priority;
    }
  }

  isOverdue(deadline: Date | undefined): boolean {
    if (!deadline) return false;
    return new Date() > deadline;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onConfirm(): Promise<void> {
    if (this.actionForm.invalid) return;

    this.processing = true;
    try {
      const formValue = this.actionForm.value;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        documentId: this.data.document.documentId,
        actionType: this.data.action,
        notes: formValue.notes,
        transferToUserId: formValue.transferToUserId,
      };
      
      this.dialogRef.close(result);
    } catch (error) {
      console.error('Error processing action:', error);
      this.processing = false;
    }
  }
}
