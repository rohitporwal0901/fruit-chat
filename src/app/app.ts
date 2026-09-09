import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      padding-bottom: 80px;
    }
    @media (min-width: 768px) {
      .main-content {
        padding-bottom: 0;
        padding-top: 72px;
      }
    }
  `]
})
export class App {
  title = 'fruit-chat';
}
