// import { Component } from '@angular/core';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-add-user',
//   templateUrl: './add-user.component.html',
//   styleUrls: ['./add-user.component.css']
// })
// export class AddUserComponent {
//   user = {
//     name: '',
//     role: '',
//     email: '',
//     status: ''
//   };

//   constructor(private router: Router) {}

//   onSubmit() {
//     console.log('New User:', this.user);
//     // Add logic to save user (e.g., API call)
//     this.router.navigate(['/admin/users']);
//   }
// }


// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { UserService } from 'src/app/user.service';

// @Component({
//   selector: 'app-add-user',
//   templateUrl: './add-user.component.html',
//   styleUrls: ['./add-user.component.css']
// })
// export class AddUserComponent {
//   user = {
//     username: '', // Added username field
//     name: '',
//     role: '',
//     email: '',
//     status: ''
//   };

//   constructor(private userService: UserService, private router: Router) {}

//   onSubmit() {
//     this.userService.addUser(this.user).subscribe({
//       next: () => {
//         console.log('User added:', this.user);
//         this.router.navigate(['/admin/users']);
//       },
//       error: (error) => {
//         alert('Failed to add user: ' + error.message);
//       }
//     });
//   }
// }
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {
  user = {
    fullName: '',
    name: '',
    role: '',
    email: '',
    password: '',
    status: 'Pending'
  };
  isSubmitted: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private userService: UserService, private router: Router) {}

  onSubmit() {
    this.isSubmitted = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.user.fullName || !this.user.email || !this.user.role || !this.user.password) {
      this.errorMessage = 'All fields are required';
      return;
    }

    const userData = {
      username: this.user.fullName,
      password: this.user.password,
      email: this.user.email,
      name: this.user.fullName,
      role: this.user.role
    };

    this.userService.addUser(userData).subscribe({
      next: () => {
        console.log('User added:', userData);
        this.successMessage = 'User added successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 2000);
      },
      error: (error) => {
        console.error('Failed to add user:', error);
        this.errorMessage = 'Failed to add user: ' + error.message;
      }
    });
  }
}