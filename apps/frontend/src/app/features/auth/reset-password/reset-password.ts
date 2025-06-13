import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { IResetPasswordInput } from './interfaces/reset-password.interface';
import { finalize } from 'rxjs';
import { GraphQLResponseError } from '../../../shared/models/graphql-error.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  resetPasswordForm!: FormGroup
  showPassword = false;
  showConfirmPassword = false;
  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private errorHandlerService: ErrorHandlerService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          // Validators.pattern(
          //   '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]:;"\'<>,.?/]).{8,}$'
          // )
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  private passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    this.resetPasswordForm.disable()
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const resetPasswordData: IResetPasswordInput = {
      newPassword: this.resetPasswordForm.get('password')?.value
    }
    this.usersService.changePassword(resetPasswordData).pipe(
      finalize(() => {
        this.resetPasswordForm.enable()
      })
    ).subscribe({
      next: response => {
        this.toastr.success(response.metadata.message)
        this.router.navigate(['auth'])
      },
      error: (errorResponse: GraphQLResponseError) => {
        const { message, code } = this.errorHandlerService.extractGraphQLError(errorResponse);
        this.toastr.error(message)
      }
    })
  }
}
