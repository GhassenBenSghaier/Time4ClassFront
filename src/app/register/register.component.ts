// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// @Component({
//   selector: 'app-register',
//   templateUrl: './register.component.html',
//   styleUrls: ['./register.component.css']
// })
// export class RegisterComponent {
//   fullName: string = '';
//   email: string = '';
//   password: string = '';
//   confirmPassword: string = '';

//   constructor(private router: Router) {}

//   onRegister(form: any) {
//     if (form.valid) {
//       if (this.password !== this.confirmPassword) {
//         console.error('Passwords do not match');
//         return;
//       }
//       console.log('Register:', { fullName: this.fullName, email: this.email, password: this.password });
//       this.router.navigate(['/login']);
//     }
//   }
// }

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = ''; // New field for role
  isSubmitted: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  onRegister() {
    this.isSubmitted = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.fullName || !this.email || !this.password || !this.confirmPassword || !this.role) {
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const registrationData = {
      username: this.fullName, // Use fullName as username
      password: this.password,
      email: this.email,
      name: this.fullName,
      role: this.role // Send role to backend (optional, can set in backend)
    };

    this.http.post('http://localhost:9999/api/auth/register', registrationData).subscribe({
      next: (response: any) => {
        console.log('Registration response:', response);
        this.successMessage = 'Registration successful! Redirecting...';
        setTimeout(() => {
          if (this.role === 'STUDENT') {
            this.router.navigate(['/student-space']);
          } else if (this.role === 'TEACHER') {
            this.router.navigate(['/teacher-space']);
          }
        }, 2000);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.errorMessage = error.error?.message || error.message || 'Registration failed';
      }
    });
  }
}