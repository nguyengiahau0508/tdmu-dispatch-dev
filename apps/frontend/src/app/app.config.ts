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
        preset: Aura
      }
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
