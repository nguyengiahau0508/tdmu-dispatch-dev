import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'frontend';
  constructor(
    private router: Router,
  ) {
    // App initialization đã được xử lý trong app.init.ts
    // Không cần refresh token ở đây để tránh vòng lặp
  }
}
