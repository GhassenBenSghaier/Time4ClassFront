

// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { UserService } from 'src/app/user.service';
// import { ProfileService, Profile } from 'src/app/profile.service';
// import { PermissionService } from 'src/app/permission.service';
// import { User } from 'src/app/Models/user.model';
// import * as bootstrap from 'bootstrap';

// @Component({
//   selector: 'app-add-user',
//   templateUrl: './add-user.component.html',
//   styleUrls: ['./add-user.component.css']
// })
// export class AddUserComponent implements OnInit {
//   user: User = {
//     username: '',
//     password: '',
//     role: '',
//     profileCode: '',
//     email: '',
//     status: 'Pending',
//     firstName: '',
//     lastName: '',
//     birthdate: '',
//     gender: '',
//     address: '',
//     phoneNumber: ''
//   };
//   profiles: Profile[] = [];
//   allowedProfiles: Profile[] = []; // Filtered profiles
//   allRoles: string[] = ['CENTRAL_ADMIN', 'LOCAL_ADMIN', 'TEACHER', 'STUDENT'];
//   isSubmitted = false;
//   successMessage: string | null = null;
//   errorMessage: string | null = null;
//   permissionErrorMessage: string | null = null;

//   constructor(
//     private userService: UserService,
//     private profileService: ProfileService,
//     private permissionService: PermissionService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.permissionService.refreshPermissions();
//     console.log('Permissions in ngOnInit:', this.permissionService.getPermissions());
//     this.loadProfiles();
//   }

//   loadProfiles() {
//     this.profileService.getAllProfiles().subscribe({
//       next: (profiles) => {
//         this.profiles = profiles;
//         // Filter profiles based on authenticated user's permissions
//         this.allowedProfiles = profiles.filter(profile => 
//           this.permissionService.isProfileAllowed(
//             profile.permissions.map(p => p.name) // Extract permission names
//           )
//         );
//         console.log('Loaded profiles:', this.profiles);
//         console.log('Allowed profiles:', this.allowedProfiles);
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to load profiles: ' + err.message;
//       }
//     });
//   }

//   onRoleChange(event: Event) {
//     const target = event.target as HTMLSelectElement;
//     if (target) {
//       this.user.role = target.value;
//       this.resetRoleSpecificFields();
//     }
//   }

//   private resetRoleSpecificFields() {
//     this.user.department = this.user.role === 'CENTRAL_ADMIN' ? this.user.department : '';
//     this.user.accessLevel = this.user.role === 'CENTRAL_ADMIN' ? this.user.accessLevel : '';
//     this.user.employeeId = (this.user.role === 'CENTRAL_ADMIN' || this.user.role === 'LOCAL_ADMIN' || this.user.role === 'TEACHER') ? this.user.employeeId : '';
//     this.user.hireDate = (this.user.role === 'CENTRAL_ADMIN' || this.user.role === 'LOCAL_ADMIN' || this.user.role === 'TEACHER') ? this.user.hireDate : '';
//     this.user.schoolName = this.user.role === 'LOCAL_ADMIN' ? this.user.schoolName : '';
//     this.user.adminCode = this.user.role === 'LOCAL_ADMIN' ? this.user.adminCode : '';
//     this.user.subjectSpecialization = this.user.role === 'TEACHER' ? this.user.subjectSpecialization : '';
//     this.user.qualification = this.user.role === 'TEACHER' ? this.user.qualification : '';
//     this.user.teacherRank = this.user.role === 'TEACHER' ? this.user.teacherRank : '';
//     this.user.schoolNameTeacher = this.user.role === 'TEACHER' ? this.user.schoolNameTeacher : '';
//     this.user.studentId = this.user.role === 'STUDENT' ? this.user.studentId : '';
//     this.user.enrollmentDate = this.user.role === 'STUDENT' ? this.user.enrollmentDate : '';
//     this.user.gradeLevel = this.user.role === 'STUDENT' ? this.user.gradeLevel : '';
//     this.user.schoolClass = this.user.role === 'STUDENT' ? this.user.schoolClass : '';
//     this.user.parentName = this.user.role === 'STUDENT' ? this.user.parentName : '';
//     this.user.parentContact = this.user.role === 'STUDENT' ? this.user.parentContact : '';
//     this.user.previousSchool = this.user.role === 'STUDENT' ? this.user.previousSchool : '';
//     this.user.medicalConditions = this.user.role === 'STUDENT' ? this.user.medicalConditions : '';
//     this.user.schoolNameStudent = this.user.role === 'STUDENT' ? this.user.schoolNameStudent : '';
//   }

//   canAddUser(): boolean {
//     const permission = `ADD_USER_${this.user.role.toUpperCase()}`;
//     return this.permissionService.hasPermission(permission);
//   }

//   onSubmit() {
//     this.isSubmitted = true;
//     this.successMessage = null;
//     this.errorMessage = null;
//     this.permissionErrorMessage = null;

//     console.log('Selected role:', this.user.role);
//     console.log('Selected profileCode:', this.user.profileCode);
//     console.log('Can add user:', this.canAddUser());

//     if (!this.user.username || !this.user.email || !this.user.role || !this.user.password || 
//         !this.user.firstName || !this.user.lastName || !this.user.profileCode) {
//       this.errorMessage = 'Required fields are missing';
//       return;
//     }

//     // Validate profile permissions
//     const selectedProfile = this.allowedProfiles.find(p => p.code === this.user.profileCode);
//     if (!selectedProfile || !this.permissionService.isProfileAllowed(selectedProfile.permissions.map(p => p.name))) {
//       this.permissionErrorMessage = `You cannot assign profile '${selectedProfile?.designation}' as it contains permissions you do not have.`;
//       const modalElement = document.getElementById('permissionModal');
//       if (modalElement) {
//         const modal = new bootstrap.Modal(modalElement);
//         modal.show();
//       }
//       return;
//     }

//     if (!this.canAddUser()) {
//       this.permissionErrorMessage = `Your profile does not allow this action: ADD_USER_${this.user.role.toUpperCase()}`;
//       const modalElement = document.getElementById('permissionModal');
//       if (modalElement) {
//         const modal = new bootstrap.Modal(modalElement);
//         modal.show();
//       }
//       return;
//     }

//     if (this.user.role === 'STUDENT' && !this.user.studentStatus) {
//       this.user.studentStatus = 'Enrolled';
//     }

//     this.userService.addUser(this.user).subscribe({
//       next: (addedUser) => {
//         this.successMessage = 'User added successfully! Redirecting...';
//         setTimeout(() => this.router.navigate(['/admin/users']), 2000);
//       },
//       error: (error) => {
//         this.errorMessage = 'Failed to add user: ' + error.message;
//       }
//     });
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/user.service';
import { ProfileService, Profile } from 'src/app/profile.service';
import { PermissionService } from 'src/app/permission.service';
import { User } from 'src/app/Models/user.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  user: User = {
    username: '',
    password: '',
    role: '',
    profileCode: '',
    email: '',
    status: 'Pending',
    firstName: '',
    lastName: '',
    birthdate: '',
    gender: '',
    address: '',
    phoneNumber: ''
  };
  profiles: Profile[] = [];
  allowedProfiles: Profile[] = [];
  allRoles: string[] = ['CENTRAL_ADMIN', 'LOCAL_ADMIN', 'TEACHER', 'STUDENT'];
  isSubmitted = false;

  constructor(
    private userService: UserService,
    private profileService: ProfileService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.permissionService.refreshPermissions();
    this.loadProfiles();
  }

  loadProfiles() {
    this.profileService.getAllProfiles().subscribe({
      next: (profiles) => {
        this.profiles = profiles;
        this.allowedProfiles = profiles.filter(profile => 
          this.permissionService.isProfileAllowed(profile.permissions.map(p => p.name))
        );
      },
      error: (err) => this.showErrorModal('Failed to load profiles: ' + err.message)
    });
  }

  onRoleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.user.role = target.value;
      this.resetRoleSpecificFields();
    }
  }

  private resetRoleSpecificFields() {
    this.user.department = this.user.role === 'CENTRAL_ADMIN' ? this.user.department : '';
    this.user.schoolName = this.user.role === 'LOCAL_ADMIN' ? this.user.schoolName : '';
    this.user.subjectSpecialization = this.user.role === 'TEACHER' ? this.user.subjectSpecialization : '';
    this.user.studentId = this.user.role === 'STUDENT' ? this.user.studentId : '';
    // Add other role-specific fields as needed
  }

  canAddUser(): boolean {
    const permission = `ADD_USER_${this.user.role.toUpperCase()}`;
    return this.permissionService.hasPermission(permission);
  }

  confirmSubmit() {
    const modalElement = document.getElementById('confirmModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onSubmit(confirmed: boolean = false) {
    if (!confirmed) {
      this.confirmSubmit();
      return;
    }

    this.isSubmitted = true;

    // Basic validation for required fields (matching EditUserComponent)
    if (!this.user.username || !this.user.email || !this.user.role || !this.user.password || 
        !this.user.firstName || !this.user.lastName || !this.user.status || !this.user.profileCode) {
      this.showErrorModal('Required fields (Username, Email, Role, Password, First Name, Last Name, Status, Profile) are missing');
      return;
    }

    // Role-specific validation (matching EditUserComponent)
    if (this.user.role === 'CENTRAL_ADMIN' && !this.user.employeeId) {
      this.showErrorModal('Employee ID is required for Central Admin');
      return;
    } else if (this.user.role === 'LOCAL_ADMIN' && !this.user.schoolName) {
      this.showErrorModal('School Name is required for Local Admin');
      return;
    } else if (this.user.role === 'TEACHER' && !this.user.subjectSpecialization) {
      this.showErrorModal('Subject Specialization is required for Teacher');
      return;
    } else if (this.user.role === 'STUDENT' && !this.user.studentId) {
      this.showErrorModal('Student ID is required for Student');
      return;
    }

    const selectedProfile = this.allowedProfiles.find(p => p.code === this.user.profileCode);
    if (!selectedProfile || !this.permissionService.isProfileAllowed(selectedProfile.permissions.map(p => p.name))) {
      this.showPermissionErrorModal(`You cannot assign profile '${selectedProfile?.designation}' as it contains permissions you do not have.`);
      return;
    }

    if (!this.canAddUser()) {
      this.showPermissionErrorModal(`Your profile does not allow this action: ADD_USER_${this.user.role.toUpperCase()}`);
      return;
    }

    if (this.user.role === 'STUDENT' && !this.user.studentStatus) {
      this.user.studentStatus = 'Enrolled';
    }

    this.userService.addUser(this.user).subscribe({
      next: (addedUser) => {
        this.showSuccessModal('User added successfully! Redirecting...', () => {
          this.router.navigate(['/admin/users']);
        });
      },
      error: (error) => this.showErrorModal('Failed to add user: ' + error.message)
    });
  }

  // Modal Display Functions (unchanged)
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

  private showPermissionErrorModal(message: string) {
    const modalElement = document.getElementById('permissionModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = message;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}