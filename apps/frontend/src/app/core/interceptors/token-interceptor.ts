import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TokenRefreshHttpService } from '../services/token-refresh-http.service';
import { AuthState } from '../state/auth.state';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private tokenRefreshService: TokenRefreshHttpService,
    private authState: AuthState
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Chỉ áp dụng cho GraphQL requests
    if (!request.url.includes('/graphql')) {
      return next.handle(request);
    }

    // Kiểm tra xem có cần proactive refresh không
    return from(this.tokenRefreshService.proactiveRefresh()).pipe(
      switchMap((token) => {
        // Nếu có token mới, cập nhật header
        if (token) {
          const updatedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(updatedRequest);
        }
        
        // Nếu không có token mới, gửi request như bình thường
        return next.handle(request);
      })
    );
  }
}
