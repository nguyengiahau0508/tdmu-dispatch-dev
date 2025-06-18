
// src/app/core/init/app-init.ts
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { firstValueFrom } from 'rxjs';

export function appInitializerFactory(): () => Promise<void> {
  return async () => {
    const authService = inject(AuthService);
    const usersService = inject(UsersService);

    try {
      const tokenRes = await firstValueFrom(authService.refreshToken());
      if (tokenRes.data?.accessToken) {
        await firstValueFrom(usersService.getCurrentUserData());
      }
    } catch (e) {
      console.warn('App Init failed:', e);
    }
  };
}

