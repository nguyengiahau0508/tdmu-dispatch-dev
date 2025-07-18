import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IDepartment, IPosition } from '../../../../../../core/interfaces/oraganizational.interface';
import { PositionsService } from '../../../../../../core/services/oraganizational/positions.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-department-management-positions',
  imports: [TableModule, ButtonModule],
  templateUrl: './department-management-positions.html',
  styleUrl: './department-management-positions.css'
})
export class DepartmentManagementPositions implements OnChanges {
  @Input({ required: true }) department!: IDepartment;
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>()

  positions: IPosition[] = []

  isloading = false;

  constructor(
    private readonly positionsService: PositionsService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['department'] && this.department?.id) {
      this.fetchPositions();
    }
  }

  fetchPositions() {
    this.positionsService.getPostionsByDepartmnetId(this.department.id).subscribe({
      next: response => {
        console.log(response.data?.positions)
        this.positions = response.data!.positions
      },
      error: err => {
        console.log(err)
      }
    })
  }
}
