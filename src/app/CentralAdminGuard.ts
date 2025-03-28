import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CentralAdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.getRole() === 'CENTRAL_ADMIN') {
      return true; // Allow access if authenticated and role is CENTRAL_ADMIN
    }
    
    // Redirect to access-denied or login based on authentication status
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/access-denied']);
    }
    return false;
  }
}