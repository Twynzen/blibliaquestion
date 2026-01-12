import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);

  // Saltar para endpoints públicos
  if (req.url.includes('/public/') || req.url.includes('googleapis.com')) {
    return next(req);
  }

  return from(getToken(auth)).pipe(
    switchMap(token => {
      if (token) {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedReq);
      }
      return next(req);
    })
  );
};

async function getToken(auth: Auth): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    return await currentUser.getIdToken();
  } catch {
    return null;
  }
}
