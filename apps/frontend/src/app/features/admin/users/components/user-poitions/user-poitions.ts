
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AssignmentsService } from '../../../../../core/services/oraganizational/assignments.service';
import { PositionsService } from '../../../../../core/services/oraganizational/positions.service';
import { UnitsService } from '../../../../../core/services/oraganizational/units.service';
import { IAssignment, IPosition, IUnit } from '../../../../../core/interfaces/oraganizational.interface';
import { IUser } from '../../../../../core/interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-poitions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-poitions.html',
  styleUrl: './user-poitions.css'
})
export class UserPoitions  {
  @Input() isOpen = false;
  @Input({ required: true }) user!: IUser;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();



  onClose() {
    this.close.emit();
  }
}

