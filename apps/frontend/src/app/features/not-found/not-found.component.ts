import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="not-found-icon">📖</div>
        <h1>404</h1>
        <h2>Pagina no encontrada</h2>
        <p>Lo sentimos, la pagina que buscas no existe o ha sido movida.</p>
        <a routerLink="/" class="btn btn-primary btn-lg">
          Volver al Inicio
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      padding: var(--spacing-lg);
    }

    .not-found-content {
      text-align: center;
      max-width: 400px;
    }

    .not-found-icon {
      font-size: 4rem;
      margin-bottom: var(--spacing-lg);
    }

    h1 {
      font-size: 6rem;
      font-weight: 700;
      color: var(--color-primary);
      margin: 0;
      line-height: 1;
    }

    h2 {
      font-size: 1.5rem;
      margin-bottom: var(--spacing-md);
    }

    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xl);
    }
  `]
})
export class NotFoundComponent {}
