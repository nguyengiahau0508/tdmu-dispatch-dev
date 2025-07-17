import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { ICreateUnitTypeInput } from '../../interfaces/unit-type-create.interfaces';

import { finalize } from 'rxjs';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { UnitTypesService } from '../../../../../../core/services/oraganizational/unit-types.service';
import { GraphQLResponseError } from '../../../../../../shared/models/graphql-error.model';

@Component({
  selector: 'app-unit-type-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unit-type-create.html',
  styleUrl: './unit-type-create.css'
})
export class UnitTypeCreate {
  @Input() isOpen = false
  @Output() close = new EventEmitter<void>()
  @Output() createdSuccessfully = new EventEmitter<void>()
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
        this.unitTypeCreateForm.enable()
      })
    ).subscribe({
      next: (response) => {
        this.createdSuccessfully.emit()
        this.toarst.success("Tạo thành công")
        this.onFormClose()
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
