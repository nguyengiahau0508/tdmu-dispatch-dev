import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { IUser } from "../interfaces/user.interface";

@Injectable({ providedIn: 'root' })
export class UserState {
  private user = new BehaviorSubject<IUser | null>(null)
  public user$: Observable<IUser | null> = this.user.asObservable()

  getUser(): IUser | null {
    return this.user.getValue()
  }

  setUser(user: IUser): void {
    this.user.next(user)
  }

  clearUser(): void {
    this.user.next(null)
  }
}
