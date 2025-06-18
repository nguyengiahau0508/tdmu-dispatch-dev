import { Component, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppsLauncher } from '../components/apps-launcher/apps-launcher';
import { IUser } from '../../core/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { UserState } from '../../core/state/user.state';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AppsLauncher],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  isDarkMode = false;
  currentUser: IUser | null = null

  isAppsLauncherOpen = false

  private subscriptions = new Subscription();
  constructor(
    private renderer: Renderer2,
    private userState: UserState
  ) {
    const storedTheme = localStorage.getItem('theme');
    this.isDarkMode = storedTheme === 'dark';
    this.updateThemeClass();

    this.subscriptions.add(
      this.userState.user$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateThemeClass();
  }

  toggleAppsLauncher() {
    this.isAppsLauncherOpen = !this.isAppsLauncherOpen;
  }

  private updateThemeClass() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.documentElement, 'dark-mode');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark-mode');
    }
  }
}
