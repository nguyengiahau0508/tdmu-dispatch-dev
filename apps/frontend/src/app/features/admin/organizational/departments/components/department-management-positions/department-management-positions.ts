import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IDepartment } from '../../../../../../core/interfaces/oraganizational.interface';

@Component({
  selector: 'app-department-management-positions',
  imports: [],
  templateUrl: './department-management-positions.html',
  styleUrl: './department-management-positions.css'
})
export class DepartmentManagementPositions {
  @Input({required: true}) department!: IDepartment; 
  @Input() isOpen = false;
  
  @Output() close = new EventEmitter<void>()
  
  isloading = false;

  constructor(){
    
  }
  
}
