import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UsersService } from '../../../../core/services/users.service';
import { FileService } from '../../../../core/services/file.service';
import { IUser } from '../../../../core/interfaces/user.interface';
import { IUpdateUserInput } from '../../interfaces/update-user.interfaces';
import { finalize } from 'rxjs';
import { GraphQLResponseError } from '../../../../shared/models/graphql-error.model';

@Component({
  selector: 'app-user-update',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-update.html',
  styleUrl: './user-update.css'
})
export class UserUpdate implements OnInit {
  @Input() isOpen = false;
  @Input({ required: true }) user!: IUser
  @Output() close = new EventEmitter<void>()
  @Output() updatedSuccessfully = new EventEmitter<void>()

  userUpdateForm!: FormGroup
  isLoading = false;
  avatarPreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private toasrt: ToastrService,
    private errorHandlerService: ErrorHandlerService,
    private usersService: UsersService,
    private fileService: FileService
  ) { }

  async ngOnInit() {
    this.userUpdateForm = this.fb.group({
      email: [this.user.email, [Validators.required, Validators.email]],
      //password: ['', [Validators.required, Validators.minLength(8)]], // update later
      firstName: [this.user.firstName, Validators.required],
      lastName: [this.user.lastName, Validators.required],
      isActive: [this.user.isActive], // Mặc định kích hoạt
      avatarImageFile: [null] // File sẽ binding với (change) trong input[type="file"]
    })

    if (this.user.avatarFileId) this.avatarPreviewUrl = await this.fileService.getFileUrl(this.user.avatarFileId)
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.userUpdateForm.patchValue({
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
    this.userUpdateForm.patchValue({
      avatarImageFile: null
    });
  }

  onSubmit() {
    this.isLoading = true
    this.userUpdateForm.disable()
    if (this.userUpdateForm.invalid) return;

    const {
      email,
      lastName,
      firstName,
      isActive,
      avatarImageFile
    } = this.userUpdateForm.value;

    const updateUserInput: IUpdateUserInput = {
      id: this.user.id,
      email,
      lastName,
      firstName,
      isActive
    };

    this.usersService.updateUser(updateUserInput, avatarImageFile).pipe(
      finalize(() => {
        this.isLoading = false;
        this.userUpdateForm.enable();
      })
    ).subscribe({
      next: response => {
        this.updatedSuccessfully.emit()
        this.toasrt.success('Cập nhật người dùng thành công');
        this.onFormClose();
      },
      error: (errorResponse: GraphQLResponseError) => {
        const { message } = this.errorHandlerService.extractGraphQLError(errorResponse);
        this.toasrt.error(message || 'Có lỗi xảy ra, vui lòng thử lại');
        console.log(errorResponse)
      }
    })
  }

  onFormClose() {
    this.close.emit()
  }
}
