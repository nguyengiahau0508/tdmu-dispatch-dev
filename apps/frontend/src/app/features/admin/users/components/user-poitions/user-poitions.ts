
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-user-poitions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
      next: response=>{
        console.log(response.data?.userPositions)
        this.userPositions = response.data!.userPositions
      }, 
      error: err=>{}
    })
  }

  onClose() {
    this.close.emit();
  }
}

