import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { UnitTypesService } from '../../../../../core/services/oraganizational/unit-types.service';
import { ICreateUnitTypeInput } from '../../interfaces/unit-type-create.interfaces';
import { GraphQLResponseError } from '../../../../../shared/models/graphql-error.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-unit-type-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unit-type-create.html',
  styleUrl: './unit-type-create.css'
})
export class UnitTypeCreate {
  @Input() isOpen = false
  @Output() close = new EventEmitter<void>()

  unitTypeCreateForm!: FormGroup
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toarst: ToastrService,
    private errorHandlerService: ErrorHandlerService,
    private unitTypesService: UnitTypesService
  ) {
    this.unitTypeCreateForm = this.fb.group({
      typeName: ['', [Validators.required, Validators.maxLength(256)]],
      description: ['', [Validators.required]]
    })
  }

  onSubmit(): void {
    this.isLoading = true
    this.unitTypeCreateForm.disable()
    if (this.unitTypeCreateForm.invalid) return;

    const unitTypeFormData: ICreateUnitTypeInput = this.unitTypeCreateForm.value
    this.unitTypesService.createUnitType(unitTypeFormData).pipe(
      finalize(() => {
        this.isLoading = false
        this.onFormClose()
      })
    ).subscribe({
      next: (response) => {
        this.toarst.success("Tạo thành công")
      },
      error: (errorResponse: GraphQLResponseError) => {
        const { message, code } = this.errorHandlerService.extractGraphQLError(errorResponse);
        this.toarst.error("Có lổi xảy ra vui lòng thử lại")
      }
    })
  }

  onFormClose() {
    this.isOpen = false
    this.close.emit()
  }
}
