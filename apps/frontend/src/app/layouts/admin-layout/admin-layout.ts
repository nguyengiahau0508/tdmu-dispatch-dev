import { Component, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AppsLauncher } from '../components/apps-launcher/apps-launcher';
import { IUser } from '../../core/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { UserState } from '../../core/state/user.state';
import { AuthService } from '../../core/services/auth.service';
import { routeAnimations } from '../../shared/animations/route-animations';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AppsLauncher],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  animations: [routeAnimations]
})
export class AdminLayout {
  isDarkMode = false;
  currentUser: IUser | null = null
  currentUrl = ''

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

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    })

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

  isActive(path: string): boolean {
    return this.currentUrl.startsWith(path);
  }

  getAnimationData() {
    return location.pathname; // hoặc router url để thay đổi animation khi route đổi
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

  onGoToUsers() {
    this.router.navigate(['admin', 'users'])
  }

  onGoToOrganizational() {
    this.router.navigate(['admin', 'organizational'])
  }
}
