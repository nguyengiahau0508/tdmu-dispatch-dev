import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { routeAnimations } from '../../shared/animations/route-animations';

@Component({
  selector: 'app-organizational',
  imports: [RouterOutlet],
  templateUrl: './organizational.html',
  styleUrl: './organizational.css',
  animations: [routeAnimations]
})
export class Organizational {
  currentUrl = ''

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    })
  }

  isActive(path: string): boolean {
    return this.currentUrl.startsWith(path);
  }

  getAnimationData() {
    return location.pathname;
  }

  onGoToUnits() {
    this.router.navigate(['admin', 'organizational', 'units'])
  }

  onGoToUnitType() {
    this.router.navigate(['admin', 'organizational', 'unit-types'])
  }

  onGoToPoisitions() {
    this.router.navigate(['admin', 'organizational', 'positions'])
  }
}
