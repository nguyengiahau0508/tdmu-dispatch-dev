import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { routeAnimations } from '../../shared/animations/route-animations';
import { AuthenticationFlowService } from '../../core/services/authentication-flow.service';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  animations: [routeAnimations]
})
export class AuthLayout implements OnInit {
  getAnimationData() {
    return location.pathname; // hoặc router url để thay đổi animation khi route đổi
  }

  constructor(
    private router: Router,
    private authFlowService: AuthenticationFlowService
  ) {}

  ngOnInit() {
    // Kiểm tra authentication status
    this.authFlowService.checkAuthLayoutStatus();
  }
}
