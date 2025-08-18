import { ApplicationConfig, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideApollo } from 'apollo-angular';
import { apolloOptionsFactory } from './core/config/apollo-options.factory';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { appInitializerFactory } from './core/init/app.init';
import { providePrimeNG } from 'primeng/config';
import { Tdmu } from '../theme/tdmu';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { TokenInterceptor } from './core/interceptors/token-interceptor';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAppInitializer(appInitializerFactory()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideApollo(apolloOptionsFactory),
    provideToastr(),
    providePrimeNG({
      theme: {
        preset: Tdmu
      }
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
};
