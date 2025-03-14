import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  user = {
    id: 0,
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

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.userService.getUsers().subscribe(users => {
      const userToEdit = users.find(user => user.id === id);
      if (userToEdit) {
        this.user.id = userToEdit.id;
        this.user.fullName = userToEdit.username;
        this.user.email = userToEdit.email;
        this.user.role = userToEdit.role;
        this.user.status = userToEdit.status;
      } else {
        this.errorMessage = 'User not found';
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.user.fullName || !this.user.email || !this.user.role || !this.user.status) {
      this.errorMessage = 'Full Name, Email, Role, and Status are required';
      return;
    }

    if (this.user.password && !this.isStrongPassword(this.user.password)) {
      this.errorMessage = 'Password must be at least 8 characters with a letter, number, and special character';
      return;
    }

    const userData = {
      id: this.user.id,
      username: this.user.fullName,
      email: this.user.email,
      role: this.user.role,
      status: this.user.status,
      password: this.user.password || undefined // Only send if provided
    };

    this.userService.updateUser(this.user.id, userData).subscribe({
      next: () => {
        console.log('User updated:', userData);
        this.successMessage = 'User updated successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 2000);
      },
      error: (error) => {
        console.error('Failed to update user:', error);
        this.errorMessage = 'Failed to update user: ' + error.message;
      }
    });
  }

  isStrongPassword(password: string): boolean {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  }
}