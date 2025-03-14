import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('AuthGuard: Checking authentication');
    if (this.authService.isAuthenticated()) {
      console.log('AuthGuard: User is authenticated');
      if (this.authService.isAdmin()) {
        console.log('AuthGuard: User is admin, allowing access to /admin');
        return true;
      } else {
        console.log('AuthGuard: User is not admin, redirecting to /login');
        this.router.navigate(['/login']).then(success => {
          console.log('AuthGuard: Navigation to /login success:', success);
          if (!success) console.error('AuthGuard: Navigation to /login failed');
        });
        return false;
      }
    } else {
      console.log('AuthGuard: User not authenticated, redirecting to /login');
      this.router.navigate(['/login']).then(success => {
        console.log('AuthGuard: Navigation to /login success:', success);
        if (!success) console.error('AuthGuard: Navigation to /login failed');
      });
      return false;
    }
  }
}

