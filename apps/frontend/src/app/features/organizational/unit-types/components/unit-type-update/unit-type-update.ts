import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnitTypesService } from '../../../../../core/services/oraganizational/unit-types.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { IUnitType } from '../../../../../core/interfaces/oraganizational.interface';
import { IUpdateUnitTypeInput } from '../../interfaces/unit-type-update.interface';
import { finalize } from 'rxjs';
import { GraphQLResponseError } from '../../../../../shared/models/graphql-error.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';

@Component({
  selector: 'app-unit-type-update',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unit-type-update.html',
  styleUrl: './unit-type-update.css'
})
export class UnitTypeUpdate implements OnInit {
  @Input() isOpen = false
  @Input({ required: true }) unitType!: IUnitType

  @Output() close = new EventEmitter<void>()
  @Output() updatedSuccessfully = new EventEmitter<void>()

  unitTypeUpdateForm!: FormGroup
  isLoading = true
  constructor(
    private unitTypesService: UnitTypesService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private errorHandlerService: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.unitTypeUpdateForm = this.fb.group({
      typeName: [this.unitType.typeName, [Validators.required, Validators.maxLength(256)]],
      description: [this.unitType.description, [Validators.required]]
    })
  }

  onSubmit() {
    if (this.unitTypeUpdateForm.invalid) return;
    this.isLoading = true
    this.unitTypeUpdateForm.disabled

    const unitTypeFormUpdateData: IUpdateUnitTypeInput = {
      ...this.unitTypeUpdateForm.value,
      id:this.unitType.id
    }
    this.unitTypesService.updateUnitType(unitTypeFormUpdateData).pipe(
      finalize(() => {
        this.isLoading = false
        this.unitTypeUpdateForm.enable()
      })
    ).subscribe({
      next: response => {
        this.updatedSuccessfully.emit()
        this.toastr.success("Tạo thành công")
        this.onFormClose()
      },
      error: (errorResponse: GraphQLResponseError) => {
        const { message, code } = this.errorHandlerService.extractGraphQLError(errorResponse);
        this.toastr.error("Có lổi xảy ra vui lòng thử lại")
        console.log(errorResponse)
      }
    })
  }

  onFormClose() {
    this.isOpen = false
    this.close.emit()
  }
}
