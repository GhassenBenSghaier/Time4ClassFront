// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AuthService } from 'src/app/auth.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent {
//   loginForm: FormGroup;
//   hidePassword = true;
//   errorMessage: string | null = null;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService
//   ) {
//     this.loginForm = this.fb.group({
//       username: ['', Validators.required], 
//       password: ['', Validators.required]
//     });
//   }

//   onLogin() {
//     console.log('NewLoginComponent: onLogin called');
//     if (this.loginForm.invalid) {
//       console.log('NewLoginComponent: Form is invalid');
//       this.errorMessage = 'Please fill in all required fields.';
//       return;
//     }

//     const credentials = {
//       username: this.loginForm.get('username')?.value,
//       password: this.loginForm.get('password')?.value
//     };
//     console.log('NewLoginComponent: Attempting login with credentials:', credentials);
//     this.errorMessage = null; // Clear previous error
//     this.authService.login(credentials).subscribe({
//       next: (token) => {
//         console.log('NewLoginComponent: Login successful, token:', token);
//         const role = this.authService.getRole();
//         console.log('NewLoginComponent: User role:', role);

//         if (this.authService.isAdmin()) { // Updated to use isAdmin() which checks for CENTRAL_ADMIN and LOCAL_ADMIN
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
//         this.errorMessage = error.message.includes('401') 
//           ? 'Invalid username or password.' 
//           : 'Login failed: ' + error.message;
//       }
//     });
//   }

//   togglePasswordVisibility() {
//     this.hidePassword = !this.hidePassword;
//   }
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';
import { PermissionService } from 'src/app/permission.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage: string | null = null;
  private statusSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      if (params['message'] === 'Account suspended') {
        this.errorMessage = 'Your account is suspended.';
      }
    });

    this.statusSubscription = this.permissionService.getStatusObservable().subscribe(status => {
      if (status === 'Suspended' && !this.authService.isAuthenticated()) {
        this.errorMessage = 'Your account is suspended.';
      }
    });
  }

  ngOnInit() {
    this.permissionService.refreshPermissions();
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  onLogin() {
    console.log('LoginComponent: onLogin called');
    if (this.loginForm.invalid) {
      console.log('LoginComponent: Form is invalid');
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const credentials = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value
    };
    console.log('LoginComponent: Attempting login with credentials:', credentials);
    this.errorMessage = null;

    this.authService.login(credentials).subscribe({
      next: (token) => {
        console.log('LoginComponent: Login successful, token:', token);
        this.permissionService.refreshPermissions();

        const status = this.permissionService.getAccountStatus();
        console.log('LoginComponent: Status after refresh:', status);
        if (status === 'Suspended') {
          this.errorMessage = 'Your account is suspended.';
          console.log('LoginComponent: Account suspended, stopping execution');
          return;
        }

        const role = this.authService.getRole();
        console.log('LoginComponent: User role:', role);

        if (!role) {
          console.error('LoginComponent: No role found in token');
          this.errorMessage = 'Login failed: No role assigned.';
          this.authService.logout();
          return;
        }

        if (this.authService.isAdmin()) {
          console.log('LoginComponent: Redirecting to /admin');
          this.navigate('/admin', 'Admin');
        } else if (role === 'STUDENT') {
          console.log('LoginComponent: Redirecting to /student-space');
          this.navigate('/student-space', 'Student');
        } else if (role === 'TEACHER') {
          console.log('LoginComponent: Redirecting to /teacher-space');
          this.navigate('/teacher-space', 'Teacher');
        } else {
          console.error('LoginComponent: Unknown role:', role);
          this.errorMessage = 'Access denied: Unknown role.';
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('LoginComponent: Login failed:', error.message);
        this.errorMessage = error.message.includes('401')
          ? 'Invalid username or password.'
          : 'Login failed: ' + error.message;
      }
    });
  }

  private navigate(path: string, role: string) {
    this.router.navigate([path]).then(success => {
      console.log(`LoginComponent: Navigation to ${path} success:`, success);
      // if (success) {
      //   alert(`Login successful! Welcome, ${role}.`);
      // } else {
      //   console.error(`LoginComponent: Navigation to ${path} failed`);
      //   alert('Navigation failed. Please try again.');
      // }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}