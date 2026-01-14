import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { GeographicDataService, Country } from '@core/services/geographic-data.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/images/logo_biblia_question.png" alt="Biblia Question" class="auth-logo" />
          <h1 class="auth-title">Crear Cuenta</h1>
          <p class="auth-subtitle">Únete a Biblia Question y empieza a competir</p>
        </div>

        @if (authService.error()) {
          <div class="alert alert-error">
            {{ authService.error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <!-- Nombre para mostrar -->
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
            <span class="form-hint">Este nombre aparecerá en el ranking</span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">Correo electrónico</label>
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

          <!-- Indicativo telefónico -->
          <div class="form-group">
            <label for="phoneCode" class="form-label">Indicativo telefónico</label>
            <select
              id="phoneCode"
              name="phoneCode"
              [(ngModel)]="selectedPhoneCode"
              class="form-input form-select"
              [disabled]="authService.loading()"
            >
              <option value="">Selecciona tu país</option>
              @for (country of countries; track country.code) {
                <option [value]="country.phoneCode">
                  {{ country.flag }} {{ country.name }} ({{ country.phoneCode }})
                </option>
              }
            </select>
          </div>

          <!-- Teléfono -->
          <div class="form-group">
            <label for="phone" class="form-label">Número de teléfono</label>
            <div class="phone-input-group">
              <span class="phone-code">{{ selectedPhoneCode || '+__' }}</span>
              <input
                type="tel"
                id="phone"
                name="phone"
                [(ngModel)]="phone"
                class="form-input phone-number"
                placeholder="Número sin indicativo"
                [disabled]="authService.loading()"
              />
            </div>
          </div>

          <!-- País -->
          <div class="form-group">
            <label for="country" class="form-label">País de residencia</label>
            <select
              id="country"
              name="country"
              [(ngModel)]="selectedCountry"
              (ngModelChange)="onCountryChange()"
              class="form-input form-select"
              [disabled]="authService.loading()"
            >
              <option value="">Selecciona tu país</option>
              @for (country of countries; track country.code) {
                <option [value]="country.code">
                  {{ country.flag }} {{ country.name }}
                </option>
              }
            </select>
          </div>

          <!-- Departamento/Estado -->
          <div class="form-group">
            <label for="state" class="form-label">Departamento / Estado / Provincia</label>
            <select
              id="state"
              name="state"
              [(ngModel)]="selectedState"
              (ngModelChange)="onStateChange()"
              class="form-input form-select"
              [disabled]="authService.loading() || !selectedCountry"
            >
              @if (!selectedCountry) {
                <option value="">Primero selecciona un país</option>
              } @else if (states().length === 0) {
                <option value="">No hay datos disponibles</option>
              } @else {
                <option value="">Selecciona tu departamento</option>
                @for (state of states(); track state) {
                  <option [value]="state">{{ state }}</option>
                }
              }
            </select>
          </div>

          <!-- Ciudad -->
          <div class="form-group">
            <label for="city" class="form-label">Ciudad</label>
            <select
              id="city"
              name="city"
              [(ngModel)]="selectedCity"
              class="form-input form-select"
              [disabled]="authService.loading() || !selectedState"
            >
              @if (!selectedState) {
                <option value="">Primero selecciona departamento</option>
              } @else if (cities().length === 0) {
                <option value="">{{ selectedCity || 'Escribe tu ciudad' }}</option>
              } @else {
                <option value="">Selecciona tu ciudad</option>
                @for (city of cities(); track city) {
                  <option [value]="city">{{ city }}</option>
                }
              }
            </select>
            @if (selectedState && cities().length === 0) {
              <input
                type="text"
                name="cityText"
                [(ngModel)]="selectedCity"
                class="form-input mt-sm"
                placeholder="Escribe el nombre de tu ciudad"
                [disabled]="authService.loading()"
              />
            }
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              class="form-input"
              placeholder="Mínimo 6 caracteres"
              required
              minlength="6"
              [disabled]="authService.loading()"
            />
          </div>

          <!-- Confirmar Contraseña -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              class="form-input"
              [class.error]="passwordMismatch()"
              placeholder="Repite tu contraseña"
              required
              [disabled]="authService.loading()"
            />
            @if (passwordMismatch()) {
              <span class="form-error">Las contraseñas no coinciden</span>
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
            ¿Ya tienes cuenta?
            <a routerLink="/auth/login">Inicia sesión</a>
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
      max-width: 480px;
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-lg);
      max-height: 90vh;
      overflow-y: auto;
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

    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
      cursor: pointer;

      &:disabled {
        background-color: var(--color-cream);
        cursor: not-allowed;
      }
    }

    .phone-input-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .phone-code {
      background-color: var(--color-cream);
      padding: var(--spacing-sm) var(--spacing-md);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      font-weight: 500;
      white-space: nowrap;
      min-width: 70px;
      text-align: center;
    }

    .phone-number {
      flex: 1;
    }

    .mt-sm {
      margin-top: var(--spacing-sm);
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

    @media (max-width: 480px) {
      .auth-card {
        padding: var(--spacing-lg);
      }

      .phone-input-group {
        flex-direction: column;
        align-items: stretch;
      }

      .phone-code {
        text-align: left;
      }
    }
  `]
})
export class RegisterComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private geoService = inject(GeographicDataService);

  // Datos del formulario
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  selectedPhoneCode = '';
  selectedCountry = '';
  selectedState = '';
  selectedCity = '';

  // Datos geográficos
  countries: Country[] = this.geoService.getCountries();

  // Estados computados para selects dependientes
  states = signal<string[]>([]);
  cities = signal<string[]>([]);

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

  onCountryChange(): void {
    // Limpiar selecciones dependientes
    this.selectedState = '';
    this.selectedCity = '';
    this.cities.set([]);

    // Cargar estados del país seleccionado
    if (this.selectedCountry) {
      const statesList = this.geoService.getStates(this.selectedCountry);
      this.states.set(statesList);
    } else {
      this.states.set([]);
    }
  }

  onStateChange(): void {
    // Limpiar ciudad
    this.selectedCity = '';

    // Cargar ciudades del estado seleccionado
    if (this.selectedCountry && this.selectedState) {
      const citiesList = this.geoService.getCities(this.selectedCountry, this.selectedState);
      this.cities.set(citiesList);
    } else {
      this.cities.set([]);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    const success = await this.authService.register(
      this.email,
      this.password,
      this.displayName
    );

    if (success) {
      // TODO: Guardar datos adicionales del perfil (teléfono, ubicación) en Firestore
      this.router.navigate(['/dashboard']);
    }
  }
}
