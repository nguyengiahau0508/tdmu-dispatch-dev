import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { routeAnimations } from '../../shared/animations/route-animations';

@Component({
  selector: 'app-organizational',
  imports: [RouterOutlet],
  templateUrl: './organizational.html',
  styleUrl: './organizational.css',
  animations: [routeAnimations]
})
export class Organizational {

  constructor(private router: Router) { }
  getAnimationData() {
    return location.pathname;
  }

  onGoToUnits() {
    this.router.navigate(['admin', 'organizational', 'units'])
  }

  onGoToUnitType() {
    this.router.navigate(['admin', 'organizational', 'unit-types'])
  }


}
