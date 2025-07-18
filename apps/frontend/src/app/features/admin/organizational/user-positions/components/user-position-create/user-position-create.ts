import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DepartmentsService } from '../../../../../../core/services/oraganizational/departments.service';
import { PositionsService } from '../../../../../../core/services/oraganizational/positions.service';
import { IDepartment, IPosition } from '../../../../../../core/interfaces/oraganizational.interface';
@Component({
  selector: 'app-user-position-create',
  imports: [ScrollPanelModule],
  templateUrl: './user-position-create.html',
  styleUrl: './user-position-create.css'
})
export class UserPositionCreate implements OnInit{
  @Input() isOpen : boolean = false

  userPositionCreateForm!: FormGroup

  departments: IDepartment[] = []
  positionsOfDepartment: IPosition[] = []

  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly positionsService: PositionsService
  ){}

  ngOnInit(): void {
    
  }

  fetchDepartmnets(){
    
  }
}
