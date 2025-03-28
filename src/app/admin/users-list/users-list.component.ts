



// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { UserService } from 'src/app/user.service';
// import { User } from 'src/app/Models/user.model';

// @Component({
//   selector: 'app-users-list',
//   templateUrl: './users-list.component.html',
//   styleUrls: ['./users-list.component.css']
// })
// export class UsersListComponent implements OnInit {
//   users: User[] = [];
//   filteredUsers: User[] = [];
//   searchForm: FormGroup;
//   showSearch: boolean = false;
//   showDeactivated: boolean = false; // Toggle to show only deactivated (Suspended) users
//   currentPage: number = 1;
//   pageSize: number = 10;
//   totalPages: number = 0;

//   constructor(
//     private userService: UserService,
//     private router: Router,
//     private fb: FormBuilder
//   ) {
//     this.searchForm = this.fb.group({
//       username: [''],
//       firstName: [''],
//       lastName: [''],
//       role: [''],
//       profileDesignation: [''],
//       department: [''],
//       accessLevel: [''],
//       employeeId: [''],
//       hireDate: [''],
//       schoolName: [''],
//       adminCode: [''],
//       subjectSpecialization: [''],
//       qualification: [''],
//       teacherRank: [''],
//       studentId: [''],
//       enrollmentDate: [''],
//       gradeLevel: [''],
//       schoolClass: [''],
//       parentName: [''],
//       parentContact: [''],
//       previousSchool: [''],
//       medicalConditions: ['']
//     });
//   }

//   ngOnInit() {
//     this.userService.getUsers().subscribe({
//       next: (users) => {
//         console.log('Users from API:', users);
//         this.users = users.map(user => ({
//           ...user,
//           profile: user.profile 
//             ? { code: user.profile.code, designation: user.profile.designation }
//             : undefined
//         }));
//         this.filterUsers();
//       },
//       error: (err) => console.error('Failed to load users:', err.message)
//     });
//     this.searchForm.valueChanges.subscribe(() => this.filterUsers());
//   }

//   filterUsers() {
//     const formValue = this.searchForm.value;
//     this.filteredUsers = this.users.filter(user => {
//       // Show only "Suspended" users if showDeactivated is true, otherwise show only non-"Suspended"
//       const statusFilter = this.showDeactivated ? user.status === 'Suspended' : user.status !== 'Suspended';
//       return statusFilter && (
//         (!formValue.username || user.username.toLowerCase().includes(formValue.username.toLowerCase())) &&
//         (!formValue.firstName || user.firstName.toLowerCase().includes(formValue.firstName.toLowerCase())) &&
//         (!formValue.lastName || user.lastName.toLowerCase().includes(formValue.lastName.toLowerCase())) &&
//         (!formValue.role || user.role === formValue.role) &&
//         (!formValue.profileDesignation || (user.profile?.designation && user.profile.designation.toLowerCase().includes(formValue.profileDesignation.toLowerCase()))) &&
//         (formValue.role === 'CENTRAL_ADMIN'
//           ? (!formValue.department || (user.department && user.department.toLowerCase().includes(formValue.department.toLowerCase()))) &&
//             (!formValue.accessLevel || (user.accessLevel && user.accessLevel.toLowerCase().includes(formValue.accessLevel.toLowerCase()))) &&
//             (!formValue.employeeId || (user.employeeId && user.employeeId.toLowerCase().includes(formValue.employeeId.toLowerCase()))) &&
//             (!formValue.hireDate || (user.hireDate && user.hireDate === formValue.hireDate))
//           : true) &&
//         (formValue.role === 'LOCAL_ADMIN'
//           ? (!formValue.schoolName || (user.schoolName && user.schoolName.toLowerCase().includes(formValue.schoolName.toLowerCase()))) &&
//             (!formValue.adminCode || (user.adminCode && user.adminCode.toLowerCase().includes(formValue.adminCode.toLowerCase()))) &&
//             (!formValue.employeeId || (user.employeeId && user.employeeId.toLowerCase().includes(formValue.employeeId.toLowerCase()))) &&
//             (!formValue.hireDate || (user.hireDate && user.hireDate === formValue.hireDate))
//           : true) &&
//         (formValue.role === 'TEACHER'
//           ? (!formValue.subjectSpecialization || (user.subjectSpecialization && user.subjectSpecialization.toLowerCase().includes(formValue.subjectSpecialization.toLowerCase()))) &&
//             (!formValue.qualification || (user.qualification && user.qualification.toLowerCase().includes(formValue.qualification.toLowerCase()))) &&
//             (!formValue.teacherRank || (user.teacherRank && user.teacherRank.toLowerCase().includes(formValue.teacherRank.toLowerCase()))) &&
//             (!formValue.employeeId || (user.employeeId && user.employeeId.toLowerCase().includes(formValue.employeeId.toLowerCase()))) &&
//             (!formValue.hireDate || (user.hireDate && user.hireDate === formValue.hireDate)) &&
//             (!formValue.schoolName || (user.schoolNameTeacher && user.schoolNameTeacher.toLowerCase().includes(formValue.schoolName.toLowerCase())))
//           : true) &&
//         (formValue.role === 'STUDENT'
//           ? (!formValue.studentId || (user.studentId && user.studentId.toLowerCase().includes(formValue.studentId.toLowerCase()))) &&
//             (!formValue.enrollmentDate || (user.enrollmentDate && user.enrollmentDate === formValue.enrollmentDate)) &&
//             (!formValue.gradeLevel || (user.gradeLevel && user.gradeLevel.toLowerCase().includes(formValue.gradeLevel.toLowerCase()))) &&
//             (!formValue.schoolClass || (user.schoolClass && user.schoolClass.toLowerCase().includes(formValue.schoolClass.toLowerCase()))) &&
//             (!formValue.parentName || (user.parentName && user.parentName.toLowerCase().includes(formValue.parentName.toLowerCase()))) &&
//             (!formValue.parentContact || (user.parentContact && user.parentContact.toLowerCase().includes(formValue.parentContact.toLowerCase()))) &&
//             (!formValue.previousSchool || (user.previousSchool && user.previousSchool.toLowerCase().includes(formValue.previousSchool.toLowerCase()))) &&
//             (!formValue.medicalConditions || (user.medicalConditions && user.medicalConditions.toLowerCase().includes(formValue.medicalConditions.toLowerCase()))) &&
//             (!formValue.schoolName || (user.schoolNameStudent && user.schoolNameStudent.toLowerCase().includes(formValue.schoolName.toLowerCase())))
//           : true)
//       );
//     });
//     this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
//     this.currentPage = 1;
//   }

//   getPaginatedUsers(): User[] {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
//   }

//   changePage(page: number) {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//     }
//   }

//   toggleSearch() {
//     this.showSearch = !this.showSearch;
//   }

//   toggleDeactivated() {
//     this.showDeactivated = !this.showDeactivated;
//     this.filterUsers(); // Re-filter when toggling
//   }

//   editUser(user: User) {
//     this.router.navigate([`/admin/users/edit/${user.id}`]);
//   }

//   viewDetails(user: User) {
//     this.router.navigate([`/admin/users/details/${user.id}`]);
//   }

//   deactivateUser(user: User) {
//     if (confirm(`Are you sure you want to deactivate ${user.username}?`)) {
//       const updatedUser = { ...user, status: 'Suspended' };
//       this.userService.updateUser(user.id!, updatedUser).subscribe({
//         next: () => {
//           this.ngOnInit(); // Reload data after deactivation
//         },
//         error: (err) => console.error('Failed to deactivate user:', err.message)
//       });
//     }
//   }

//   deleteUser(user: User) {
//     if (confirm(`Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`)) {
//       this.userService.deleteUser(user.id!).subscribe({
//         next: () => {
//           this.ngOnInit(); // Reload data after deletion
//         },
//         error: (err) => console.error('Failed to delete user:', err.message)
//       });
//     }
//   }
// }


import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/user.service';
import { User } from 'src/app/Models/user.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchForm: FormGroup;
  showSearch: boolean = false;
  showDeactivated: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  selectedUser: User | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef to force UI updates
  ) {
    this.searchForm = this.fb.group({
      username: [''],
      firstName: [''],
      lastName: [''],
      role: [''],
      profileDesignation: [''],
      department: [''],
      accessLevel: [''],
      employeeId: [''],
      hireDate: [''],
      schoolName: [''],
      adminCode: [''],
      subjectSpecialization: [''],
      qualification: [''],
      teacherRank: [''],
      studentId: [''],
      enrollmentDate: [''],
      gradeLevel: [''],
      schoolClass: [''],
      parentName: [''],
      parentContact: [''],
      previousSchool: [''],
      medicalConditions: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.searchForm.valueChanges.subscribe(() => this.filterUsers());
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Loaded users from server:', users); // Debug log
        this.users = users.map(user => ({
          ...user,
          profile: user.profile 
            ? { code: user.profile.code, designation: user.profile.designation }
            : undefined
        }));
        this.filterUsers();
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => this.showErrorModal('Failed to load users: ' + err.message)
    });
  }

  filterUsers() {
    const formValue = this.searchForm.value;
    this.filteredUsers = this.users.filter(user => {
      const statusFilter = this.showDeactivated ? user.status === 'Suspended' : user.status !== 'Suspended';
      return statusFilter && (
        (!formValue.username || user.username.toLowerCase().includes(formValue.username.toLowerCase())) &&
        (!formValue.firstName || user.firstName.toLowerCase().includes(formValue.firstName.toLowerCase())) &&
        (!formValue.lastName || user.lastName.toLowerCase().includes(formValue.lastName.toLowerCase())) &&
        (!formValue.role || user.role === formValue.role) &&
        (!formValue.profileDesignation || (user.profile?.designation && user.profile.designation.toLowerCase().includes(formValue.profileDesignation.toLowerCase()))) &&
        (formValue.role === 'CENTRAL_ADMIN'
          ? (!formValue.department || (user.department && user.department.toLowerCase().includes(formValue.department.toLowerCase()))) &&
            (!formValue.accessLevel || (user.accessLevel && user.accessLevel.toLowerCase().includes(formValue.accessLevel.toLowerCase()))) &&
            (!formValue.employeeId || (user.employeeId && user.employeeId.toLowerCase().includes(formValue.employeeId.toLowerCase()))) &&
            (!formValue.hireDate || (user.hireDate && user.hireDate === formValue.hireDate))
          : true) &&
        (formValue.role === 'LOCAL_ADMIN'
          ? (!formValue.schoolName || (user.schoolName && user.schoolName.toLowerCase().includes(formValue.schoolName.toLowerCase()))) &&
            (!formValue.adminCode || (user.adminCode && user.adminCode.toLowerCase().includes(formValue.adminCode.toLowerCase()))) &&
            (!formValue.employeeId || (user.employeeId && user.employeeId.toLowerCase().includes(formValue.employeeId.toLowerCase()))) &&
            (!formValue.hireDate || (user.hireDate && user.hireDate === formValue.hireDate))
          : true) &&
        (formValue.role === 'TEACHER'
          ? (!formValue.subjectSpecialization || (user.subjectSpecialization && user.subjectSpecialization.toLowerCase().includes(formValue.subjectSpecialization.toLowerCase()))) &&
            (!formValue.qualification || (user.qualification && user.qualification.toLowerCase().includes(formValue.qualification.toLowerCase()))) &&
            (!formValue.teacherRank || (user.teacherRank && user.teacherRank.toLowerCase().includes(formValue.teacherRank.toLowerCase()))) &&
            (!formValue.employeeId || (user.employeeId && user.employeeId.toLowerCase().includes(formValue.employeeId.toLowerCase()))) &&
            (!formValue.hireDate || (user.hireDate && user.hireDate === formValue.hireDate)) &&
            (!formValue.schoolName || (user.schoolNameTeacher && user.schoolNameTeacher.toLowerCase().includes(formValue.schoolName.toLowerCase())))
          : true) &&
        (formValue.role === 'STUDENT'
          ? (!formValue.studentId || (user.studentId && user.studentId.toLowerCase().includes(formValue.studentId.toLowerCase()))) &&
            (!formValue.enrollmentDate || (user.enrollmentDate && user.enrollmentDate === formValue.enrollmentDate)) &&
            (!formValue.gradeLevel || (user.gradeLevel && user.gradeLevel.toLowerCase().includes(formValue.gradeLevel.toLowerCase()))) &&
            (!formValue.schoolClass || (user.schoolClass && user.schoolClass.toLowerCase().includes(formValue.schoolClass.toLowerCase()))) &&
            (!formValue.parentName || (user.parentName && user.parentName.toLowerCase().includes(formValue.parentName.toLowerCase()))) &&
            (!formValue.parentContact || (user.parentContact && user.parentContact.toLowerCase().includes(formValue.parentContact.toLowerCase()))) &&
            (!formValue.previousSchool || (user.previousSchool && user.previousSchool.toLowerCase().includes(formValue.previousSchool.toLowerCase()))) &&
            (!formValue.medicalConditions || (user.medicalConditions && user.medicalConditions.toLowerCase().includes(formValue.medicalConditions.toLowerCase()))) &&
            (!formValue.schoolName || (user.schoolNameStudent && user.schoolNameStudent.toLowerCase().includes(formValue.schoolName.toLowerCase())))
          : true)
      );
    });
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    console.log('Filtered users:', this.filteredUsers); // Debug log
    this.cdr.detectChanges(); // Force change detection after filtering
  }

  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges(); // Ensure pagination updates UI
    }
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    this.cdr.detectChanges();
  }

  toggleDeactivated() {
    this.showDeactivated = !this.showDeactivated;
    this.filterUsers();
  }

  editUser(user: User) {
    this.router.navigate([`/admin/users/edit/${user.id}`]);
  }

  viewDetails(user: User) {
    this.router.navigate([`/admin/users/details/${user.id}`]);
  }

  deactivateUser(user: User) {
    this.selectedUser = user;
    const modalElement = document.getElementById('deactivateConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to deactivate ${user.username}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDeactivate(confirmed: boolean) {
    if (confirmed && this.selectedUser) {
      const updatedUser = { ...this.selectedUser, status: 'Suspended' };
      delete updatedUser.password; // Remove password field
      console.log('Deactivate payload:', JSON.stringify(updatedUser)); // Debug log
      this.userService.updateUser(this.selectedUser.id!, updatedUser).subscribe({
        next: () => {
          const userIndex = this.users.findIndex(u => u.id === this.selectedUser!.id);
          if (userIndex !== -1) {
            this.users[userIndex] = { ...updatedUser };
            console.log('Updated user locally:', this.users[userIndex]);
          }
          this.filterUsers();
          this.showSuccessModal(`User ${this.selectedUser!.username} deactivated successfully!`);
          this.selectedUser = null;
        },
        error: (err) => this.showErrorModal('Failed to deactivate user: ' + err.message)
      });
    } else {
      this.selectedUser = null;
    }
  }

  deleteUser(user: User) {
    this.selectedUser = user;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean) {
    if (confirmed && this.selectedUser) {
      this.userService.deleteUser(this.selectedUser.id!).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
          console.log('Users after deletion:', this.users); // Debug log
          this.filterUsers(); // Re-filter to update filteredUsers
          this.showSuccessModal(`User ${this.selectedUser!.username} deleted successfully!`);
          this.selectedUser = null;
        },
        error: (err) => this.showErrorModal('Failed to delete user: ' + err.message)
      });
    } else {
      this.selectedUser = null;
    }
  }

  private showSuccessModal(message: string, callback?: () => void) {
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = message;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      if (callback) {
        modalElement.addEventListener('hidden.bs.modal', callback, { once: true });
      }
    }
  }

  private showErrorModal(message: string) {
    const modalElement = document.getElementById('errorModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = message;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}