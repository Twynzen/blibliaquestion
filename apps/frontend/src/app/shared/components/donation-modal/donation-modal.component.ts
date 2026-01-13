import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-donation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content animate-scaleIn">
        <button class="modal-close" (click)="close()" aria-label="Cerrar">
          &times;
        </button>

        <div class="modal-header">
          <span class="modal-icon">🙏</span>
          <h2 class="modal-title">¡¡¡ Ayúdanos a crecer !!!</h2>
        </div>

        <p class="modal-description">
          Bendícenos con una donación para que la palabra de Dios llegue a cada rincón de este planeta
        </p>

        <div class="donation-options">
          <!-- PayPal -->
          <button class="donation-btn paypal" (click)="openPayPal()">
            <span class="donation-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.771.771 0 0 1 .76-.65h6.39c2.267 0 3.868.544 4.756 1.617.863 1.044 1.086 2.326.661 3.808-.07.25-.154.49-.252.722a6.47 6.47 0 0 1-.653 1.16c-.816 1.168-2.04 1.97-3.632 2.384a9.08 9.08 0 0 1-2.204.261H9.158a.944.944 0 0 0-.932.798l-.91 5.767a.77.77 0 0 1-.76.65h-.48z"/>
                <path d="M19.767 6.795c-.01.066-.023.134-.035.2-.7 3.572-3.093 4.804-6.149 4.804h-1.556a.756.756 0 0 0-.747.639l-.795 5.035-.225 1.426a.398.398 0 0 0 .393.46h2.755a.662.662 0 0 0 .654-.558l.027-.14.518-3.28.033-.18a.662.662 0 0 1 .654-.558h.412c2.668 0 4.757-1.083 5.368-4.215.256-1.308.123-2.4-.553-3.168a2.62 2.62 0 0 0-.754-.565z"/>
              </svg>
            </span>
            <span class="donation-text">Donar con PayPal</span>
          </button>

          <!-- Nequi -->
          <button class="donation-btn nequi" (click)="copyNequi()">
            <span class="donation-icon nequi-icon">N</span>
            <span class="donation-text">Nequi: {{ nequiNumber }}</span>
            <span class="copy-indicator" *ngIf="copiedNequi()">✓</span>
          </button>

          <!-- Daviplata -->
          <button class="donation-btn daviplata" (click)="copyDaviplata()">
            <span class="donation-icon daviplata-icon">D</span>
            <span class="donation-text">Daviplata: {{ daviplataNumber }}</span>
            <span class="copy-indicator" *ngIf="copiedDaviplata()">✓</span>
          </button>
        </div>

        <!-- Toast notification -->
        <div class="toast" *ngIf="showToast()" [@fadeInOut]>
          {{ toastMessage() }}
        </div>

        <button class="btn-later" (click)="close()">
          Tal vez después
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
      max-width: 420px;
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

    .donation-options {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .donation-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: 1rem;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .donation-btn.paypal {
      border-color: #0070ba;
      color: #0070ba;

      &:hover {
        background-color: #0070ba;
        color: white;
      }
    }

    .donation-btn.nequi {
      border-color: #e01e5a;
      color: #e01e5a;

      &:hover {
        background-color: #e01e5a;
        color: white;
      }
    }

    .donation-btn.daviplata {
      border-color: #ed1c24;
      color: #ed1c24;

      &:hover {
        background-color: #ed1c24;
        color: white;
      }
    }

    .donation-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nequi-icon, .daviplata-icon {
      font-weight: 700;
      font-size: 1.25rem;
      border-radius: var(--radius-sm);
      background-color: currentColor;
      color: white !important;
    }

    .nequi-icon {
      background-color: #e01e5a;
    }

    .daviplata-icon {
      background-color: #ed1c24;
    }

    .donation-text {
      flex: 1;
      text-align: left;
      font-weight: 500;
    }

    .copy-indicator {
      color: var(--color-success);
      font-weight: 700;
      font-size: 1.25rem;
    }

    .toast {
      position: fixed;
      bottom: var(--spacing-xl);
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--color-success);
      color: white;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--radius-full);
      font-weight: 500;
      box-shadow: var(--shadow-md);
      z-index: 1001;
      animation: fadeInUp 0.3s ease-out;
    }

    .btn-later {
      display: block;
      width: 100%;
      padding: var(--spacing-md);
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-size: 1rem;
      cursor: pointer;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--color-primary);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translate(-50%, 20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }

    @media (max-width: 480px) {
      .modal-content {
        padding: var(--spacing-lg);
      }

      .modal-title {
        font-size: 1.25rem;
      }

      .donation-btn {
        padding: var(--spacing-sm) var(--spacing-md);
      }
    }
  `]
})
export class DonationModalComponent {
  @Output() closed = new EventEmitter<void>();

  // Números de pago - CONFIGURABLES
  readonly nequiNumber = '320XXXXXXX';
  readonly daviplataNumber = '320XXXXXXX';
  readonly paypalUrl = 'https://paypal.com/ncp/payment/WF9W9X4LBUSUW';

  // Estados para los indicadores de copiado
  copiedNequi = signal(false);
  copiedDaviplata = signal(false);
  showToast = signal(false);
  toastMessage = signal('');

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  openPayPal(): void {
    window.open(this.paypalUrl, '_blank');
  }

  async copyNequi(): Promise<void> {
    await this.copyToClipboard(this.nequiNumber);
    this.copiedNequi.set(true);
    this.showToastMessage('Número Nequi copiado ✓');
    setTimeout(() => this.copiedNequi.set(false), 2000);
  }

  async copyDaviplata(): Promise<void> {
    await this.copyToClipboard(this.daviplataNumber);
    this.copiedDaviplata.set(true);
    this.showToastMessage('Número Daviplata copiado ✓');
    setTimeout(() => this.copiedDaviplata.set(false), 2000);
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  private showToastMessage(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }
}
