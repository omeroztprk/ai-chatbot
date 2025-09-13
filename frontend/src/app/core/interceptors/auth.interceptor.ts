import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const at = auth.getAccessToken();

  if (at) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${at}` } });
  }

  return next(req);
};
