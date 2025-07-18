import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IDepartment, IPosition } from '../../../../../../core/interfaces/oraganizational.interface';
import { PositionsService } from '../../../../../../core/services/oraganizational/positions.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { PositionUpdate } from '../../../positions/components/position-update/position-update';
import { PositionCreate } from '../../../positions/components/position-create/position-create';
@Component({
  selector: 'app-department-management-positions',
  imports: [TableModule, ButtonModule, SplitButtonModule, PanelModule, ToolbarModule, PositionUpdate, PositionCreate],
  templateUrl: './department-management-positions.html',
  styleUrl: './department-management-positions.css'
})
export class DepartmentManagementPositions implements OnChanges {
  @Input({ required: true }) department!: IDepartment;
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>()

  positions: IPosition[] = []
  positionUdpateSelected: null | IPosition = null
  isPostionUpdateOpen = false

  isloading = false;


  items: MenuItem[] = []

  constructor(
    private readonly positionsService: PositionsService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['department'] && this.department?.id) {
      this.fetchPositions();
    }
  }

  getMenuItemsForPosition(position: IPosition): MenuItem[] {
    return [
      {
        label: 'Xóa khỏi phòng ban',
        icon: 'pi pi-trash',
        command: () => this.onPositionRemove(position.id)
      },
      {
        label: 'Cập nhật',
        icon: 'pi pi-pencil',
        command: () => this.onPositionUpdate(position)
      },
      {
        label: 'Lịch sử',
        icon: 'pi pi-calendar',
        command: () => this.onShowUsersPosition(position.id)
      }
    ];
  }


  fetchPositions() {
    this.positionsService.getPostionsByDepartmnetId(this.department.id).subscribe({
      next: response => {
        this.positions = response.data!.positions.map(position => ({
          ...position,
          actions: this.getMenuItemsForPosition(position)
        }));
      },
      error: err => {
        console.log(err)
      }
    })
  }

  onPositionRemove(positionId: number) {

  }

  onPositionUpdate(position: IPosition) {
    this.positionUdpateSelected = position
    this.isPostionUpdateOpen = true
  }

  onShowUsersPosition(positionId: number) {

  }

  onClose() {
    this.close.emit()
  }

  onCloseUpdateForm() {
    this.positionUdpateSelected = null;
    this.isPostionUpdateOpen = false;
  }

  onUpdateFormSuccessFully(){
    this.fetchPositions()
    this.positionUdpateSelected = null
    this.isPostionUpdateOpen = false;
  }
}
