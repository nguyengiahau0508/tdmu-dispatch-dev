import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { routeAnimations } from '../../shared/animations/route-animations';
import { UserState } from '../../core/state/user.state';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  animations: [routeAnimations]
})
export class AuthLayout {
  getAnimationData() {
    return location.pathname; // hoặc router url để thay đổi animation khi route đổi
  }

  constructor(
    private router: Router,
    private userState: UserState
  ) {
    const currentUser = this.userState.getUser()
    if (currentUser) this.router.navigate([''])
  }
}
