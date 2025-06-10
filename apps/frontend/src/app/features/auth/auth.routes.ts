import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { ResetPassword } from "./reset-password/reset-password";
import { ForgotPassword } from "./forgot-password/forgot-password";
import { OtpInput } from "./otp-input/otp-input";

export const authRoutes: Routes = [
  { path: 'login', component: Login },
  { path: 'reset-password', component: ResetPassword },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'otp-input', component: OtpInput },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
]
