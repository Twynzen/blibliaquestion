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

      <!-- Video Section -->
      <section class="video-section">
        <div class="video-container">
          <h2 class="video-title title-biblical">Conoce Biblia Question</h2>
          <div class="ornament">
            <div class="ornament-line"></div>
            <span class="ornament-symbol">✦</span>
            <div class="ornament-line"></div>
          </div>
          <p class="video-description">
            Descubre cómo funciona nuestra plataforma y prepárate para el desafío
          </p>
          <div class="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/wO3D341pmus"
              title="Biblia Question - Introducción"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </section>

      <!-- Social Media Bar -->
      <section class="social-section">
        <div class="social-container">
          <p class="social-text">¡Síguenos y no te pierdas ningún torneo!</p>
          <div class="social-icons">
            <a href="https://www.youtube.com/@Bibliaquestion?sub_confirmation=1" target="_blank" class="social-link youtube" aria-label="YouTube">
              <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://whatsapp.com/channel/0029VbAqvrt8kyyFryeedv17" target="_blank" class="social-link whatsapp" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <a href="https://t.me/boost/Bibliaquestion" target="_blank" class="social-link telegram" aria-label="Telegram">
              <svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
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
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3 class="feature-title">Preguntas Diarias</h3>
              <p class="feature-description">
                Cada día recibe nuevas preguntas basadas en versículos bíblicos.
                Aprende mientras juegas.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🎬</div>
              <h3 class="feature-title">Videos de YouTube</h3>
              <p class="feature-description">
                Mira shorts explicativos antes de cada pregunta.
                Profundiza con videos largos al final del día.
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
                Compite durante 15 semanas en torneos temáticos.
                Sube en el ranking y demuestra tu conocimiento.
              </p>
            </div>

            <div class="feature-card">
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

      <!-- Donation Section -->
      <section class="donation-section">
        <div class="donation-container">
          <div class="donation-content">
            <span class="donation-icon">🙏</span>
            <div class="donation-text">
              <h3 class="donation-title">Ayúdanos a llevar la Palabra de Dios a más personas</h3>
              <p class="donation-description">Tu donación nos permite seguir creando contenido y torneos gratuitos</p>
            </div>
            <div class="donation-actions">
              <a href="https://paypal.com/ncp/payment/WF9W9X4LBUSUW" target="_blank" class="btn-donate paypal">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.771.771 0 0 1 .76-.65h6.39c2.267 0 3.868.544 4.756 1.617.863 1.044 1.086 2.326.661 3.808-.07.25-.154.49-.252.722a6.47 6.47 0 0 1-.653 1.16c-.816 1.168-2.04 1.97-3.632 2.384a9.08 9.08 0 0 1-2.204.261H9.158a.944.944 0 0 0-.932.798l-.91 5.767a.77.77 0 0 1-.76.65h-.48z"/>
                </svg>
                PayPal
              </a>
              <button class="btn-donate nequi" (click)="copyToClipboard('3228323105', 'Nequi')">
                {{ copiedMessage === 'Nequi copiado!' ? 'Copiado!' : 'Nequi: 322 832 3105' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-social">
          <a href="https://www.youtube.com/@Bibliaquestion?sub_confirmation=1" target="_blank" aria-label="YouTube">
            <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://whatsapp.com/channel/0029VbAqvrt8kyyFryeedv17" target="_blank" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <a href="https://t.me/boost/Bibliaquestion" target="_blank" aria-label="Telegram">
            <svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </a>
        </div>
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
      font-family: 'Inter', sans-serif;
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

    /* Video Section */
    .video-section {
      padding: var(--spacing-xxl) var(--spacing-md);
      background: linear-gradient(180deg, var(--color-primary-dark) 0%, var(--color-accent-dark) 100%);
      position: relative;
      z-index: 2;
    }

    .video-container {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }

    .video-title {
      color: var(--color-secondary);
      font-size: clamp(1.5rem, 4vw, 2rem);
      margin-bottom: var(--spacing-sm);
    }

    .video-section .ornament {
      margin-bottom: var(--spacing-lg);
    }

    .video-section .ornament-line {
      background: linear-gradient(90deg, transparent, var(--color-secondary), transparent);
    }

    .video-section .ornament-symbol {
      color: var(--color-secondary);
    }

    .video-description {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: var(--spacing-xl);
      font-size: 1.1rem;
    }

    .video-wrapper {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
      border: 3px solid var(--color-secondary);
    }

    .video-wrapper iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    /* Social Section */
    .social-section {
      background: var(--color-cream);
      padding: var(--spacing-lg) var(--spacing-md);
      position: relative;
      z-index: 2;
      border-top: 3px solid var(--color-secondary);
      border-bottom: 3px solid var(--color-secondary);
    }

    .social-container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xl);
      flex-wrap: wrap;
    }

    .social-text {
      font-family: 'Cinzel', serif;
      color: var(--color-accent);
      font-size: 1.1rem;
      margin: 0;
      font-weight: 600;
    }

    .social-icons {
      display: flex;
      gap: var(--spacing-md);
    }

    .social-link {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      border: 2px solid transparent;
    }

    .social-link svg {
      width: 24px;
      height: 24px;
      fill: white;
    }

    .social-link.youtube {
      background-color: #FF0000;
    }

    .social-link.whatsapp {
      background-color: #25D366;
    }

    .social-link.telegram {
      background-color: #0088cc;
    }

    .social-link:hover {
      transform: translateY(-4px) scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    /* Donation Section */
    .donation-section {
      background: linear-gradient(135deg, var(--color-cream) 0%, var(--color-surface) 100%);
      padding: var(--spacing-xl) var(--spacing-md);
      position: relative;
      z-index: 2;
      border-top: 1px solid var(--color-border);
    }

    .donation-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .donation-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
      justify-content: center;
      text-align: center;
    }

    .donation-icon {
      font-size: 3rem;
      animation: pulse 2s ease-in-out infinite;
    }

    .donation-text {
      flex: 1;
      min-width: 250px;
    }

    .donation-title {
      font-family: 'Cinzel', serif;
      color: var(--color-accent);
      font-size: 1.25rem;
      margin: 0 0 var(--spacing-xs);
    }

    .donation-description {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: 0.95rem;
    }

    .donation-actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-donate {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 2px solid transparent;
      text-decoration: none;
    }

    .btn-donate.paypal {
      background-color: #0070ba;
      color: white;
    }

    .btn-donate.paypal:hover {
      background-color: #005ea6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 112, 186, 0.4);
    }

    .btn-donate.nequi {
      background-color: white;
      color: #e01e5a;
      border-color: #e01e5a;
    }

    .btn-donate.nequi:hover {
      background-color: #e01e5a;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(224, 30, 90, 0.4);
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
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

    .footer-social {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .footer-social a {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.1);
      transition: all var(--transition-fast);
    }

    .footer-social a:hover {
      background-color: var(--color-secondary);
      transform: translateY(-3px);
    }

    .footer-social svg {
      width: 20px;
      height: 20px;
      fill: white;
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

      .social-container {
        flex-direction: column;
        text-align: center;
      }

      .social-text {
        font-size: 1rem;
      }

      .donation-content {
        flex-direction: column;
      }

      .donation-actions {
        flex-direction: column;
        width: 100%;
      }

      .btn-donate {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  particles: Particle[] = [];
  visibleCards: { [key: string]: boolean } = {};
  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;
  copiedMessage: string | null = null;

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

  async copyToClipboard(text: string, label: string): Promise<void> {
    if (!this.isBrowser) return;

    try {
      await navigator.clipboard.writeText(text);
      this.copiedMessage = `${label} copiado!`;
      setTimeout(() => {
        this.copiedMessage = null;
      }, 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.copiedMessage = `${label} copiado!`;
      setTimeout(() => {
        this.copiedMessage = null;
      }, 2000);
    }
  }
}
