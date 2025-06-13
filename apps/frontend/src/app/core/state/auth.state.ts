
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthState {
  private emailForOtp = new BehaviorSubject<string | null>(null);
  public emailForOtp$: Observable<string | null> = this.emailForOtp.asObservable();

  private accessToken = new BehaviorSubject<string | null>(null)
  public accessToken$: Observable<string | null> = this.accessToken.asObservable()

  getEmailForOtp(): string | null {
    return this.emailForOtp.getValue();
  }

  setEmailForOtp(email: string): void {
    this.emailForOtp.next(email);
  }

  clearEmailForOtp(): void {
    this.emailForOtp.next(null);
  }

  getAccessToken(): string | null {
    return this.accessToken.getValue()
  }

  setAccessToken(accessToken: string): void {
    this.accessToken.next(accessToken)
  }

  clearAccessToken(): void {
    this.accessToken.next(null)
  }
}

