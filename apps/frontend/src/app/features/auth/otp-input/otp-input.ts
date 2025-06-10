
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

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

    console.log('Gửi lại mã OTP');
    // Gọi API gửi OTP ở đây nếu có

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
      console.log('OTP hoàn tất:', otp);
      // Gửi OTP hoặc xử lý tiếp
    }
  }

  ngOnDestroy() {
    clearInterval(this.timer); // cleanup khi component bị huỷ
  }
}

