import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {

  /**
   * Kiểm tra xem token có hợp lệ không
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
   * Lấy thời gian còn lại của token (tính bằng giây)
   */
  getTokenTimeRemaining(token: string | null): number {
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      console.error('Error parsing token:', error);
      return 0;
    }
  }

  /**
   * Lấy thông tin payload của token
   */
  getTokenPayload(token: string | null): any {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  /**
   * Kiểm tra xem có nên refresh token không
   */
  shouldRefreshToken(token: string | null): boolean {
    if (!this.isTokenValid(token)) {
      return false; // Token không hợp lệ, không refresh
    }
    
    if (this.isTokenExpiringSoon(token)) {
      return true; // Token sắp hết hạn, nên refresh
    }
    
    return false; // Token còn hạn, không cần refresh
  }
}
