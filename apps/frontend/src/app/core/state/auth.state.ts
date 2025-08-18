
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthState {
  private emailForOtp = new BehaviorSubject<string | null>(null);
  public emailForOtp$: Observable<string | null> = this.emailForOtp.asObservable();

  private accessToken = new BehaviorSubject<string | null>(null)
  public accessToken$: Observable<string | null> = this.accessToken.asObservable()

  private refreshToken = new BehaviorSubject<string | null>(null)
  public refreshToken$: Observable<string | null> = this.refreshToken.asObservable()

  // Khởi tạo token từ localStorage khi service được tạo
  constructor() {
    this.initializeTokens();
  }

  private initializeTokens(): void {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedAccessToken) {
      this.accessToken.next(storedAccessToken);
    }
    
    if (storedRefreshToken) {
      this.refreshToken.next(storedRefreshToken);
    }
  }

  getEmailForOtp(): string | null {
    return this.emailForOtp.getValue();
  }

  setEmailForOtp(email: string): void {
    this.emailForOtp.next(email);
  }

  clearEmailForOtp(): void {
    this.emailForOtp.next(null);
  }

  getAccessToken(): string | null {
    return this.accessToken.getValue()
  }

  setAccessToken(accessToken: string): void {
    this.accessToken.next(accessToken)
    localStorage.setItem('accessToken', accessToken);
  }

  clearAccessToken(): void {
    this.accessToken.next(null)
    localStorage.removeItem('accessToken');
  }

  getRefreshToken(): string | null {
    return this.refreshToken.getValue()
  }

  setRefreshToken(refreshToken: string): void {
    this.refreshToken.next(refreshToken)
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearRefreshToken(): void {
    this.refreshToken.next(null)
    localStorage.removeItem('refreshToken');
  }

  // Clear tất cả tokens khi logout
  clearAllTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
    this.clearEmailForOtp();
  }

  // Kiểm tra xem user có đang đăng nhập không
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

