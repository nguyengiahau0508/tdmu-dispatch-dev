import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { DepartmentsService } from '../../../../../../core/services/oraganizational/departments.service';
import { ICreateDepartmentInput } from '../../interfaces/create-department.interfaces';
import { finalize } from 'rxjs';
import { Order } from '../../../../../../core/interfaces/page-options.interface';
import { IDepartment } from '../../../../../../core/interfaces/oraganizational.interface';

@Component({
  selector: 'app-department-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-create.html',
  styleUrl: './department-create.css'
})
export class DepartmentCreate {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() createdSuccessfully = new EventEmitter<void>();
  departmentCreateForm!: FormGroup;
  isLoading = false;
  parentDepartments: IDepartment[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private errorHandlerService: ErrorHandlerService,
    private departmentsService: DepartmentsService
  ) {
    this.departmentCreateForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      parentDepartmentId: [null]
    });
    this.fetchParentDepartments();
  }

  fetchParentDepartments() {
    this.departmentsService.initDepartmentsQuery({ page: 1, take: 100, order: Order.ASC }).subscribe({
      next: (res) => {
        this.parentDepartments = res.data || [];
      }
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.departmentCreateForm.disable();
    if (this.departmentCreateForm.invalid) return;

    const departmentFormData: ICreateDepartmentInput = this.departmentCreateForm.value;
    this.departmentsService.createDepartment(departmentFormData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.departmentCreateForm.enable();
      })
    ).subscribe({
      next: () => {
        this.createdSuccessfully.emit();
        this.toastr.success('Tạo phòng ban thành công');
        this.onFormClose();
      },
      error: (errorResponse) => {
        const { message } = this.errorHandlerService.extractGraphQLError(errorResponse);
        this.toastr.error(message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    });
  }

  onFormClose() {
    this.isOpen = false;
    this.close.emit();
  }
}
