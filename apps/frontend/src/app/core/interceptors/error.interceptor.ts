import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';

      if (error.error instanceof ErrorEvent) {
        // Error del cliente
        errorMessage = error.error.message;
      } else {
        // Error del servidor
        switch (error.status) {
          case 401:
            errorMessage = 'Sesion expirada. Por favor, inicia sesion nuevamente.';
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta accion.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta mas tarde.';
            break;
          default:
            errorMessage = error.error?.detail || error.message || 'Error desconocido';
        }
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: req.url
      });

      return throwError(() => new Error(errorMessage));
    })
  );
};
