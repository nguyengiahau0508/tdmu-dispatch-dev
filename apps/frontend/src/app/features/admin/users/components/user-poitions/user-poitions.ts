
import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AssignmentsService } from '../../../../../core/services/oraganizational/assignments.service';
import { PositionsService } from '../../../../../core/services/oraganizational/positions.service';
import { UnitsService } from '../../../../../core/services/oraganizational/units.service';
import { IAssignment, IPosition, IUnit, IUserPosition } from '../../../../../core/interfaces/oraganizational.interface';
import { IUser } from '../../../../../core/interfaces/user.interface';
import { Toast, ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UserPositionsService } from '../../../../../core/services/oraganizational/user-positions.service';
import { TableModule } from 'primeng/table';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PanelModule } from 'primeng/panel';
import { MenuItem } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { UserPositionCreate } from '../../../organizational/user-positions/components/user-position-create/user-position-create';
import { UserPositionUpdate } from '../../../organizational/user-positions/components/user-position-update/user-position-update';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ImagePreview } from '../../../../../shared/components/image-preview/image-preview';

@Component({
  selector: 'app-user-poitions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, DatePipe, SplitButtonModule, PanelModule, ToolbarModule, ButtonModule, ConfirmDialogModule,
    UserPositionCreate, ImagePreview
  ],
  providers: [ConfirmationService],
  templateUrl: './user-poitions.html',
  styleUrl: './user-poitions.css'
})
export class UserPoitions implements OnInit {
  @Input({ required: true }) userId!: number
  @Input() isOpen = false;
  @Input({ required: true }) user!: IUser;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  userPositions: (IUserPosition & { showActions?: boolean })[] = []
  isOpenCreateFormUserPosition: boolean = false

  get activePositionsCount(): number {
    return this.userPositions.filter(p => !p.endDate).length;
  }

  constructor(
    private readonly userPositionsService: UserPositionsService,
    private readonly ConfirmationService: ConfirmationService,
    private readonly toasrt: ToastrService
  ) { }

  ngOnInit(): void {
    this.fetchUserPositionByUser()
  }

  fetchUserPositionByUser() {
    this.userPositionsService.initGetAllUserPositionByUserQuery(this.userId).subscribe({
      next: response => {
        console.log(response.data?.userPositions)
        this.userPositions = response.data!.userPositions.map(
          userPosition => ({
            ...userPosition,
            showActions: false,
            actions: this.getMenuItemsForUserPosition(userPosition)
          })
        )
      },
      error: err => {
        console.log(err)
      }
    })
  }

  getMenuItemsForUserPosition(userPosition: IUserPosition): MenuItem[] {
    return [
      {
        label: 'Cập nhật',
        icon: 'pi pi-pencil',
        command: () => this.onUserPositionUpdate()
      },
      {
        label: 'Xóa khỏi phòng ban',
        icon: 'pi pi-trash',
        command: () => this.onUserPositionRemove()
      },
      {
        label: 'Kết thúc chức vụ',
        icon: 'pi pi-ban',
        command: () => this.onUserPostionEnd(userPosition.id)
      }
    ];
  }

  toggleActions(event: Event, userPosition: IUserPosition & { showActions?: boolean }) {
    event.stopPropagation();
    // Close all other dropdowns
    this.userPositions.forEach(pos => {
      if (pos.id !== userPosition.id) {
        pos.showActions = false;
      }
    });
    // Toggle current dropdown
    userPosition.showActions = !userPosition.showActions;
  }

  onUserPostionCreate() {
    this.isOpenCreateFormUserPosition = true
  }

  onUserPositionUpdate() {

  }

  onUserPositionRemove() {

  }

  onUserPostionEnd(userPositionId: number) {
    this.ConfirmationService.confirm({
      message: 'Bạn có chắc chắn kết thúc chức vụ này',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy bỏ',
      accept: () => {
        this.userPositionsService.endUserPosition(userPositionId).subscribe({
          next: response => {
            this.toasrt.success("Kết thúc chức vụ thành công")
          },
          error: err => {
            //console.log(err)
          }
        })
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}

