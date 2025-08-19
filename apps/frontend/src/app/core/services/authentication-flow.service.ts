import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '../state/auth.state';
import { UserState } from '../state/user.state';
import { TokenValidationService } from './token-validation.service';
import { TokenRefreshHttpService } from './token-refresh-http.service';
import { UsersService } from './users.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationFlowService {
  private router = inject(Router);
  private authState = inject(AuthState);
  private userState = inject(UserState);
  private tokenValidationService = inject(TokenValidationService);
  private tokenRefreshService = inject(TokenRefreshHttpService);
  private usersService = inject(UsersService);

  private isInitializing = false;

  /**
   * Kiểm tra và xử lý authentication khi app khởi động
   */
  async initializeAuthentication(): Promise<void> {
    if (this.isInitializing) {
      console.log('Authentication initialization already in progress');
      return;
    }

    this.isInitializing = true;
    console.log('Starting authentication initialization...');

    try {
      // Kiểm tra xem có đang trong quá trình đăng nhập lần đầu không
      const emailForOtp = this.authState.getEmailForOtp();
      const isOnOtpPage = window.location.pathname.includes('/auth/otp-input');
      const isOnResetPage = window.location.pathname.includes('/auth/reset-password');
      
      // Nếu đang trong quá trình đăng nhập lần đầu, không can thiệp
      if (emailForOtp && (isOnOtpPage || isOnResetPage)) {
        console.log('User is in first login flow, skipping authentication check');
        return;
      }

      const accessToken = this.authState.getAccessToken();
      
      if (!accessToken) {
        console.log('No access token found, redirecting to login');
        this.redirectToLogin();
        return;
      }

      // Kiểm tra token validity với support cho one-time token
      if (!this.tokenValidationService.isTokenValid(accessToken)) {
        console.log('Access token is invalid/expired, clearing and redirecting to login');
        this.clearAuthenticationData();
        this.redirectToLogin();
        return;
      }

      // Kiểm tra xem có cần refresh token không
      if (this.tokenValidationService.shouldRefreshToken(accessToken)) {
        console.log('Token expiring soon, attempting to refresh...');
        await this.handleTokenRefresh();
      } else {
        console.log('Token is still valid, getting user data...');
        await this.loadUserData();
      }
    } catch (error) {
      console.error('Authentication initialization failed:', error);
      this.clearAuthenticationData();
      this.redirectToLogin();
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Xử lý refresh token
   */
  private async handleTokenRefresh(): Promise<void> {
    try {
      const newToken = await this.tokenRefreshService.refreshToken();
      if (newToken) {
        console.log('Token refreshed successfully, loading user data...');
        await this.loadUserData();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthenticationData();
      this.redirectToLogin();
    }
  }

  /**
   * Load user data
   */
  private async loadUserData(): Promise<void> {
    try {
      await firstValueFrom(this.usersService.getCurrentUserData());
      console.log('User data loaded successfully');
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Nếu không load được user data, có thể token đã hết hạn
      this.clearAuthenticationData();
      this.redirectToLogin();
    }
  }

  /**
   * Kiểm tra authentication status cho auth layout
   */
  checkAuthLayoutStatus(): void {
    const currentUser = this.userState.getUser();
    const accessToken = this.authState.getAccessToken();

    // Nếu có user data và token hợp lệ, redirect về trang chủ
    if (currentUser && accessToken && this.tokenValidationService.isTokenValid(accessToken)) {
      console.log('User already authenticated, redirecting to home');
      this.router.navigate(['']);
      return;
    }

    // Nếu có token nhưng không hợp lệ, clear và ở lại trang login
    if (accessToken && !this.tokenValidationService.isTokenValid(accessToken)) {
      console.log('Invalid token found, clearing authentication data');
      this.clearAuthenticationData();
    }

    console.log('User needs to login');
  }

  /**
   * Clear tất cả authentication data
   */
  private clearAuthenticationData(): void {
    this.authState.clearAllTokens();
    this.userState.clearUser();
    localStorage.clear();
    sessionStorage.clear();
  }

  /**
   * Redirect về trang login
   */
  private redirectToLogin(): void {
    this.router.navigate(['auth']);
  }

  /**
   * Force logout và redirect về login
   */
  forceLogout(): void {
    console.log('Force logout initiated');
    this.clearAuthenticationData();
    this.redirectToLogin();
  }

  /**
   * Kiểm tra xem có đang trong quá trình initialization không
   */
  isInitializingAuth(): boolean {
    return this.isInitializing;
  }
}
