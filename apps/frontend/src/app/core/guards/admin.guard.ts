
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserState } from '../state/user.state';
import { Role } from '../../shared/enums/role.enum';
import { Observable, map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private userState: UserState
  ) { }

  canActivate(): Observable<boolean> {
    return this.userState.user$.pipe(
      take(1), // chỉ lấy giá trị đầu tiên
      map(user => {
        if (!user) {
          this.router.navigate(['/auth']);
          return false;
        }

        if (user.role === Role.SUPER_ADMIN) {
          return true;
        }

        this.router.navigate(['']);
        return false;
      })
    );
  }
}

