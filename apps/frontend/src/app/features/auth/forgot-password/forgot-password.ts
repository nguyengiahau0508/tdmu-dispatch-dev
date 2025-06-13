import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthState } from '../../../core/state/auth.state';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { GraphQLResponseError } from '../../../shared/models/graphql-error.model';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  forgotPasswordForm!: FormGroup
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authState: AuthState,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private toastr: ToastrService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  onSubmit(): void {
    this.forgotPasswordForm.enable()
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value

    this.authService.sentOtp({
      email
    }).pipe(
      finalize(() => {
        this.forgotPasswordForm.enable()
      })
    )
      .subscribe({
        next: () => {
          this.authState.setEmailForOtp(email)
          this.router.navigate(['auth', 'otp-input'])
        },
        error: (errorResponse: GraphQLResponseError) => {
          const { message, code } = this.errorHandlerService.extractGraphQLError(errorResponse);
          this.toastr.error(message)
          console.log(message)
        }
      })
  }
}
