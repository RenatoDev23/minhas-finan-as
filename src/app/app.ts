import { ChangeDetectionStrategy, Component, inject, Renderer2, effect, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FinancialService } from './financial.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App {
  private financialService = inject(FinancialService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const status = this.financialService.liquidityStatus();
        const root = this.document.documentElement;
        const body = this.document.body;
        
        // Remove all theme classes from both html and body
        const classes = ['theme-positive', 'theme-warning', 'theme-negative'];
        classes.forEach(c => {
          this.renderer.removeClass(root, c);
          this.renderer.removeClass(body, c);
        });
        
        // Add current theme class
        const newClass = `theme-${status}`;
        this.renderer.addClass(root, newClass);
        this.renderer.addClass(body, newClass);
        
        // Also set data attribute for extra safety and CSS targeting
        this.renderer.setAttribute(root, 'data-theme', status);
      }
    });
  }
}
