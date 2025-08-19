import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { ResetPassword } from "./reset-password/reset-password";
import { ForgotPassword } from "./forgot-password/forgot-password";
import { OtpInput } from "./otp-input/otp-input";
import { FirstLoginGuard } from "../../core/guards/first-login.guard";

export const authRoutes: Routes = [
  { path: 'login', component: Login },
  { 
    path: 'reset-password', 
    component: ResetPassword,
    canActivate: [FirstLoginGuard]
  },
  { path: 'forgot-password', component: ForgotPassword },
  { 
    path: 'otp-input', 
    component: OtpInput,
    canActivate: [FirstLoginGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
]
