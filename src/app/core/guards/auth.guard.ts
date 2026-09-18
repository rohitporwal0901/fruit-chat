import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for Firebase to resolve auth state on initial load / page refresh
  if (authService.authLoading()) {
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (!authService.authLoading()) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  if (authService.isLoggedIn()) {
    if (authService.currentUser()?.role === 'admin') {
      router.navigate(['/admin/login']);
      return false;
    }
    return true;
  }

  // Not logged in — redirect to /auth screen with returnUrl
  router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
  return false;
};
