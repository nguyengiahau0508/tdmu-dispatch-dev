import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-document-catalog',
  imports: [RouterOutlet],
  templateUrl: './document-catalog.html',
  styleUrl: './document-catalog.css'
})
export class DocumentCatalog {
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

  onGoToDocumentType() {
    this.router.navigate(['admin', 'document-catalog', 'document-type'])
  }

  onGoToDocumentCategory() {
    this.router.navigate(['admin', 'document-catalog', 'document-category'])
  }
}
