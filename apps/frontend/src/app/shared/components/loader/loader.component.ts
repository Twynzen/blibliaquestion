import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loader-container" [class.full-screen]="fullScreen">
      <div class="loader-content">
        <div class="spinner"></div>
        @if (message) {
          <p class="loader-message">{{ message }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);

      &.full-screen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--color-background);
        z-index: 9999;
      }
    }

    .loader-content {
      text-align: center;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    .loader-message {
      margin-top: var(--spacing-md);
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoaderComponent {
  @Input() fullScreen = false;
  @Input() message?: string;
}
