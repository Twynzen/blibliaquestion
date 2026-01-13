import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeModalsService } from '@core/services/welcome-modals.service';
import { AuthService } from '@core/services/auth.service';
import { DonationModalComponent } from '../donation-modal/donation-modal.component';
import { SocialMediaModalComponent } from '../social-media-modal/social-media-modal.component';

@Component({
  selector: 'app-welcome-flow',
  standalone: true,
  imports: [CommonModule, DonationModalComponent, SocialMediaModalComponent],
  template: `
    @if (welcomeModalsService.currentStep() === 'donation') {
      <app-donation-modal (closed)="onDonationClosed()"></app-donation-modal>
    }

    @if (welcomeModalsService.currentStep() === 'social') {
      <app-social-media-modal (closed)="onSocialClosed()"></app-social-media-modal>
    }
  `
})
export class WelcomeFlowComponent implements OnInit, OnDestroy {
  protected welcomeModalsService = inject(WelcomeModalsService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // El flujo se inicia desde el registro
  }

  ngOnDestroy(): void {
    // Limpiar estado si el componente se destruye
  }

  onDonationClosed(): void {
    this.welcomeModalsService.nextStep();
  }

  async onSocialClosed(): Promise<void> {
    const userId = this.authService.userId();
    if (userId) {
      await this.welcomeModalsService.completeWelcomeFlow(userId);
    } else {
      this.welcomeModalsService.nextStep();
    }
  }
}
