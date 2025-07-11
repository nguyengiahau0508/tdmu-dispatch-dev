import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { UnitsService } from '../../../../../core/services/oraganizational/units.service';
import { UnitTypesService } from '../../../../../core/services/oraganizational/unit-types.service';
import { ICreateUnitInput } from '../../interfaces/unit-create.interface';
import { IUnitType, IUnit } from '../../../../../core/interfaces/oraganizational.interface'; import { GraphQLResponseError } from '../../../../../shared/models/graphql-error.model'; import { finalize } from 'rxjs';
import { Order } from '../../../../../core/interfaces/page-options.interface';

@Component({
  selector: 'app-unit-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unit-create.html',
  styleUrl: './unit-create.css'
})
export class UnitCreate {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() createdSuccessfully = new EventEmitter<void>();
  unitCreateForm!: FormGroup;
  isLoading = false;

  unitTypes: IUnitType[] = [];
  parentUnits: IUnit[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private errorHandlerService: ErrorHandlerService,
    private unitsService: UnitsService,
    private unitTypesService: UnitTypesService
  ) {
    this.unitCreateForm = this.fb.group({
      unitName: ['', [Validators.required, Validators.maxLength(256)]],
      unitTypeId: [null, [Validators.required]],
      parentUnitId: [null],
      establishmentDate: [null, [Validators.required]],
      email: [null, [Validators.email]],
      phone: [null]
    });
    this.fetchUnitTypes();
    this.fetchParentUnits();
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
    this.isLoading = true;
    this.unitCreateForm.disable();
    if (this.unitCreateForm.invalid) return;

    const unitFormData: ICreateUnitInput = this.unitCreateForm.value;
    this.unitsService.createUnit(unitFormData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.unitCreateForm.enable();
      })
    ).subscribe({
      next: (response) => {
        this.createdSuccessfully.emit();
        this.toastr.success('Tạo đơn vị thành công');
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
