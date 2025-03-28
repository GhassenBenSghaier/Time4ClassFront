import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    if (this.authService.isTeacher()) {
      return true;
    }
    const role = this.authService.getRole();
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else if (role === 'STUDENT') {
      this.router.navigate(['/student-space']);
    } else {
      this.router.navigate(['/access-denied']);
    }
    return false;
  }
}