import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { GraphQLResponseError } from '../../../shared/models/graphql-error.model';
import { ErrorCode } from '../../../shared/enums/error-code.enum';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthState } from '../../../core/state/auth.state';
import { ILoginInput } from './interfaces/login.interface';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup
  showPassword = false
  isLoading = false
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private toarst: ToastrService,
    private authState: AuthState
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    })
  }

  onSubmit(): void {
    this.isLoading = true
    this.loginForm.disable()
    if (this.loginForm.invalid) {
      return;
    }
    const loginData: ILoginInput = this.loginForm.value
    this.authService.login({
      email: loginData.email,
      password: loginData.password
    }).pipe(
      finalize(() => {
        this.loginForm.enable()
        this.isLoading = false
      })
    )
      .subscribe({
        next: response => {
          console.log(response.data?.user.fullName)
        },
        error: (errorResponse: GraphQLResponseError) => {
          const { message, code } = this.errorHandlerService.extractGraphQLError(errorResponse);
          if (code === ErrorCode.FIRST_LOGIN_CHANGE_PASSWORD_REQUIRED) {
            this.authState.setEmailForOtp(loginData.email)
            this.router.navigate(['auth', 'otp-input'])
          } else {
            this.toarst.error(message)
          }
        }
      })
  }

  onGotoForgotPassword() {
    this.router.navigate(['auth', 'forgot-password'])
  }
}
