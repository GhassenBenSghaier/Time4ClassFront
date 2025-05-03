import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/user.service';
import { AuthService } from 'src/app/auth.service';
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
  isLocalAdmin: boolean = false;
  schoolName: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
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
    this.isLocalAdmin = this.authService.isLocalAdmin();
    if (this.isLocalAdmin) {
      this.authService.getCurrentUserSchool().subscribe({
        next: (schoolName: string | null) => {
          this.schoolName = schoolName;
          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (err: any) => this.showErrorModal('Failed to load school name: ' + err.message)
      });
    } else {
      this.loadUsers();
    }
    this.searchForm.valueChanges.subscribe(() => this.filterUsers());
  }

  loadUsers() {
    if (this.isLocalAdmin && this.schoolName) {
      this.userService.getUsersBySchool(this.schoolName).subscribe({
        next: (users: User[]) => {
          console.log('Loaded users for school:', this.schoolName, users);
          this.users = users.map((user: User) => ({
            ...user,
            profile: user.profile
              ? { code: user.profile.code, designation: user.profile.designation }
              : undefined,
            schoolNameLocalAdmin: user.schoolNameLocalAdmin || '',
            schoolNameTeacher: user.schoolNameTeacher || '',
            schoolNameStudent: user.schoolNameStudent || '',
            subjectSpecialization: user.subjectSpecialization || ''
          }));
          this.filterUsers();
          this.cdr.detectChanges();
        },
        error: (err: any) => this.showErrorModal('Failed to load users: ' + err.message)
      });
    } else {
      this.userService.getUsers().subscribe({
        next: (users: User[]) => {
          console.log('Loaded users from server:', users);
          this.users = users.map((user: User) => ({
            ...user,
            profile: user.profile
              ? { code: user.profile.code, designation: user.profile.designation }
              : undefined,
            schoolNameLocalAdmin: user.schoolNameLocalAdmin || '',
            schoolNameTeacher: user.schoolNameTeacher || '',
            schoolNameStudent: user.schoolNameStudent || '',
            subjectSpecialization: user.subjectSpecialization || ''
          }));
          this.filterUsers();
          this.cdr.detectChanges();
        },
        error: (err: any) => this.showErrorModal('Failed to load users: ' + err.message)
      });
    }
  }

  filterUsers() {
    const formValue = this.searchForm.value;
    this.filteredUsers = this.users.filter(user => {
      const statusFilter = this.showDeactivated ? user.status === 'Suspended' : user.status !== 'Suspended';
      const schoolFilter = this.isLocalAdmin && this.schoolName
        ? (user.role === 'LOCAL_ADMIN' && user.schoolNameLocalAdmin === this.schoolName) ||
          (user.role === 'TEACHER' && user.schoolNameTeacher === this.schoolName) ||
          (user.role === 'STUDENT' && user.schoolNameStudent === this.schoolName)
        : true;
      return statusFilter && schoolFilter && (
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
          ? (!formValue.adminCode || (user.adminCode && user.adminCode.toLowerCase().includes(formValue.adminCode.toLowerCase()))) &&
            (!formValue.employeeId || (user.employeeId && user.employeeId.toLowerCase().includes(formValue.employeeId.toLowerCase()))) &&
            (!formValue.hireDate || (user.hireDate && user.hireDate === formValue.hireDate))
          : true) &&
        (formValue.role === 'TEACHER'
          ? (!formValue.subjectSpecialization || (user.subjectSpecialization && user.subjectSpecialization.toLowerCase().includes(formValue.subjectSpecialization.toLowerCase()))) &&
            (!formValue.qualification || (user.qualification && user.qualification.toLowerCase().includes(formValue.qualification.toLowerCase()))) &&
            (!formValue.teacherRank || (user.teacherRank && user.teacherRank.toLowerCase().includes(formValue.teacherRank.toLowerCase()))) &&
            (!formValue.employeeId || (user.employeeId && user.employeeId.toLowerCase().includes(formValue.employeeId.toLowerCase()))) &&
            (!formValue.hireDate || (user.hireDate && user.hireDate === formValue.hireDate))
          : true) &&
        (formValue.role === 'STUDENT'
          ? (!formValue.studentId || (user.studentId && user.studentId.toLowerCase().includes(formValue.studentId.toLowerCase()))) &&
            (!formValue.enrollmentDate || (user.enrollmentDate && user.enrollmentDate === formValue.enrollmentDate)) &&
            (!formValue.gradeLevel || (user.gradeLevel && user.gradeLevel.toLowerCase().includes(formValue.gradeLevel.toLowerCase()))) &&
            (!formValue.schoolClass || (user.schoolClass && user.schoolClass.toLowerCase().includes(formValue.schoolClass.toLowerCase()))) &&
            (!formValue.parentName || (user.parentName && user.parentName.toLowerCase().includes(formValue.parentName.toLowerCase()))) &&
            (!formValue.parentContact || (user.parentContact && user.parentContact.toLowerCase().includes(formValue.parentContact.toLowerCase()))) &&
            (!formValue.previousSchool || (user.previousSchool && user.previousSchool.toLowerCase().includes(formValue.previousSchool.toLowerCase()))) &&
            (!formValue.medicalConditions || (user.medicalConditions && user.medicalConditions.toLowerCase().includes(formValue.medicalConditions.toLowerCase())))
          : true)
      );
    });
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    console.log('Filtered users:', this.filteredUsers);
    this.cdr.detectChanges();
  }

  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchForm.reset({
        username: '',
        firstName: '',
        lastName: '',
        role: '',
        profileDesignation: '',
        department: '',
        accessLevel: '',
        employeeId: '',
        hireDate: '',
        schoolName: this.isLocalAdmin ? this.schoolName : '',
        adminCode: '',
        subjectSpecialization: '',
        qualification: '',
        teacherRank: '',
        studentId: '',
        enrollmentDate: '',
        gradeLevel: '',
        schoolClass: '',
        parentName: '',
        parentContact: '',
        previousSchool: '',
        medicalConditions: ''
      });
      this.filterUsers();
    }
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
      delete updatedUser.password;

      console.log('Deactivate payload:', JSON.stringify(updatedUser));
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
        error: (err: any) => this.showErrorModal('Failed to deactivate user: ' + err.message)
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
      if (modalBody) modalBody.textContent = `Are you sure you want to permanently delete ${user.username}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean) {
    if (confirmed && this.selectedUser) {
      const userId = this.selectedUser.id!;
      const userRole = this.selectedUser.role;
      console.log(`Initiating deletion for user ID: ${userId}, Role: ${userRole}`);
      this.userService.deleteUser(userId, userRole).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          console.log('Users after deletion:', this.users);
          this.filterUsers();
          this.showSuccessModal(`User ${this.selectedUser!.username} deleted successfully!`);
          this.selectedUser = null;
        },
        error: (err: any) => {
          console.error('Deletion failed:', err);
          this.showErrorModal('Failed to delete user: ' + err.message);
          this.selectedUser = null;
        }
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