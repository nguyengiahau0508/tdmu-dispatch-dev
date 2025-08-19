import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthState } from '../state/auth.state';

@Injectable({ providedIn: 'root' })
export class FirstLoginGuard implements CanActivate {
  constructor(
    private authState: AuthState,
    private router: Router
  ) {}

  canActivate(): boolean {
    const emailForOtp = this.authState.getEmailForOtp();
    
    if (!emailForOtp) {
      console.log('No email for OTP found, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    console.log('First login guard: allowing access with email:', emailForOtp);
    return true;
  }
}
