
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthState {
  private emailForOtp = new BehaviorSubject<string | null>(null);
  public emailForOtp$: Observable<string | null> = this.emailForOtp.asObservable();

  getEmailForOtp(): string | null {
    return this.emailForOtp.getValue();
  }

  setEmailForOtp(email: string): void {
    this.emailForOtp.next(email);
  }

  clearEmailForOtp(): void {
    this.emailForOtp.next(null);
  }
}

