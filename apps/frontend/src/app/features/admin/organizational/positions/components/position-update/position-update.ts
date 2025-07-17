import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { PositionsService } from '../../../../../../core/services/oraganizational/positions.service';
import { IUpdatePositionInput } from '../../interfaces/position-update.interface';
import { IPosition } from '../../../../../../core/interfaces/oraganizational.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-position-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './position-update.html',
  styleUrl: './position-update.css'
})
export class PositionUpdate implements OnInit {
  @Input() isOpen = false;
  @Input({ required: true }) position!: IPosition;
  @Output() close = new EventEmitter<void>();
  @Output() updatedSuccessfully = new EventEmitter<void>();

  positionUpdateForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private errorHandlerService: ErrorHandlerService,
    private positionsService: PositionsService
  ) {}

  ngOnInit(): void {
    this.positionUpdateForm = this.fb.group({
      positionName: [this.position?.positionName || '', [Validators.required, Validators.maxLength(256)]]
    });
  }

  ngOnChanges(): void {
    if (this.positionUpdateForm && this.position) {
      this.positionUpdateForm.patchValue({
        positionName: this.position.positionName
      });
    }
  }

  onSubmit() {
    if (this.positionUpdateForm.invalid) {
      this.positionUpdateForm.markAllAsTouched();
      return;
    }
    const input: IUpdatePositionInput = {
      id: this.position.id,
      ...this.positionUpdateForm.value
    };
    this.isLoading = true;
    this.positionsService.updatePosition(input)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật chức vụ thành công!');
          this.updatedSuccessfully.emit();
        },
        error: (err) => {
          const msg = this.errorHandlerService.extractGraphQLError(err)?.message || 'Cập nhật chức vụ thất bại!';
          this.toastr.error(msg);
        }
      });
  }

  onFormClose() {
    this.close.emit();
    this.positionUpdateForm.reset({ positionName: this.position?.positionName || '' });
  }
}
