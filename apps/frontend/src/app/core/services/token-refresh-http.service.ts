import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthState } from '../state/auth.state';
import { TokenValidationService } from './token-validation.service';

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshHttpService {
  private http = inject(HttpClient);
  private authState = inject(AuthState);
  private tokenValidationService = inject(TokenValidationService);
  
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private refreshFailureCount = 0;
  private readonly MAX_REFRESH_FAILURES = 3;

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
   * Refresh token sử dụng HTTP request
   */
  refreshToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      // Kiểm tra nếu đã thất bại quá nhiều lần
      if (this.refreshFailureCount >= this.MAX_REFRESH_FAILURES) {
        console.log('Too many refresh failures, forcing logout');
        this.authState.clearAllTokens();
        window.location.href = '/auth/login';
        reject(new Error('Too many refresh failures'));
        return;
      }

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

      const accessToken = this.authState.getAccessToken();
      if (!accessToken) {
        this.isRefreshing = false;
        console.log('No access token available for refresh');
        this.authState.clearAllTokens();
        window.location.href = '/auth/login';
        reject(new Error('No access token available'));
        return;
      }

      // Kiểm tra token validity trước khi refresh
      if (!this.tokenValidationService.isTokenValid(accessToken)) {
        this.isRefreshing = false;
        console.log('Access token is invalid/expired, redirecting to login');
        this.authState.clearAllTokens();
        window.location.href = '/auth/login';
        reject(new Error('Access token is invalid/expired'));
        return;
      }

      console.log('Access token is valid, attempting to refresh...');

      // Gọi API refresh token bằng HTTP
      const mutation = `
        mutation {
          refreshToken {
            metadata {
              statusCode
              message
            }
            data {
              accessToken
            }
          }
        }
      `;

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      });

      this.http.post<{
        data: {
          refreshToken: {
            metadata: { statusCode: number; message: string };
            data: { accessToken: string; refreshToken?: string };
          };
        };
      }>(`${environment.apiBaseUrl}/graphql`, {
        query: mutation
      }, { headers }).subscribe({
        next: (response) => {
          const newAccessToken = response.data?.refreshToken?.data?.accessToken;
          
          if (newAccessToken) {
            this.authState.setAccessToken(newAccessToken);
            this.refreshFailureCount = 0; // Reset failure count on success
            
            this.refreshTokenSubject.next(newAccessToken);
            resolve(newAccessToken);
          } else {
            this.refreshTokenSubject.next(null);
            this.refreshFailureCount++;
            reject(new Error('No access token received'));
          }
          this.isRefreshing = false;
        },
        error: (error) => {
          console.error('Token refresh failed:', error);
          this.refreshTokenSubject.next(null);
          this.isRefreshing = false;
          this.refreshFailureCount++;
          
          // Nếu thất bại quá nhiều lần, force logout
          if (this.refreshFailureCount >= this.MAX_REFRESH_FAILURES) {
            console.log('Max refresh failures reached, forcing logout');
            this.authState.clearAllTokens();
            window.location.href = '/auth/login';
          }
          
          reject(error);
        }
      });
    });
  }

  /**
   * Kiểm tra xem token có hợp lệ không
   */
  isTokenValid(token: string | null): boolean {
    return this.tokenValidationService.isTokenValid(token);
  }

  /**
   * Kiểm tra xem token có sắp hết hạn không (trong vòng 5 phút)
   */
  isTokenExpiringSoon(token: string | null): boolean {
    return this.tokenValidationService.isTokenExpiringSoon(token);
  }

  /**
   * Proactive refresh token nếu sắp hết hạn
   */
  proactiveRefresh(): Observable<string | null> {
    const currentToken = this.authState.getAccessToken();
    
    if (this.tokenValidationService.shouldRefreshToken(currentToken)) {
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
    
    return new Observable(observer => {
      observer.next(currentToken);
      observer.complete();
    });
  }

  /**
   * Reset trạng thái refresh
   */
  resetRefreshState(): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);
  }

  /**
   * Force stop refresh process (for logout)
   */
  forceStopRefresh(): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);
    this.refreshFailureCount = 0; // Reset failure count
    console.log('Token refresh process stopped');
  }
}
