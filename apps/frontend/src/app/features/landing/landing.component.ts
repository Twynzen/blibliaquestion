import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="landing">
      <!-- Partículas doradas flotantes -->
      <div class="particles-container">
        <div
          *ngFor="let particle of particles"
          class="particle"
          [style.left.%]="particle.x"
          [style.width.px]="particle.size"
          [style.height.px]="particle.size"
          [style.animation-duration.s]="particle.duration"
          [style.animation-delay.s]="particle.delay"
        ></div>
      </div>

      <section class="hero">
        <div class="hero-content">
          <div class="hero-logo animate-pulse">
            <img src="/images/logo_biblia_question.png" alt="Biblia Question Logo" class="logo-image" />
          </div>
          <h1 class="hero-title animate-titleReveal">
            BIBLIA QUESTION
          </h1>
          <div class="ornament">
            <div class="ornament-line"></div>
            <span class="ornament-symbol">✦</span>
            <div class="ornament-line"></div>
          </div>
          <p class="hero-subtitle animate-fadeInUp delay-300">
            «Lámpara es a mis pies tu palabra, y lumbrera a mi camino»
          </p>
          <p class="hero-description animate-fadeInUp delay-400">
            <span class="hero-highlight">¡¡¡ Aprende de la Biblia mientras compites en emocionantes torneos internacionales !!!</span>
          </p>
          <p class="hero-description-secondary animate-fadeInUp delay-450">
            Responde preguntas a diario, gana estrellas, sube de ranking y sumérgete en la poderosa palabra de Dios.
          </p>
          <p class="hero-question animate-fadeInUp delay-500">
            ¿Tienes el nivel para ser el próximo ganador del torneo?
          </p>
          <p class="hero-cta-text animate-fadeInUp delay-550">
            ¡¡¡ Averígualo !!!
          </p>
          <div class="hero-actions animate-fadeInUp delay-600">
            <a routerLink="/auth/register" class="btn btn-golden btn-lg">
              Comenzar ahora
            </a>
            <a routerLink="/auth/login" class="btn btn-outline-light btn-lg">
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="features-container">
          <h2 class="features-title title-biblical">Cómo Funciona</h2>
          <div class="ornament">
            <div class="ornament-line"></div>
            <span class="ornament-symbol">✦</span>
            <div class="ornament-line"></div>
          </div>

          <div class="features-grid">
            <div class="feature-card animate-on-scroll" [class.visible]="visibleCards['card1']" #card1>
              <div class="feature-icon">📅</div>
              <h3 class="feature-title">Preguntas Diarias</h3>
              <p class="feature-description">
                Cada día recibe nuevas preguntas basadas en versículos bíblicos.
                Aprende mientras juegas.
              </p>
            </div>

            <div class="feature-card animate-on-scroll" [class.visible]="visibleCards['card2']" #card2>
              <div class="feature-icon">🎬</div>
              <h3 class="feature-title">Videos de YouTube</h3>
              <p class="feature-description">
                Mira shorts explicativos antes de cada pregunta.
                Profundiza con videos largos al final del día.
              </p>
            </div>

            <div class="feature-card animate-on-scroll" [class.visible]="visibleCards['card3']" #card3>
              <div class="feature-icon">⭐</div>
              <h3 class="feature-title">Gana Estrellas</h3>
              <p class="feature-description">
                Responde correctamente y acumula estrellas.
                Las preguntas extra valen el triple.
              </p>
            </div>

            <div class="feature-card animate-on-scroll" [class.visible]="visibleCards['card4']" #card4>
              <div class="feature-icon">🎯</div>
              <h3 class="feature-title">Retos Diarios</h3>
              <p class="feature-description">
                Graba videos cumpliendo retos especiales.
                Gana 5 estrellas extra por cada reto aprobado.
              </p>
            </div>

            <div class="feature-card animate-on-scroll" [class.visible]="visibleCards['card5']" #card5>
              <div class="feature-icon">🏆</div>
              <h3 class="feature-title">Torneos de 15 Semanas</h3>
              <p class="feature-description">
                Compite durante 15 semanas en torneos temáticos.
                Sube en el ranking y demuestra tu conocimiento.
              </p>
            </div>

            <div class="feature-card animate-on-scroll" [class.visible]="visibleCards['card6']" #card6>
              <div class="feature-icon">📊</div>
              <h3 class="feature-title">Ranking en Vivo</h3>
              <p class="feature-description">
                Ve tu posición actualizada en tiempo real.
                Compite con otros participantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Banner con scroll infinito -->
      <div class="scroll-banner">
        <div class="scroll-text">
          <span>✦ Gloria a Dios en las alturas ✦</span>
          <span>✧ Paz en la tierra a los hombres ✧</span>
          <span>✦ Bendito el que viene en nombre del Señor ✦</span>
          <span>✧ Santo, Santo, Santo ✧</span>
          <span>✦ Gloria a Dios en las alturas ✦</span>
          <span>✧ Paz en la tierra a los hombres ✧</span>
          <span>✦ Bendito el que viene en nombre del Señor ✦</span>
          <span>✧ Santo, Santo, Santo ✧</span>
        </div>
      </div>

      <section class="cta">
        <div class="cta-content">
          <h2 class="cta-title">¿Listo para comenzar?</h2>
          <p class="cta-text">
            Únete a cientos de participantes y aprende la Biblia de forma divertida.
          </p>
          <a routerLink="/auth/register" class="btn btn-golden btn-lg">
            Crear mi cuenta gratis
          </a>
        </div>
      </section>

      <footer class="footer">
        <p class="footer-text">Biblia Question - Torneos Bíblicos Interactivos</p>
        <p class="footer-verse">«Todo lo puedo en Cristo que me fortalece» - Filipenses 4:13</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing {
      min-height: 100vh;
      background-color: var(--color-background);
      position: relative;
      overflow-x: hidden;
    }

    /* Partículas doradas */
    .particles-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      background: radial-gradient(circle, var(--color-secondary) 0%, transparent 70%);
      border-radius: 50%;
      animation: floatParticle linear infinite;
    }

    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(
        135deg,
        var(--color-primary-dark) 0%,
        var(--color-primary) 50%,
        var(--color-accent-dark) 100%
      );
      color: white;
      text-align: center;
      padding: var(--spacing-xl);
      position: relative;
      z-index: 2;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 40%);
      pointer-events: none;
    }

    .hero-content {
      max-width: 700px;
      position: relative;
      z-index: 1;
    }

    .hero-logo {
      margin-bottom: var(--spacing-md);
      filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.4));
    }

    .logo-image {
      width: 120px;
      height: 120px;
      object-fit: contain;
      border-radius: var(--radius-lg);
    }

    .hero-title {
      font-family: 'Cinzel', serif;
      font-size: clamp(2.5rem, 8vw, 4rem);
      font-weight: 600;
      margin-bottom: var(--spacing-md);
      letter-spacing: 0.15em;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hero .ornament {
      margin: var(--spacing-lg) auto;
      max-width: 350px;
      opacity: 0;
      animation: fadeIn 1s ease-out 0.8s forwards;
    }

    .hero .ornament-line {
      background: linear-gradient(90deg, transparent, var(--color-secondary), transparent);
    }

    .hero .ornament-symbol {
      color: var(--color-secondary);
      font-size: 1.5rem;
    }

    .hero-subtitle {
      font-family: 'Cinzel', serif;
      font-style: italic;
      font-size: clamp(1rem, 3vw, 1.25rem);
      color: var(--color-secondary-light);
      margin-bottom: var(--spacing-md);
      opacity: 0;
    }

    .hero-description {
      font-size: 1.125rem;
      opacity: 0;
      line-height: 1.8;
      margin-bottom: var(--spacing-md);
      color: rgba(255, 255, 255, 0.9);
    }

    .hero-highlight {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-secondary-light);
      display: block;
    }

    .hero-description-secondary {
      font-size: 1.1rem;
      opacity: 0;
      line-height: 1.8;
      margin-bottom: var(--spacing-md);
      color: rgba(255, 255, 255, 0.85);
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .hero-question {
      font-size: 1.15rem;
      opacity: 0;
      line-height: 1.6;
      margin-bottom: var(--spacing-sm);
      color: rgba(255, 255, 255, 0.9);
      font-style: italic;
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .hero-cta-text {
      font-size: 1.5rem;
      font-weight: 700;
      opacity: 0;
      color: var(--color-secondary);
      margin-bottom: var(--spacing-xl);
      text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
      animation: fadeInUp 0.6s ease-out forwards, textGlow 2s ease-in-out infinite;
    }

    .delay-450 {
      animation-delay: 0.45s;
    }

    .delay-550 {
      animation-delay: 0.55s;
    }

    .hero-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
      opacity: 0;
    }

    .btn-outline-light {
      background-color: transparent;
      border: 2px solid rgba(255, 255, 255, 0.8);
      color: white;
      padding: var(--spacing-sm) var(--spacing-lg);
      font-size: 1rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-normal);

      &:hover {
        background-color: white;
        color: var(--color-primary-dark);
        transform: translateY(-2px);
      }
    }

    /* Features Section */
    .features {
      padding: var(--spacing-xxl) var(--spacing-md);
      background: linear-gradient(180deg, var(--color-cream) 0%, var(--color-background) 100%);
      position: relative;
      z-index: 2;
    }

    .features-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .features-title {
      text-align: center;
      font-size: clamp(1.75rem, 5vw, 2.5rem);
      margin-bottom: var(--spacing-sm);
      color: var(--color-accent);
    }

    .features .ornament {
      margin-bottom: var(--spacing-xxl);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .feature-card {
      background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-cream) 100%);
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      text-align: center;
      transition: all var(--transition-normal);
      border: 1px solid var(--color-border);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--color-secondary-dark), var(--color-secondary), var(--color-secondary-dark));
        opacity: 0;
        transition: opacity var(--transition-normal);
      }

      &:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-lg);

        &::before {
          opacity: 1;
        }
      }
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
    }

    .feature-title {
      font-family: 'Cinzel', serif;
      font-size: 1.25rem;
      margin-bottom: var(--spacing-sm);
      color: var(--color-accent);
      letter-spacing: 0.02em;
    }

    .feature-description {
      color: var(--color-text-secondary);
      line-height: 1.7;
      margin: 0;
    }

    /* Scroll Banner */
    .scroll-banner {
      background: var(--color-accent-dark);
      padding: var(--spacing-md) 0;
      overflow: hidden;
      position: relative;
      z-index: 2;
    }

    .scroll-text {
      display: flex;
      animation: scrollBanner 40s linear infinite;
    }

    .scroll-text span {
      font-family: 'Cinzel', serif;
      font-size: 0.875rem;
      color: var(--color-secondary);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      white-space: nowrap;
      padding: 0 var(--spacing-xl);
    }

    @keyframes scrollBanner {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* CTA Section */
    .cta {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: white;
      padding: var(--spacing-xxl) var(--spacing-md);
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .cta::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 60%);
      pointer-events: none;
    }

    .cta-content {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
    }

    .cta-title {
      font-family: 'Cinzel', serif;
      font-size: clamp(1.5rem, 4vw, 2rem);
      margin-bottom: var(--spacing-md);
      letter-spacing: 0.05em;
    }

    .cta-text {
      font-size: 1.125rem;
      opacity: 0.9;
      margin-bottom: var(--spacing-lg);
      line-height: 1.7;
    }

    /* Footer */
    .footer {
      background: var(--color-primary-dark);
      color: white;
      padding: var(--spacing-xl);
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .footer-text {
      font-family: 'Cinzel', serif;
      margin: 0 0 var(--spacing-sm);
      letter-spacing: 0.1em;
      font-size: 0.9rem;
    }

    .footer-verse {
      font-style: italic;
      margin: 0;
      opacity: 0.7;
      font-size: 0.85rem;
      color: var(--color-secondary-light);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-title {
        letter-spacing: 0.08em;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .scroll-text span {
        font-size: 0.75rem;
        padding: 0 var(--spacing-lg);
      }
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  particles: Particle[] = [];
  visibleCards: { [key: string]: boolean } = {};
  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.generateParticles();
    if (this.isBrowser) {
      this.setupIntersectionObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private generateParticles(): void {
    this.particles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 8,
    }));
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-card-id');
            if (id) {
              this.visibleCards[id] = true;
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    // Observar las tarjetas después de que el DOM esté listo
    setTimeout(() => {
      const cards = document.querySelectorAll('.feature-card');
      cards.forEach((card, index) => {
        card.setAttribute('data-card-id', `card${index + 1}`);
        this.observer?.observe(card);
      });
    }, 100);
  }
}
