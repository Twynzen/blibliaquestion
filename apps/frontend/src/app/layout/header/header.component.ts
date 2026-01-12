import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-container">
        <a routerLink="/dashboard" class="logo">
          <span class="logo-icon">📖</span>
          <span class="logo-text">Biblia Question</span>
        </a>

        <nav class="nav-menu">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            Inicio
          </a>
          <a routerLink="/tournaments" routerLinkActive="active" class="nav-link">
            Torneos
          </a>
          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="nav-link nav-admin">
              Admin
            </a>
          }
        </nav>

        <div class="user-section">
          <div class="user-stars">
            <span class="star-icon">⭐</span>
            <span class="star-count">{{ authService.currentUser()?.totalStars || 0 }}</span>
          </div>

          <div class="user-menu">
            <button class="user-button" (click)="toggleMenu()">
              <span class="user-avatar">
                {{ getInitials() }}
              </span>
              <span class="user-name">{{ authService.userDisplayName() }}</span>
            </button>

            @if (menuOpen) {
              <div class="dropdown-menu">
                <div class="dropdown-header">
                  <span class="dropdown-email">{{ authService.currentUser()?.email }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" (click)="logout()">
                  Cerrar sesion
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      z-index: 100;
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      padding: 0 var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--color-text-primary);
      text-decoration: none;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .nav-menu {
      display: flex;
      gap: var(--spacing-md);
    }

    .nav-link {
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);

      &:hover {
        color: var(--color-text-primary);
        background-color: rgba(0, 0, 0, 0.05);
      }

      &.active {
        color: var(--color-primary);
        background-color: rgba(74, 144, 217, 0.1);
      }

      &.nav-admin {
        color: var(--color-secondary-dark);

        &.active {
          background-color: rgba(240, 193, 75, 0.2);
        }
      }
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .user-stars {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background-color: rgba(240, 193, 75, 0.2);
      border-radius: var(--radius-full);
    }

    .star-count {
      font-weight: 600;
      color: var(--color-secondary-dark);
    }

    .user-menu {
      position: relative;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs);
      background: none;
      border: none;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: var(--spacing-xs);
      min-width: 200px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }

    .dropdown-header {
      padding: var(--spacing-md);
    }

    .dropdown-email {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--color-border);
    }

    .dropdown-item {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      color: var(--color-text-primary);
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }

      .user-name {
        display: none;
      }

      .logo-text {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  getInitials(): string {
    const name = this.authService.userDisplayName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.menuOpen = false;
    this.router.navigate(['/auth/login']);
  }
}
