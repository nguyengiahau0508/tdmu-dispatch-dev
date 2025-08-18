import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthState } from '../state/auth.state';

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private authState: AuthState
  ) {}

  /**
   * Kiểm tra xem có đang refresh token không
   */
  get isRefreshingToken(): boolean {
    return this.isRefreshing;
  }

  /**
   * Lấy observable của refresh token
   */
  get refreshToken$(): Observable<string | null> {
    return this.refreshTokenSubject.asObservable();
  }

  /**
   * Refresh token và trả về promise
   */
  refreshToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (this.isRefreshing) {
        // Nếu đang refresh, đăng ký để nhận kết quả
        this.refreshToken$.subscribe({
          next: (token) => {
            if (token) {
              resolve(token);
            } else {
              reject(new Error('Failed to refresh token'));
            }
          },
          error: (error) => {
            reject(error);
          }
        });
        return;
      }

      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      this.authService.refreshToken().subscribe({
        next: (response) => {
          const newToken = response.data?.accessToken;
          if (newToken) {
            this.refreshTokenSubject.next(newToken);
            resolve(newToken);
          } else {
            this.refreshTokenSubject.next(null);
            reject(new Error('No access token received'));
          }
          this.isRefreshing = false;
        },
        error: (error) => {
          console.error('Token refresh failed:', error);
          this.refreshTokenSubject.next(null);
          this.isRefreshing = false;
          
          // Clear tokens và redirect to login
          this.authState.clearAllTokens();
          window.location.href = '/auth/login';
          
          reject(error);
        }
      });
    });
  }

  /**
   * Kiểm tra xem token có hợp lệ không (có thể mở rộng để check JWT expiration)
   */
  isTokenValid(token: string | null): boolean {
    if (!token) return false;
    
    try {
      // Decode JWT để kiểm tra expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Token còn hạn nếu thời gian hiện tại < thời gian hết hạn
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }

  /**
   * Kiểm tra xem token có sắp hết hạn không (trong vòng 5 phút)
   */
  isTokenExpiringSoon(token: string | null): boolean {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60; // 5 phút
      
      // Token sắp hết hạn nếu thời gian còn lại < 5 phút
      return (payload.exp - currentTime) < fiveMinutes;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }

  /**
   * Proactive refresh token nếu sắp hết hạn
   */
  proactiveRefresh(): Observable<string | null> {
    const currentToken = this.authState.getAccessToken();
    
    if (this.isTokenExpiringSoon(currentToken)) {
      console.log('Token expiring soon, proactively refreshing...');
      return new Observable(observer => {
        this.refreshToken().then(
          (newToken) => {
            observer.next(newToken);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
        );
      });
    }
    
    return of(currentToken);
  }

  /**
   * Reset trạng thái refresh
   */
  resetRefreshState(): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);
  }
}
