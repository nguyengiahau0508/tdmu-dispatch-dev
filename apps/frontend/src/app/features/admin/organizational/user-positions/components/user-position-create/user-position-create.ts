import { Component, EventEmitter, Input, numberAttribute, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentsService } from '../../../../../../core/services/oraganizational/departments.service';
import { PositionsService } from '../../../../../../core/services/oraganizational/positions.service';
import { IDepartment, IPosition } from '../../../../../../core/interfaces/oraganizational.interface';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { PanelModule } from 'primeng/panel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { UserPositionsService } from '../../../../../../core/services/oraganizational/user-positions.service';
import { ICreateUserPositionInput } from '../../interfaces/create-user-position.interfaces';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-user-position-create',
  imports: [PanelModule, SelectModule,InputGroupModule, InputGroupAddonModule, ButtonModule,
    CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-position-create.html',
  styleUrl: './user-position-create.css'
})
export class UserPositionCreate implements OnInit {
  @Input() isOpen: boolean = false
  @Input({ required: true }) userId!: number

  @Output() close = new EventEmitter<void>()

  searchDepertmentText: string = ''
  userPositionCreateForm!: FormGroup

  departments: IDepartment[] = []
  positionsOfDepartment: IPosition[] = []

  constructor(
    private readonly fb: FormBuilder,
    private readonly departmentsService: DepartmentsService,
    private readonly positionsService: PositionsService,
    private readonly userPositionsService: UserPositionsService,
    private readonly toasrt: ToastrService
  ) { }

  ngOnInit(): void {
    this.fetchDepartmnets()
    this.userPositionCreateForm = this.fb.group({
      userId: [this.userId, [Validators.required]],
      departmentId: [null, [Validators.required]],
      positionId: [null, [Validators.required]]
    })
  }

  fetchDepartmnets() {
    this.departmentsService.getAllDepartments(this.searchDepertmentText).subscribe({
      next: response => {
        this.departments = response.data!.departments
      },
      error: err => {
        console.log(err)
      }
    })
  }

  onDepartmentChange(event: any) {
    const selectedDepartmentId = event.value;

    if (selectedDepartmentId) {
      this.positionsService.getPostionsByDepartmnetId(selectedDepartmentId).subscribe({
        next: response => {
          this.positionsOfDepartment = response.data!.positions
        },
        error: err => {
          console.log(err)
        }
      })
    }
  }

  onSubmit() {
    if(this.userPositionCreateForm.invalid) return
    const userPositionCreateFormData: ICreateUserPositionInput = this.userPositionCreateForm.value
    this.userPositionsService.createUserPosition(userPositionCreateFormData).subscribe({
      next: (response)=>{
        this.toasrt.success("Thêm thành công chức vụ cho người dùng")
      },
      error: err=>{
        //console.log(err)
      }
    })
  }

  onClose(){
    this.close.emit()
  }
}
