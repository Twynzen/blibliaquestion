import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing">
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-icon">📖</span>
            Biblia Question
          </h1>
          <p class="hero-subtitle">
            Aprende la Biblia mientras compites en emocionantes torneos.
            Responde preguntas, gana estrellas y sube en el ranking.
          </p>
          <div class="hero-actions">
            <a routerLink="/auth/register" class="btn btn-primary btn-lg">
              Comenzar ahora
            </a>
            <a routerLink="/auth/login" class="btn btn-outline btn-lg">
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="features-container">
          <h2 class="features-title">Como funciona</h2>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3 class="feature-title">Preguntas Diarias</h3>
              <p class="feature-description">
                Cada dia recibe nuevas preguntas basadas en versiculos biblicos.
                Aprende mientras juegas.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🎬</div>
              <h3 class="feature-title">Videos de YouTube</h3>
              <p class="feature-description">
                Mira shorts explicativos antes de cada pregunta.
                Profundiza con videos largos al final del dia.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">⭐</div>
              <h3 class="feature-title">Gana Estrellas</h3>
              <p class="feature-description">
                Responde correctamente y acumula estrellas.
                Las preguntas extra valen el triple.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h3 class="feature-title">Retos Diarios</h3>
              <p class="feature-description">
                Graba videos cumpliendo retos especiales.
                Gana 5 estrellas extra por cada reto aprobado.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🏆</div>
              <h3 class="feature-title">Torneos de 15 Semanas</h3>
              <p class="feature-description">
                Compite durante 15 semanas en torneos tematicos.
                Sube en el ranking y demuestra tu conocimiento.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h3 class="feature-title">Ranking en Vivo</h3>
              <p class="feature-description">
                Ve tu posicion actualizada en tiempo real.
                Compite con otros participantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="cta">
        <div class="cta-content">
          <h2 class="cta-title">Listo para comenzar?</h2>
          <p class="cta-text">
            Unete a cientos de participantes y aprende la Biblia de forma divertida.
          </p>
          <a routerLink="/auth/register" class="btn btn-secondary btn-lg">
            Crear mi cuenta gratis
          </a>
        </div>
      </section>

      <footer class="footer">
        <p>Biblia Question - Torneos Biblicos Interactivos</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing {
      min-height: 100vh;
    }

    .hero {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
      color: white;
      text-align: center;
      padding: var(--spacing-xl);
    }

    .hero-content {
      max-width: 600px;
    }

    .hero-title {
      font-size: 3rem;
      margin-bottom: var(--spacing-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
    }

    .hero-icon {
      font-size: 3.5rem;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: var(--spacing-xl);
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-actions .btn-outline {
      border-color: white;
      color: white;

      &:hover {
        background-color: white;
        color: var(--color-primary);
      }
    }

    .features {
      padding: var(--spacing-xxl) var(--spacing-md);
      background-color: var(--color-background);
    }

    .features-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .features-title {
      text-align: center;
      font-size: 2rem;
      margin-bottom: var(--spacing-xl);
      color: var(--color-text-primary);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .feature-card {
      background-color: var(--color-surface);
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      text-align: center;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
    }

    .feature-title {
      font-size: 1.25rem;
      margin-bottom: var(--spacing-sm);
      color: var(--color-text-primary);
    }

    .feature-description {
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    .cta {
      background-color: var(--color-primary);
      color: white;
      padding: var(--spacing-xxl) var(--spacing-md);
      text-align: center;
    }

    .cta-content {
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-title {
      font-size: 2rem;
      margin-bottom: var(--spacing-md);
    }

    .cta-text {
      font-size: 1.125rem;
      opacity: 0.9;
      margin-bottom: var(--spacing-lg);
    }

    .footer {
      background-color: var(--color-text-primary);
      color: white;
      padding: var(--spacing-lg);
      text-align: center;
    }

    .footer p {
      margin: 0;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
        flex-direction: column;
      }

      .hero-icon {
        font-size: 3rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .hero-actions {
        flex-direction: column;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent {}
