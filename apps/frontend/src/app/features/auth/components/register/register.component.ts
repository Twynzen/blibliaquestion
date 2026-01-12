import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">📖</span>
          <h1 class="auth-title">Crear Cuenta</h1>
          <p class="auth-subtitle">Unete a Biblia Question y empieza a competir</p>
        </div>

        @if (authService.error()) {
          <div class="alert alert-error">
            {{ authService.error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="displayName" class="form-label">Nombre para mostrar</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              [(ngModel)]="displayName"
              class="form-input"
              placeholder="Tu nombre"
              required
              [disabled]="authService.loading()"
            />
            <span class="form-hint">Este nombre aparecera en el ranking</span>
          </div>

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
              placeholder="Minimo 6 caracteres"
              required
              minlength="6"
              [disabled]="authService.loading()"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmar contrasena</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              class="form-input"
              [class.error]="passwordMismatch()"
              placeholder="Repite tu contrasena"
              required
              [disabled]="authService.loading()"
            />
            @if (passwordMismatch()) {
              <span class="form-error">Las contrasenas no coinciden</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full btn-lg"
            [disabled]="authService.loading() || !isFormValid()"
          >
            @if (authService.loading()) {
              Creando cuenta...
            } @else {
              Crear Cuenta
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Ya tienes cuenta?
            <a routerLink="/auth/login">Inicia sesion</a>
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

    .auth-icon {
      font-size: 3rem;
      display: block;
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
export class RegisterComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';

  passwordMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.password !== this.confirmPassword;
  }

  isFormValid(): boolean {
    return (
      this.displayName.trim() !== '' &&
      this.email.trim() !== '' &&
      this.password.length >= 6 &&
      this.password === this.confirmPassword
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    const success = await this.authService.register(
      this.email,
      this.password,
      this.displayName
    );

    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }
}
