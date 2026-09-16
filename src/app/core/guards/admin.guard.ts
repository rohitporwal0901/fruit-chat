import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Admin check: isLoggedIn AND email is admin email
  const user = auth.currentUser();
  const adminEmails = ['admin@fruitchat.com', 'fruitchat.admin@gmail.com'];

  if (user && adminEmails.includes(user.email ?? '')) {
    return true;
  }

  router.navigate(['/admin/login']);
  return false;
};
