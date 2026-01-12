import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que termine de cargar el estado de autenticación
  while (authService.loading()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Si ya está autenticado, redirigir al dashboard
  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
