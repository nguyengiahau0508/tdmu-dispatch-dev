
import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AssignmentsService } from '../../../../../core/services/oraganizational/assignments.service';
import { PositionsService } from '../../../../../core/services/oraganizational/positions.service';
import { UnitsService } from '../../../../../core/services/oraganizational/units.service';
import { IAssignment, IPosition, IUnit, IUserPosition } from '../../../../../core/interfaces/oraganizational.interface';
import { IUser } from '../../../../../core/interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UserPositionsService } from '../../../../../core/services/oraganizational/user-positions.service';
import { TableModule } from 'primeng/table';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PanelModule } from 'primeng/panel';
import { MenuItem } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-user-poitions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, DatePipe, SplitButtonModule, PanelModule, ToolbarModule, ButtonModule],
  templateUrl: './user-poitions.html',
  styleUrl: './user-poitions.css'
})
export class UserPoitions implements OnInit {
  @Input({ required: true }) userId!: number
  @Input() isOpen = false;
  @Input({ required: true }) user!: IUser;
  
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  userPositions: IUserPosition[] = []

  constructor(
    private readonly userPositionsService: UserPositionsService
  ) { }

  ngOnInit(): void {
    this.fetchUserPositionByUser()
  }

  fetchUserPositionByUser() {
    this.userPositionsService.initGetAllUserPositionByUserQuery(this.userId).subscribe({
      next: response => {
        console.log(response.data?.userPositions)
        this.userPositions = response.data!.userPositions.map(
          userPosition=>({
            ...userPosition,
            actions: this.getMenuItemsForUserPosition(userPosition)
          })
        )
      },
      error: err => { }
    })
  }

  getMenuItemsForUserPosition(userPosition: IUserPosition): MenuItem[] {
    return [
      {
        label: 'Cập nhật',
        icon: 'pi pi-pencil',
        command: () => this.onUserPositionUpdate
      },
      {
        label: 'Xóa khỏi phòng ban',
        icon: 'pi pi-trash',
        command: () => this.onUserPositionRemove()
      }
    ];
  }

  onUserPostionCreate() {

  }

  onUserPositionUpdate() {

  }

  onUserPositionRemove() {

  }

  onClose() {
    this.close.emit();
  }
}

