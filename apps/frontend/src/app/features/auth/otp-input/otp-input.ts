
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthState } from '../../../core/state/auth.state';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { GraphQLResponseError } from '../../../shared/models/graphql-error.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ErrorCode } from '../../../shared/enums/error-code.enum';
import { ILoginOtpInput } from './interfaces/login-otp.interface';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-input.html',
  styleUrl: './otp-input.css'
})
export class OtpInput {
  otpLength = 6;
  otpValues = Array(this.otpLength).fill('').map(() => signal(''));

  resendCooldown = signal(0); // thời gian còn lại (giây)
  private timer: any; // để lưu setInterval ID

  isLoading = false
  constructor(
    private router: Router,
    private authService: AuthService,
    private authState: AuthState,
    private errorHandlerService: ErrorHandlerService,
    private toastr: ToastrService
  ) { }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (/^\d$/.test(value)) {
      this.otpValues[index].set(value);
      // Move to next input if exists
      const nextInput = document.getElementById(`otp-input__field-${index + 1}`) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
      }
    } else {
      // If not a digit, clear
      const currentInput = document.getElementById(`otp-input__field-${index}`) as HTMLInputElement | null;
      if (currentInput) {
        currentInput.value = '';
      }
    }
    this.checkOtpComplete();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = document.getElementById(`otp-input__field-${index - 1}`) as HTMLInputElement | null;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  onResendOtp() {
    if (this.resendCooldown() > 0) return; // không cho gửi khi còn cooldown
    const email = this.authState.getEmailForOtp()

    if (!email) {
      this.toastr.error('Có lổi xảy ra vui lòng thử lại')
      this.router.navigate(['auth'])
      return;
    }

    this.authService.sentOtp({
      email
    }).subscribe()

    this.startResendCooldown();
  }

  startResendCooldown() {
    this.resendCooldown.set(60); // bắt đầu từ 60 giây
    clearInterval(this.timer); // clear timer cũ nếu có

    this.timer = setInterval(() => {
      const current = this.resendCooldown();
      if (current > 0) {
        this.resendCooldown.set(current - 1);
      } else {
        clearInterval(this.timer); // hết thời gian thì dừng
      }
    }, 1000);
  }

  checkOtpComplete() {
    const otp = this.otpValues.map(s => s()).join('');
    if (otp.length == this.otpLength) {
      this.isLoading = true
      const email = this.authState.getEmailForOtp()
      if (!email) {
        this.toastr.error('Có lỗi xảy ra vui lòng thử lại')
        this.router.navigate(['auth', 'login'])
        return;
      }
      const loginWithOtpData: ILoginOtpInput = { email, otp }
      this.authService.loginWithOtp(loginWithOtpData).pipe(finalize(() => {
        this.isLoading = false
      })).subscribe({
        next: response => {
          console.log('OTP verification successful, redirecting to reset password');
          this.router.navigate(['auth', 'reset-password'])
        },
        error: (errorResponse: GraphQLResponseError) => {
          const { message, code } = this.errorHandlerService.extractGraphQLError(errorResponse);
          this.toastr.error(message)
          if (code === ErrorCode.OTP_INVALID) {
            this.clearCurrentOtp()
          } else {
            // Nếu có lỗi khác, clear emailForOtp và redirect về login
            this.authState.clearEmailForOtp();
            this.router.navigate(['auth', 'login']);
          }
        }
      })
    }
  }

  clearCurrentOtp() {
    for (let i = 0; i < this.otpLength; i++) {
      const input = document.getElementById(`otp-input__field-${i}`) as HTMLInputElement | null;
      this.otpValues[i].set('');
      if (input) {
        input.value = ''
        if (i == 0) input.focus()
      }
    }
  }

  ngOnDestroy() {
    clearInterval(this.timer); // cleanup khi component bị huỷ
  }
}

