import { Component, Renderer2 } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UserState } from '../../core/state/user.state';
import { IUser } from '../../core/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { AppsLauncher } from '../components/apps-launcher/apps-launcher';
import { AuthService } from '../../core/services/auth.service';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, AppsLauncher],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  isDarkMode = false;
  currentUser: IUser | null = null

  isAppsLauncherOpen = false

  avatarUrl: string | null = null
  private subscriptions = new Subscription();
  constructor(
    private renderer: Renderer2,
    private userState: UserState,
    private authService: AuthService,
    private router: Router,
    private fileService: FileService
  ) {
    const storedTheme = localStorage.getItem('theme');
    this.isDarkMode = storedTheme === 'dark';
    this.updateThemeClass();

    this.subscriptions.add(
      this.userState.user$.subscribe(async user => {
        this.currentUser = user;

        if (user && user.avatarFileId) {
          this.avatarUrl = await this.fileService.getFileUrl(user.avatarFileId);
          console.log(this.avatarUrl)
        } else {
          this.avatarUrl = null;
        }
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

  onLogout() {
    this.authService.logout().subscribe({
      next: response => {
        this.router.navigate(['auth'])
      }
    })
  }
}
