import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { PositionsService } from '../../../../../../core/services/oraganizational/positions.service';
import { ICreatePositionInput } from '../../interfaces/position-create.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-position-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './position-create.html',
  styleUrl: './position-create.css'
})
export class PositionCreate implements OnInit {
  @Input() departmentId:number = 1
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() createdSuccessfully = new EventEmitter<void>();

  positionCreateForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private errorHandlerService: ErrorHandlerService,
    private positionsService: PositionsService
  ) {

  }

  ngOnInit(): void {
        this.positionCreateForm = this.fb.group({
      positionName: ['', [Validators.required, Validators.maxLength(256)]],
      departmentId: [this.departmentId, [Validators.required]],
      maxSlots: [1, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.positionCreateForm.invalid) {
      this.positionCreateForm.markAllAsTouched();
      return;
    }
    const input: ICreatePositionInput = this.positionCreateForm.value;
    this.isLoading = true;
    this.positionsService.createPosition(input)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.toastr.success('Tạo chức vụ thành công!');
          this.createdSuccessfully.emit();
          this.positionCreateForm.reset();
        },
        error: (err) => {
          const msg = this.errorHandlerService.extractGraphQLError(err)?.message || 'Tạo chức vụ thất bại!';
          this.toastr.error(msg);
        }
      });
  }

  onFormClose() {
    this.close.emit();
    this.positionCreateForm.reset();
  }
}
