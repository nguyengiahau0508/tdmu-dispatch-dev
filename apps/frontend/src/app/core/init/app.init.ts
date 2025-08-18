
// src/app/core/init/app-init.ts
import { inject } from '@angular/core';
import { AuthenticationFlowService } from '../services/authentication-flow.service';

export function appInitializerFactory(): () => Promise<void> {
  return async () => {
    const authFlowService = inject(AuthenticationFlowService);
    
    try {
      await authFlowService.initializeAuthentication();
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  };
}

