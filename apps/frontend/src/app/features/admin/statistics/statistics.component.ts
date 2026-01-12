import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="statistics-page page">
      <div class="container">
        <a routerLink="/admin" class="back-link">← Volver al Panel</a>

        <header class="page-header">
          <h1 class="page-title">Estadisticas</h1>
          <p class="page-subtitle">Metricas y reportes del torneo</p>
        </header>

        <div class="coming-soon">
          <div class="coming-soon-icon">📊</div>
          <h2>Proximamente</h2>
          <p>Las estadisticas detalladas estaran disponibles pronto.</p>
          <ul>
            <li>Participacion por semana</li>
            <li>Preguntas mas dificiles</li>
            <li>Engagement de videos</li>
            <li>Exportar reportes a Excel</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: var(--spacing-lg);
      color: var(--color-text-secondary);
    }

    .coming-soon {
      text-align: center;
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xxl);
      box-shadow: var(--shadow-sm);
    }

    .coming-soon-icon {
      font-size: 4rem;
      margin-bottom: var(--spacing-lg);
    }

    .coming-soon h2 {
      margin-bottom: var(--spacing-md);
    }

    .coming-soon p {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-lg);
    }

    .coming-soon ul {
      list-style: none;
      padding: 0;
      color: var(--color-text-secondary);

      li {
        padding: var(--spacing-sm) 0;
      }
    }
  `]
})
export class StatisticsComponent {}
