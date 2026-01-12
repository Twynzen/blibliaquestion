import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './layout/header/header.component';
import { LoaderComponent } from './shared/components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoaderComponent],
  template: `
    @if (authService.loading()) {
      <app-loader [fullScreen]="true" message="Cargando..." />
    } @else {
      @if (authService.isAuthenticated()) {
        <app-header />
      }
      <main class="main-content" [class.with-header]="authService.isAuthenticated()">
        <router-outlet />
      </main>
    }
  `,
  styles: [`
    .main-content {
      min-height: 100vh;

      &.with-header {
        padding-top: 64px;
      }
    }
  `]
})
export class AppComponent {
  protected authService = inject(AuthService);
}
