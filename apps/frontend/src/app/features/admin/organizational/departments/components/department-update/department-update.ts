import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentsService } from '../../../../../../core/services/oraganizational/departments.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { IUpdateDepartmentInput } from '../../interfaces/update-department.interfaces';
import { finalize } from 'rxjs';
import { Order } from '../../../../../../core/interfaces/page-options.interface';
import { IDepartment } from '../../../../../../core/interfaces/oraganizational.interface';

@Component({
  selector: 'app-department-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-update.html',
  styleUrl: './department-update.css'
})
export class DepartmentUpdate implements OnInit {
  @Input() isOpen = false;
  @Input({ required: true }) department!: IDepartment;
  @Output() close = new EventEmitter<void>();
  @Output() updatedSuccessfully = new EventEmitter<void>();
  departmentUpdateForm!: FormGroup;
  isLoading = false;
  parentDepartments: IDepartment[] = [];

  constructor(
    private departmentsService: DepartmentsService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.fetchParentDepartments();
  }

  ngOnInit(): void {
    this.departmentUpdateForm = this.fb.group({
      name: [this.department.name, [Validators.required, Validators.maxLength(255)]],
      description: [this.department.description],
      parentDepartmentId: [this.department.parentDepartment?.id]
    });
  }

  fetchParentDepartments() {
    this.departmentsService.initDepartmentsQuery({ page: 1, take: 100, order: Order.ASC }).subscribe({
      next: (res) => {
        this.parentDepartments = res.data || [];
      }
    });
  }

  onSubmit(): void {
    if (this.departmentUpdateForm.invalid) return;
    this.isLoading = true;
    this.departmentUpdateForm.disable();
    const departmentFormData: IUpdateDepartmentInput = {
      ...this.departmentUpdateForm.value,
      id: this.department.id
    };
    this.departmentsService.updateDepartment(departmentFormData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.departmentUpdateForm.enable();
      })
    ).subscribe({
      next: () => {
        this.updatedSuccessfully.emit();
        this.toastr.success('Cập nhật phòng ban thành công');
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
