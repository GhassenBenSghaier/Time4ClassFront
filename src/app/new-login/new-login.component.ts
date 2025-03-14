// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { AuthService } from '../auth.service';

// @Component({
//   selector: 'app-new-login',
//   templateUrl: './new-login.component.html',
//   styleUrls: ['./new-login.component.css']
// })
// export class NewLoginComponent {
//   loginForm: FormGroup;
//   hidePassword = true;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService
//   ) {
//     // Remove validators
//     this.loginForm = this.fb.group({
//       email: [''],
//       password: ['']
//     });
//   }

//   onLogin() {
//     console.log('NewLoginComponent: onLogin called');
//     const credentials = {
//       username: this.loginForm.get('email')?.value,
//       password: this.loginForm.get('password')?.value
//     };
//     console.log('NewLoginComponent: Attempting login with credentials:', credentials);
//     this.authService.login(credentials).subscribe({
//       next: (token) => {
//         console.log('NewLoginComponent: Login successful, token:', token);
//         const isAdmin = this.authService.isAdmin();
//         console.log('NewLoginComponent: Is user admin?', isAdmin);
//         if (isAdmin) {
//           console.log('NewLoginComponent: Redirecting to /admin');
//           this.router.navigate(['/admin']).then(success => {
//             console.log('NewLoginComponent: Navigation to /admin success:', success);
//             if (success) {
//               alert('Login successful! Welcome, Admin.');
//             } else {
//               console.error('NewLoginComponent: Navigation to /admin failed');
//               alert('Navigation failed. Please try again.');
//             }
//           });
//         } else {
//           console.error('NewLoginComponent: User is not an admin, cannot access dashboard');
//           alert('Access denied: Only admins can access the dashboard.');
//           this.authService.logout();
//         }
//       },
//       error: (error) => {
//         console.error('NewLoginComponent: Login failed:', error.message);
//         alert('Login failed: ' + error.message);
//       }
//     });
//   }

//   togglePasswordVisibility() {
//     this.hidePassword = !this.hidePassword;
//   }
// }

// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { AuthService } from '../auth.service';

// @Component({
//   selector: 'app-new-login',
//   templateUrl: './new-login.component.html',
//   styleUrls: ['./new-login.component.css']
// })
// export class NewLoginComponent {
//   loginForm: FormGroup;
//   hidePassword = true;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService
//   ) {
//     this.loginForm = this.fb.group({
//       email: [''],
//       password: ['']
//     });
//   }

//   onLogin() {
//     console.log('NewLoginComponent: onLogin called');
//     const credentials = {
//       username: this.loginForm.get('email')?.value,
//       password: this.loginForm.get('password')?.value
//     };
//     console.log('NewLoginComponent: Attempting login with credentials:', credentials);
//     this.authService.login(credentials).subscribe({
//       next: (token) => {
//         console.log('NewLoginComponent: Login successful, token:', token);
//         const role = this.authService.getRole();
//         console.log('NewLoginComponent: User role:', role);

//         if (role === 'ADMIN') {
//           console.log('NewLoginComponent: Redirecting to /admin');
//           this.router.navigate(['/admin']).then(success => {
//             console.log('NewLoginComponent: Navigation to /admin success:', success);
//             if (success) {
//               alert('Login successful! Welcome, Admin.');
//             } else {
//               console.error('NewLoginComponent: Navigation to /admin failed');
//               alert('Navigation failed. Please try again.');
//             }
//           });
//         } else if (role === 'STUDENT') {
//           console.log('NewLoginComponent: Redirecting to /student-space');
//           this.router.navigate(['/student-space']).then(success => {
//             console.log('NewLoginComponent: Navigation to /student-space success:', success);
//             if (success) {
//               alert('Login successful! Welcome, Student.');
//             } else {
//               console.error('NewLoginComponent: Navigation to /student-space failed');
//               alert('Navigation failed. Please try again.');
//             }
//           });
//         } else if (role === 'TEACHER') {
//           console.log('NewLoginComponent: Redirecting to /teacher-space');
//           this.router.navigate(['/teacher-space']).then(success => {
//             console.log('NewLoginComponent: Navigation to /teacher-space success:', success);
//             if (success) {
//               alert('Login successful! Welcome, Teacher.');
//             } else {
//               console.error('NewLoginComponent: Navigation to /teacher-space failed');
//               alert('Navigation failed. Please try again.');
//             }
//           });
//         } else {
//           console.error('NewLoginComponent: Unknown role:', role);
//           alert('Access denied: Unknown role.');
//           this.authService.logout();
//         }
//       },
//       error: (error) => {
//         console.error('NewLoginComponent: Login failed:', error.message);
//         alert('Login failed: ' + error.message);
//       }
//     });
//   }

//   togglePasswordVisibility() {
//     this.hidePassword = !this.hidePassword;
//   }
// }


import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-new-login',
  templateUrl: './new-login.component.html',
  styleUrls: ['./new-login.component.css']
})
export class NewLoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    console.log('NewLoginComponent: onLogin called');
    if (this.loginForm.invalid) {
      console.log('NewLoginComponent: Form is invalid');
      return;
    }

    const credentials = {
      username: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };
    console.log('NewLoginComponent: Attempting login with credentials:', credentials);
    this.errorMessage = null; // Clear previous error
    this.authService.login(credentials).subscribe({
      next: (token) => {
        console.log('NewLoginComponent: Login successful, token:', token);
        const role = this.authService.getRole();
        console.log('NewLoginComponent: User role:', role);

        if (role === 'ADMIN') {
          console.log('NewLoginComponent: Redirecting to /admin');
          this.router.navigate(['/admin']).then(success => {
            console.log('NewLoginComponent: Navigation to /admin success:', success);
            if (success) {
              alert('Login successful! Welcome, Admin.');
            } else {
              console.error('NewLoginComponent: Navigation to /admin failed');
              alert('Navigation failed. Please try again.');
            }
          });
        } else if (role === 'STUDENT') {
          console.log('NewLoginComponent: Redirecting to /student-space');
          this.router.navigate(['/student-space']).then(success => {
            console.log('NewLoginComponent: Navigation to /student-space success:', success);
            if (success) {
              alert('Login successful! Welcome, Student.');
            } else {
              console.error('NewLoginComponent: Navigation to /student-space failed');
              alert('Navigation failed. Please try again.');
            }
          });
        } else if (role === 'TEACHER') {
          console.log('NewLoginComponent: Redirecting to /teacher-space');
          this.router.navigate(['/teacher-space']).then(success => {
            console.log('NewLoginComponent: Navigation to /teacher-space success:', success);
            if (success) {
              alert('Login successful! Welcome, Teacher.');
            } else {
              console.error('NewLoginComponent: Navigation to /teacher-space failed');
              alert('Navigation failed. Please try again.');
            }
          });
        } else {
          console.error('NewLoginComponent: Unknown role:', role);
          alert('Access denied: Unknown role.');
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('NewLoginComponent: Login failed:', error.message);
        this.errorMessage = 'Login failed: ' + error.message;
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}