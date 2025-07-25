import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IDepartment, IPosition } from '../../../../../../core/interfaces/oraganizational.interface';
import { PositionsService } from '../../../../../../core/services/oraganizational/positions.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { PositionUpdate } from '../../../positions/components/position-update/position-update';
import { PositionCreate } from '../../../positions/components/position-create/position-create';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastrService } from 'ngx-toastr';
import { GraphQLResponseError } from '../../../../../../shared/models/graphql-error.model';

@Component({
  selector: 'app-department-management-positions',
  imports: [ConfirmDialogModule,TableModule, ButtonModule, SplitButtonModule, PanelModule, ToolbarModule, PositionUpdate, PositionCreate],
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
  isPostionCreateOpen = false;
  isloading = false;


  items: MenuItem[] = []

  constructor(
    private readonly positionsService: PositionsService,
    private readonly confirmationService: ConfirmationService,
    private toastr: ToastrService,
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
        
      }
    })
  }

  onPositionRemove(positionId: number) {
 this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa chức vụ này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      accept: () => {
        this.positionsService.removePosition(positionId).subscribe({
          next: (res) => {
            this.fetchPositions
            this.toastr.success(res.metadata.message);
          },
          error: (err: GraphQLResponseError) => {
            // const { message } = this.errorHandlerService.extractGraphQLError(err);
            // this.toastr.error(message || "Xóa thất bại");
          }
        });
      }
    });
  }

  onPositionUpdate(position: IPosition) {
    this.positionUdpateSelected = position
    this.isPostionUpdateOpen = true
  }

  onShowUsersPosition(positionId: number) {

  }

  onPositionCreate(){
    this.isPostionCreateOpen = true;
  }
  onCloseCreateForm(){
    this.isPostionCreateOpen = false
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
