// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-users-list',
//   templateUrl: './users-list.component.html',
//   styleUrls: ['./users-list.component.css']
// })
// export class UsersListComponent {
//   users = [
//     { name: 'Ms. Amina Ben Salem', role: 'Teacher', email: 'amina@time4class.com', status: 'Active' },
//     { name: 'Mr. Karim Jlassi', role: 'Teacher', email: 'karim@time4class.com', status: 'Active' },
//     { name: 'Sara Trabelsi', role: 'Student', email: 'sara@time4class.com', status: 'Pending' },
//     { name: 'Principal', role: 'Admin', email: 'admin@time4class.com', status: 'Active' }
//   ];

//   editUser(user: any) {
//     console.log('Edit:', user);
//     // Add edit logic here (e.g., navigate to edit form)
//   }

//   deleteUser(user: any) {
//     this.users = this.users.filter(u => u !== user);
//     console.log('Deleted:', user);
//     // Add delete logic here
//   }
// }

// import { Component, OnInit } from '@angular/core';
// import { UserService } from 'src/app/user.service';

// @Component({
//   selector: 'app-users-list',
//   templateUrl: './users-list.component.html',
//   styleUrls: ['./users-list.component.css']
// })
// export class UsersListComponent implements OnInit {
//   users: any[] = [];

//   constructor(private userService: UserService) {}

//   ngOnInit() {
//     this.loadUsers();
//   }

//   loadUsers() {
//     this.userService.getUsers().subscribe(users => {
//       this.users = users;
//     });
//   }

//   editUser(user: any) {
//     console.log('Edit:', user);
//   }

//   deleteUser(user: any) {
//     if (confirm(`Are you sure you want to delete ${user.name}?`)) {
//       this.userService.deleteUser(user.id).subscribe(() => {
//         this.loadUsers();
//       });
//     }
//   }
// }

import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: any[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  editUser(user: any) {
    this.router.navigate([`/admin/users/edit/${user.id}`]);
  }

  deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete ${user.username}?`)) {
      this.userService.deleteUser(user.id).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}