import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">🔑</span>
          <h1 class="auth-title">Recuperar Contrasena</h1>
          <p class="auth-subtitle">Te enviaremos un enlace para restablecer tu contrasena</p>
        </div>

        @if (emailSent()) {
          <div class="alert alert-success">
            Se ha enviado un correo a <strong>{{ email }}</strong> con instrucciones
            para restablecer tu contrasena.
          </div>

          <div class="auth-footer">
            <a routerLink="/auth/login" class="btn btn-primary btn-full">
              Volver a Iniciar Sesion
            </a>
          </div>
        } @else {
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

            <button
              type="submit"
              class="btn btn-primary btn-full btn-lg"
              [disabled]="authService.loading() || !email.trim()"
            >
              @if (authService.loading()) {
                Enviando...
              } @else {
                Enviar Enlace
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>
              Recordaste tu contrasena?
              <a routerLink="/auth/login">Inicia sesion</a>
            </p>
          </div>
        }
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

      &.alert-success {
        background-color: rgba(40, 167, 69, 0.1);
        color: var(--color-success);
        border: 1px solid rgba(40, 167, 69, 0.2);
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
export class ForgotPasswordComponent {
  protected authService = inject(AuthService);

  email = '';
  emailSent = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.email.trim()) return;

    const success = await this.authService.resetPassword(this.email);
    if (success) {
      this.emailSent.set(true);
    }
  }
}
