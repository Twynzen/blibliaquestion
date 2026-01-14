import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SocialLink {
  id: string;
  name: string;
  icon: string;
  url: string | null;
  color: string;
}

@Component({
  selector: 'app-social-media-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content animate-scaleIn">
        <button class="modal-close" (click)="close()" aria-label="Cerrar">
          &times;
        </button>

        <div class="modal-header">
          <span class="modal-icon">📱</span>
          <h2 class="modal-title">¡Síguenos en redes sociales!</h2>
        </div>

        <p class="modal-description">
          Suscríbete para no perderte los torneos, nuevos retos y contenido exclusivo
        </p>

        <div class="social-grid">
          <button
            *ngFor="let social of socialLinks"
            class="social-btn"
            [style.--social-color]="social.color"
            [class.shake]="shakingId() === social.id"
            (click)="handleSocialClick(social)"
          >
            <span class="social-icon" [innerHTML]="social.icon"></span>
            <span class="social-name">{{ social.name }}</span>
            <span class="coming-soon-badge" *ngIf="shakingId() === social.id">
              Próximamente
            </span>
          </button>
        </div>

        <button class="btn-continue" (click)="close()">
          Continuar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-md);
      animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
      background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-cream) 100%);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xl);
      max-width: 480px;
      width: 100%;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--color-border);
    }

    .modal-close {
      position: absolute;
      top: var(--spacing-sm);
      right: var(--spacing-md);
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: color var(--transition-fast);
      line-height: 1;

      &:hover {
        color: var(--color-text-primary);
      }
    }

    .modal-header {
      text-align: center;
      margin-bottom: var(--spacing-lg);
    }

    .modal-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: var(--spacing-sm);
    }

    .modal-title {
      font-family: 'Cinzel', serif;
      font-size: 1.5rem;
      color: var(--color-accent);
      margin: 0;
      letter-spacing: 0.02em;
    }

    .modal-description {
      text-align: center;
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xl);
      line-height: 1.6;
    }

    .social-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .social-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
      min-height: 100px;

      &:hover {
        border-color: var(--social-color);
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);

        .social-icon {
          color: var(--social-color);
          transform: scale(1.1);
        }
      }
    }

    .social-btn.shake {
      animation: shake 0.5s ease-in-out;
    }

    .social-icon {
      font-size: 2rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      color: var(--color-text-secondary);

      svg {
        width: 32px;
        height: 32px;
        fill: currentColor;
      }
    }

    .social-name {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .coming-soon-badge {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--color-accent);
      color: white;
      font-size: 0.65rem;
      padding: 4px 8px;
      border-radius: var(--radius-full);
      white-space: nowrap;
      font-weight: 600;
      animation: fadeInDown 0.3s ease-out;
      box-shadow: var(--shadow-sm);
    }

    .btn-continue {
      display: block;
      width: 100%;
      padding: var(--spacing-md) var(--spacing-xl);
      background: linear-gradient(90deg, var(--color-secondary-dark), var(--color-secondary), var(--color-secondary-dark));
      background-size: 200% auto;
      color: var(--color-text-primary);
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background-position: right center;
        box-shadow: var(--shadow-gold);
        transform: translateY(-2px);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
      20%, 40%, 60%, 80% { transform: translateX(3px); }
    }

    @media (max-width: 480px) {
      .modal-content {
        padding: var(--spacing-lg);
      }

      .modal-title {
        font-size: 1.25rem;
      }

      .social-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .social-btn {
        min-height: 90px;
      }
    }
  `]
})
export class SocialMediaModalComponent {
  @Output() closed = new EventEmitter<void>();

  shakingId = signal<string | null>(null);

  readonly socialLinks: SocialLink[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: `<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
      url: 'https://www.youtube.com/@Bibliaquestion?sub_confirmation=1',
      color: '#FF0000'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      url: 'https://whatsapp.com/channel/0029VbAqvrt8kyyFryeedv17',
      color: '#25D366'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: `<svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
      url: 'https://t.me/boost/Bibliaquestion',
      color: '#0088cc'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: `<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
      url: null,
      color: '#1877F2'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: `<svg viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>`,
      url: null,
      color: '#E4405F'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: `<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
      url: null,
      color: '#000000'
    }
  ];

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  handleSocialClick(social: SocialLink): void {
    if (social.url) {
      window.open(social.url, '_blank');
    } else {
      // Mostrar animación "Próximamente"
      this.shakingId.set(social.id);
      setTimeout(() => {
        this.shakingId.set(null);
      }, 1500);
    }
  }
}
