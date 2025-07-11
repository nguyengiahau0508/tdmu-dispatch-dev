
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthState } from '../state/auth.state';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authState: AuthState) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authState.getAccessToken();

    if (token) {
      // Clone request và thêm header Authorization
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
        // withCredentials: true, // nếu bạn cần cookie song song
      });

      return next.handle(authReq);
    }

    // Nếu không có token, gửi request gốc
    return next.handle(req);
  }
}
