import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { UsersService } from './core/services/users.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'frontend';
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private router: Router,
    //private toastr: ToastrService
  ) {
    this.authService.refreshToken().subscribe({
      next: () => {
        this.usersService.getCurrentUserData().subscribe()
      },
      error: () => {
        this.router.navigate(['auth'])
      }
    })
  }
}
