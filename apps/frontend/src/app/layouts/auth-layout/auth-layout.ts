import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeAnimations } from '../../shared/animations/route-animations';

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
}
