
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
export class UserPoitions implements OnInit {
  @Input() isOpen = false;
  @Input({ required: true }) user!: IUser;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  assignments: IAssignment[] = [];
  allPositions: IPosition[] = [];
  allUnits: IUnit[] = [];

  isLoading = false;
  isAdding = false;

  assignmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private assignmentsService: AssignmentsService,
    private positionsService: PositionsService,
    private unitsService: UnitsService,
    private toastr: ToastrService
  ) {
    this.assignmentForm = this.fb.group({
      unitId: [{ value: null, disabled: false }, Validators.required],
      positionId: [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    if (this.user) {
      this.fetchAssignments();
    }
    this.fetchPositions();
    this.fetchUnits();
  }

  private setIsAdding(value: boolean) {
    this.isAdding = value;
  }

  private setIsLoading(value: boolean) {
    this.isLoading = value;
  }

  fetchAssignments() {
    this.setIsLoading(true);
    this.assignmentsService.initAssignmentsByUserQuery(this.user.id)
      .pipe(finalize(() => this.setIsLoading(false)))
      .subscribe({
        next: (res) => {
          this.assignments = res.data || [];
        },
        error: () => {
          this.toastr.error('Lỗi khi tải danh sách chức vụ');
        }
      });
  }

  fetchPositions() {
    this.positionsService.getAllPositions().subscribe({
      next: (res) => {
        this.allPositions = res.data || [];
      },
      error: () => {
        this.toastr.error('Lỗi khi tải danh sách chức vụ');
      }
    });
  }

  fetchUnits() {
    this.unitsService.getAllUnit().subscribe({
      next: (res) => {
        this.allUnits = res.data || [];
      },
      error: () => {
        this.toastr.error('Lỗi khi tải danh sách đơn vị');
      }
    });
  }

  onAddAssignment() {
    if (this.assignmentForm.invalid) return;

    this.setIsAdding(true);

    const { unitId, positionId } = this.assignmentForm.value;

    this.assignmentsService.createAssignment({
      userId: this.user.id,
      unitId,
      positionId
    }).pipe(finalize(() => this.setIsAdding(false)))
      .subscribe({
        next: () => {
          this.toastr.success('Thêm chức vụ thành công');
          this.assignmentForm.reset();
          this.fetchAssignments();
          this.updated.emit();
        },
        error: () => {
          this.toastr.error('Lỗi khi thêm chức vụ');
        }
      });
  }

  onRemoveAssignment(assignment: IAssignment) {
    if (!assignment.id) return;
    if (!confirm('Bạn có chắc muốn xóa chức vụ này?')) return;

    this.setIsLoading(true);

    this.assignmentsService.removeAssignment(assignment.id)
      .pipe(finalize(() => this.setIsLoading(false)))
      .subscribe({
        next: () => {
          this.toastr.success('Xóa chức vụ thành công');
          this.fetchAssignments();
          this.updated.emit();
        },
        error: () => {
          this.toastr.error('Lỗi khi xóa chức vụ');
        }
      });
  }

  onClose() {
    this.close.emit();
  }
}

