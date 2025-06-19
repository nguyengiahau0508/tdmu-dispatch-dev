import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-apps-launcher',
  imports: [],
  templateUrl: './apps-launcher.html',
  styleUrl: './apps-launcher.css'
})
export class AppsLauncher {
  @Input() isOpen = false
  @Output() close = new EventEmitter<void>()

  constructor(
    private router: Router
  ) { }

  onGoToAdmin() {
    this.router.navigate(['admin'])
  }

  onGoToDispatch() {
    this.router.navigate([''])
  }

  onClose() {
    this.isOpen = false
    this.close.emit()
  }
}
