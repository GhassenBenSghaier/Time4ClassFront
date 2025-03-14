import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('AdminGuard: Checking admin role');
    if (!this.authService.isAuthenticated()) {
      console.log('AdminGuard: User not authenticated, redirecting to /login');
      this.router.navigate(['/login']);
      return false;
    }

    if (this.authService.isAdmin()) {
      console.log('AdminGuard: User is admin, allowing access');
      return true;
    } else {
      console.log('AdminGuard: User is not admin, redirecting based on role');
      const role = this.authService.getRole();
      if (role === 'STUDENT') {
        this.router.navigate(['/student-space']);
      } else if (role === 'TEACHER') {
        this.router.navigate(['/teacher-space']);
      } else {
        this.router.navigate(['/access-denied']);
      }
      return false;
    }
  }
}