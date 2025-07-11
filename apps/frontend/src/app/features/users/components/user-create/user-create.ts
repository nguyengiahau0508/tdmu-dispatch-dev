import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UsersService } from '../../../../core/services/users.service';
import { ICreateUserInput } from '../../interfaces/create-user.interfaces';
import { finalize } from 'rxjs';
import { GraphQLResponseError } from '../../../../shared/models/graphql-error.model';

@Component({
  selector: 'app-user-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css'
})
export class UserCreate {
  @Input() isOpen = false
  @Output() close = new EventEmitter<void>()
  @Output() createdSuccessfully = new EventEmitter<void>()

  userCreateForm!: FormGroup
  isLoading = false
  avatarPreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private toarst: ToastrService,
    private errorHandlerService: ErrorHandlerService,
    private usersService: UsersService
  ) {
    this.userCreateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      isActive: [true], // Mặc định kích hoạt
      avatarImageFile: [null] // File sẽ binding với (change) trong input[type="file"]
    })
  }


  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.userCreateForm.patchValue({
        avatarImageFile: file
      });

      // Tạo preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearAvatarPreview() {
    this.avatarPreviewUrl = null;
    this.userCreateForm.patchValue({
      avatarImageFile: null
    });
  }

  onSubmit() {
    this.isLoading = true
    this.userCreateForm.disable()
    if (this.userCreateForm.invalid) return;

    const formValue = this.userCreateForm.value
    const {
      email,
      password,
      lastName,
      firstName,
      isActive,
      avatarImageFile
    } = this.userCreateForm.value;

    const createUserInput: ICreateUserInput = {
      email,
      password,
      lastName,
      firstName,
      isActive
    };

    this.usersService.createUser(createUserInput, avatarImageFile).pipe(
      finalize(() => {
        this.isLoading = false;
        this.userCreateForm.enable();
      })
    ).subscribe({
      next: response => {
        this.createdSuccessfully.emit()
        this.toarst.success('Tạo người dùng thành công');
        this.onFormClose();
      },
      error: (errorResponse: GraphQLResponseError) => {
        const { message } = this.errorHandlerService.extractGraphQLError(errorResponse);
        this.toarst.error(message || 'Có lỗi xảy ra, vui lòng thử lại');
        console.log(errorResponse)
      }
    })
  }

  onFormClose() {
    this.close.emit()
  }


  useDefaultPassword() {
    this.userCreateForm.patchValue({
      password: 'TDMU@2025'
    });
  }
}
