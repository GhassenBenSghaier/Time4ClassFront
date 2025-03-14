import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('StudentGuard: Checking student role');
    if (!this.authService.isAuthenticated()) {
      console.log('StudentGuard: User not authenticated, redirecting to /login');
      this.router.navigate(['/login']);
      return false;
    }

    const role = this.authService.getRole();
    if (role === 'STUDENT') {
      console.log('StudentGuard: User is student, allowing access');
      return true;
    } else {
      console.log('StudentGuard: User is not student, redirecting based on role');
      if (role === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else if (role === 'TEACHER') {
        this.router.navigate(['/teacher-space']);
      } else {
        this.router.navigate(['/access-denied']);
      }
      return false;
    }
  }
}