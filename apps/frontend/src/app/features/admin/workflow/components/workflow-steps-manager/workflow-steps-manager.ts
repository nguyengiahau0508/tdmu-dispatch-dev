import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkflowStepsService } from '../../../../../core/modules/workflow/workflow-steps/workflow-steps.service';
import { IWorkflowStep, ICreateWorkflowStepInput, IUpdateWorkflowStepInput, IStepType } from '../../../../../core/modules/workflow/workflow-steps/interfaces/workflow-step.interfaces';
import { IWorkflowTemplate } from '../../../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';

@Component({
  selector: 'app-workflow-steps-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WorkflowStepsService],
  templateUrl: './workflow-steps-manager.html',
  styleUrls: ['./workflow-steps-manager.css']
})
export class WorkflowStepsManager implements OnInit {
  @Input() workflowTemplate!: IWorkflowTemplate;
  @Output() stepsUpdated = new EventEmitter<void>();

  private workflowStepsService = inject(WorkflowStepsService);
  private fb = inject(FormBuilder);

  steps: IWorkflowStep[] = [];
  stepTypes: IStepType[] = [];
  roles: { value: string; label: string }[] = [];
  isModalOpen = false;
  isEditing = false;
  isSubmitting = false;
  editingStep: IWorkflowStep | null = null;

  stepForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    type: ['', Validators.required],
    assignedRole: ['', Validators.required],
    orderNumber: [null],
    isActive: [true]
  });

  ngOnInit() {
    this.loadSteps();
    this.loadStepTypes();
    this.loadRoles();
  }

  loadSteps() {
    this.workflowStepsService.findByTemplateId(this.workflowTemplate.id).subscribe({
      next: (steps) => {
        this.steps = steps;
      },
      error: (error: any) => {
        console.error('Error loading steps:', error);
      }
    });
  }

  loadStepTypes() {
    this.workflowStepsService.getStepTypes().subscribe({
      next: (types) => {
        this.stepTypes = types;
      },
      error: (error: any) => {
        console.error('Error loading step types:', error);
      }
    });
  }

  loadRoles() {
    this.workflowStepsService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error: any) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  toggleAddStep() {
    this.isEditing = false;
    this.editingStep = null;
    this.stepForm.reset({
      isActive: true,
      orderNumber: this.steps.length + 1
    });
    this.isModalOpen = true;
  }

  editStep(step: IWorkflowStep) {
    this.isEditing = true;
    this.editingStep = step;
    this.stepForm.patchValue({
      name: step.name,
      description: step.description,
      type: step.type,
      assignedRole: step.assignedRole,
      orderNumber: step.orderNumber,
      isActive: step.isActive
    });
    this.isModalOpen = true;
  }

  duplicateStep(step: IWorkflowStep) {
    if (confirm(`Bạn có chắc chắn muốn sao chép bước "${step.name}"?`)) {
      this.workflowStepsService.duplicateStep(step.id).subscribe({
        next: () => {
          this.loadSteps();
          this.stepsUpdated.emit();
        },
        error: (error: any) => {
          console.error('Error duplicating step:', error);
        }
      });
    }
  }

  deleteStep(step: IWorkflowStep) {
    if (confirm(`Bạn có chắc chắn muốn xóa bước "${step.name}"?`)) {
      this.workflowStepsService.remove(step.id).subscribe({
        next: () => {
          this.loadSteps();
          this.stepsUpdated.emit();
        },
        error: (error: any) => {
          console.error('Error deleting step:', error);
        }
      });
    }
  }

  onSubmit() {
    if (this.stepForm.valid) {
      this.isSubmitting = true;
      const formValue = this.stepForm.value;

      if (this.isEditing && this.editingStep) {
        const updateInput: IUpdateWorkflowStepInput = {
          id: this.editingStep.id,
          ...formValue
        };

        this.workflowStepsService.update(updateInput).subscribe({
          next: () => {
            this.loadSteps();
            this.stepsUpdated.emit();
            this.closeModal();
          },
          error: (error: any) => {
            console.error('Error updating step:', error);
            this.isSubmitting = false;
          }
        });
      } else {
        const createInput: ICreateWorkflowStepInput = {
          ...formValue,
          templateId: this.workflowTemplate.id
        };

        this.workflowStepsService.create(createInput).subscribe({
          next: () => {
            this.loadSteps();
            this.stepsUpdated.emit();
            this.closeModal();
          },
          error: (error: any) => {
            console.error('Error creating step:', error);
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.isSubmitting = false;
    this.stepForm.reset();
  }

  getStepTypeLabel(type: string): string {
    const stepType = this.stepTypes.find(t => t.value === type);
    return stepType ? stepType.label : type;
  }

  getRoleLabel(roleValue: string): string {
    const role = this.roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  }
}
