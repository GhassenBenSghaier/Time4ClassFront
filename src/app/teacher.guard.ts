import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('TeacherGuard: Checking teacher role');
    if (!this.authService.isAuthenticated()) {
      console.log('TeacherGuard: User not authenticated, redirecting to /login');
      this.router.navigate(['/login']);
      return false;
    }

    const role = this.authService.getRole();
    if (role === 'TEACHER') {
      console.log('TeacherGuard: User is teacher, allowing access');
      return true;
    } else {
      console.log('TeacherGuard: User is not teacher, redirecting based on role');
      if (role === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else if (role === 'STUDENT') {
        this.router.navigate(['/student-space']);
      } else {
        this.router.navigate(['/access-denied']);
      }
      return false;
    }
  }
}