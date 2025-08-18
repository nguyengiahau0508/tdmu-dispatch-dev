import { Injectable, inject } from '@angular/core';
import { AuthState } from '../state/auth.state';
import { UserState } from '../state/user.state';
import { TokenRefreshHttpService } from './token-refresh-http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateManagerService {
  private authState = inject(AuthState);
  private userState = inject(UserState);
  private tokenRefreshService = inject(TokenRefreshHttpService);

  private isLoggingOut = false;

  /**
   * Force logout và clear tất cả data
   */
  forceLogout(): void {
    if (this.isLoggingOut) {
      console.log('Logout already in progress, skipping...');
      return;
    }

    this.isLoggingOut = true;
    console.log('Force logout initiated...');

    try {
      // Stop any ongoing token refresh process
      this.tokenRefreshService.forceStopRefresh();
      
      // Clear tất cả tokens và user data
      this.authState.clearAllTokens();
      this.userState.clearUser();
      
      // Clear localStorage và sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('All local data cleared');
      
      // Force redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error during force logout:', error);
      // Even if there's an error, still redirect
      window.location.href = '/auth/login';
    } finally {
      this.isLoggingOut = false;
    }
  }

  /**
   * Clear Apollo cache (được gọi từ bên ngoài để tránh circular dependency)
   */
  clearApolloCache(apolloClient: any): void {
    try {
      if (apolloClient && apolloClient.clearStore) {
        apolloClient.clearStore();
        console.log('Apollo cache cleared');
      }
    } catch (error) {
      console.error('Error clearing Apollo cache:', error);
    }
  }

  /**
   * Kiểm tra xem có đang trong quá trình logout không
   */
  isInLogoutProcess(): boolean {
    return this.isLoggingOut;
  }

  /**
   * Reset logout state (useful for testing)
   */
  resetLogoutState(): void {
    this.isLoggingOut = false;
  }
}
