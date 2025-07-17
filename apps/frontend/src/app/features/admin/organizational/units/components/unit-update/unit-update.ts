import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUnit, IUnitType } from '../../../../../../core/interfaces/oraganizational.interface';

import { UnitsService } from '../../../../../../core/services/oraganizational/units.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { UnitTypesService } from '../../../../../../core/services/oraganizational/unit-types.service';
import { Order } from '../../../../../../core/interfaces/page-options.interface';
import { IUpdateUnitInput } from '../../interfaces/unit-update.interface';
import { finalize } from 'rxjs';
import { GraphQLResponseError } from '../../../../../../shared/models/graphql-error.model';
import { formatDateToInput } from '../../../../../../shared/utils/date-utils';

@Component({
  selector: 'app-unit-update',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unit-update.html',
  styleUrl: './unit-update.css'
})
export class UnitUpdate implements OnInit {
  @Input() isOpen = false
  @Input({ required: true }) unit!: IUnit

  @Output() close = new EventEmitter<void>()
  @Output() updatedSuccessfully = new EventEmitter<void>()

  unitUpdateForm!: FormGroup
  isLoading = false

  unitTypes: IUnitType[] = [];
  parentUnits: IUnit[] = [];

  constructor(
    private unitsService: UnitsService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private errorHandlerService: ErrorHandlerService,
    private unitTypesService: UnitTypesService
  ) {
    this.fetchParentUnits()
    this.fetchUnitTypes()
  }


  ngOnInit(): void {
    const establishmentDate = this.unit.establishmentDate
      ? formatDateToInput(this.unit.establishmentDate)
      : null;

    this.unitUpdateForm = this.fb.group({
      unitName: [this.unit.unitName, [Validators.required, Validators.maxLength(256)]],
      unitTypeId: [this.unit.unitType?.id, [Validators.required]],
      parentUnitId: [this.unit.parentUnit?.id],
      establishmentDate: [establishmentDate, [Validators.required]],
      email: [this.unit.email, [Validators.email]],
      phone: [this.unit.phone]
    });
  }

  fetchUnitTypes() {
    this.unitTypesService.getUnitTypesPaginated({ page: 1, take: 100, order: Order.ASC }).subscribe({
      next: (res) => {
        this.unitTypes = res.data || [];
      }
    });
  }

  fetchParentUnits() {
    this.unitsService.getAllUnit().subscribe({
      next: (res) => {
        this.parentUnits = res.data || [];
      },
      error: err => {
        console.log(err)
      }
    });
  }

  onSubmit(): void {
    console.log('aaa')
    if (this.unitUpdateForm.invalid) return;
    this.isLoading = true;
    this.unitUpdateForm.disable();

    const unitFormData: IUpdateUnitInput = {
      ...this.unitUpdateForm.value,
      establishmentDate: new Date(this.unitUpdateForm.value.establishmentDate).toISOString()
    };

    this.unitsService.updateUnit(unitFormData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.unitUpdateForm.enable();
      })
    ).subscribe({
      next: (response) => {
        this.updatedSuccessfully.emit();
        this.toastr.success('Cập nhật đơn vị thành công');
        this.onFormClose();
      },
      error: (errorResponse: GraphQLResponseError) => {
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
