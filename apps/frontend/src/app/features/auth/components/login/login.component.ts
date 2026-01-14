import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/images/logo_biblia_question.png" alt="Biblia Question" class="auth-logo" />
          <h1 class="auth-title">Iniciar Sesion</h1>
          <p class="auth-subtitle">Bienvenido de vuelta a Biblia Question</p>
        </div>

        @if (authService.error()) {
          <div class="alert alert-error">
            {{ authService.error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email" class="form-label">Correo electronico</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              class="form-input"
              placeholder="tu@email.com"
              required
              [disabled]="authService.loading()"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contrasena</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              class="form-input"
              placeholder="Tu contrasena"
              required
              [disabled]="authService.loading()"
            />
          </div>

          <div class="form-actions">
            <a routerLink="/auth/forgot-password" class="forgot-link">
              Olvidaste tu contrasena?
            </a>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full btn-lg"
            [disabled]="authService.loading() || !isFormValid()"
          >
            @if (authService.loading()) {
              Iniciando sesion...
            } @else {
              Iniciar Sesion
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>
            No tienes cuenta?
            <a routerLink="/auth/register">Registrate aqui</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-md);
      background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .auth-logo {
      width: 100px;
      height: 100px;
      object-fit: contain;
      margin-bottom: var(--spacing-md);
    }

    .auth-title {
      font-size: 1.75rem;
      margin-bottom: var(--spacing-xs);
    }

    .auth-subtitle {
      color: var(--color-text-secondary);
      margin: 0;
    }

    .alert {
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);

      &.alert-error {
        background-color: rgba(220, 53, 69, 0.1);
        color: var(--color-error);
        border: 1px solid rgba(220, 53, 69, 0.2);
      }
    }

    .auth-form {
      margin-bottom: var(--spacing-lg);
    }

    .form-actions {
      text-align: right;
      margin-bottom: var(--spacing-lg);
    }

    .forgot-link {
      font-size: 0.875rem;
      color: var(--color-primary);
    }

    .auth-footer {
      text-align: center;
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border);

      p {
        margin: 0;
        color: var(--color-text-secondary);
      }

      a {
        font-weight: 500;
      }
    }
  `]
})
export class LoginComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  isFormValid(): boolean {
    return this.email.trim() !== '' && this.password.trim() !== '';
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    const success = await this.authService.login(this.email, this.password);
    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }
}
