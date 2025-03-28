

// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { UserService } from 'src/app/user.service';
// import { ProfileService, Profile } from 'src/app/profile.service';
// import { PermissionService } from 'src/app/permission.service';
// import { User } from 'src/app/Models/user.model';
// import * as bootstrap from 'bootstrap';

// @Component({
//   selector: 'app-edit-user',
//   templateUrl: './edit-user.component.html',
//   styleUrls: ['./edit-user.component.css']
// })
// export class EditUserComponent implements OnInit {
//   user: User = {
//     id: 0,
//     username: '',
//     password: undefined, // Explicitly undefined to indicate no change
//     role: '',
//     profileCode: '',
//     email: '',
//     status: 'Pending',
//     firstName: '',
//     lastName: '',
//     birthdate: '',
//     gender: '',
//     address: '',
//     phoneNumber: '',
//     department: '',
//     accessLevel: '',
//     employeeId: '',
//     hireDate: '',
//     schoolName: '',
//     adminCode: '',
//     subjectSpecialization: '',
//     qualification: '',
//     teacherRank: '',
//     schoolNameTeacher: '',
//     studentId: '',
//     enrollmentDate: '',
//     gradeLevel: '',
//     schoolClass: '',
//     parentName: '',
//     parentContact: '',
//     previousSchool: '',
//     medicalConditions: '',
//     studentStatus: '',
//     schoolNameStudent: ''
//   };
//   profiles: Profile[] = [];
//   allowedProfiles: Profile[] = [];
//   isSubmitted: boolean = false;
//   newPassword: string = ''; // Separate field for new password input

//   constructor(
//     private userService: UserService,
//     private profileService: ProfileService,
//     private permissionService: PermissionService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     const id = +this.route.snapshot.paramMap.get('id')!;
//     this.permissionService.refreshPermissions();
//     this.loadProfiles();
//     this.userService.getUser(id).subscribe({
//       next: (user) => {
//         this.user = {
//           ...user,
//           profileCode: user.profile ? user.profile.code : user.profileCode,
//           password: undefined // Do not set password from backend
//         };
//       },
//       error: (error) => this.showErrorModal('User not found or failed to load: ' + error.message)
//     });
//   }

//   loadProfiles() {
//     this.profileService.getAllProfiles().subscribe({
//       next: (profiles) => {
//         this.profiles = profiles;
//         this.allowedProfiles = profiles.filter(profile => 
//           this.permissionService.isProfileAllowed(profile.permissions.map(p => p.name))
//         );
//       },
//       error: (err) => this.showErrorModal('Failed to load profiles: ' + err.message)
//     });
//   }

//   canEditUser(): boolean {
//     const permission = `EDIT_USER_${this.user.role.toUpperCase()}`;
//     return this.permissionService.hasPermission(permission);
//   }

//   confirmSubmit() {
//     const modalElement = document.getElementById('confirmModal');
//     if (modalElement) {
//       const modal = new bootstrap.Modal(modalElement);
//       modal.show();
//     }
//   }

//   onSubmit(confirmed: boolean = false) {
//     this.isSubmitted = true;

//     if (!confirmed) {
//       this.confirmSubmit();
//       return;
//     }

//     // Basic validation
//     if (!this.user.username || !this.user.email || !this.user.role || 
//         !this.user.firstName || !this.user.lastName || !this.user.status || !this.user.profileCode) {
//       this.showErrorModal('Required fields (Username, Email, Role, First Name, Last Name, Status, Profile) are missing');
//       return;
//     }

//     // Role-specific validation
//     if (this.user.role === 'CENTRAL_ADMIN' && !this.user.employeeId) {
//       this.showErrorModal('Employee ID is required for Central Admin');
//       return;
//     } else if (this.user.role === 'LOCAL_ADMIN' && !this.user.schoolName) {
//       this.showErrorModal('School Name is required for Local Admin');
//       return;
//     } else if (this.user.role === 'TEACHER' && !this.user.subjectSpecialization) {
//       this.showErrorModal('Subject Specialization is required for Teacher');
//       return;
//     } else if (this.user.role === 'STUDENT' && !this.user.studentId) {
//       this.showErrorModal('Student ID is required for Student');
//       return;
//     }

//     // Validate profile permissions
//     const selectedProfile = this.allowedProfiles.find(p => p.code === this.user.profileCode);
//     if (!selectedProfile || !this.permissionService.isProfileAllowed(selectedProfile.permissions.map(p => p.name))) {
//       this.showPermissionErrorModal(`You cannot assign profile '${selectedProfile?.designation}' as it contains permissions you do not have.`);
//       return;
//     }

//     // Check edit permission
//     if (!this.canEditUser()) {
//       this.showPermissionErrorModal(`Your profile does not allow this action: EDIT_USER_${this.user.role.toUpperCase()}`);
//       return;
//     }

//     // Only include password if a new one is provided
//     if (this.newPassword) {
//       this.user.password = this.newPassword;
//     } else {
//       delete this.user.password;
//     }
  
//     console.log('Update payload:', this.user); // Log the payload
  
//     this.userService.updateUser(this.user.id!, this.user).subscribe({
//       next: (response) => {
//         console.log('Update response:', response); // Log the response
//         this.showSuccessModal('User updated successfully! Redirecting...', () => {
//           this.router.navigate(['/admin/users']);
//         });
//       },
//       error: (error) => this.showErrorModal('Failed to update user: ' + error.message)
//     });
//   }
//   // Modal Display Functions
//   private showSuccessModal(message: string, callback?: () => void) {
//     const modalElement = document.getElementById('successModal');
//     if (modalElement) {
//       const modalBody = modalElement.querySelector('.modal-body');
//       if (modalBody) modalBody.textContent = message;
//       const modal = new bootstrap.Modal(modalElement);
//       modal.show();
//       if (callback) {
//         modalElement.addEventListener('hidden.bs.modal', callback, { once: true });
//       }
//     }
//   }

//   private showErrorModal(message: string) {
//     const modalElement = document.getElementById('errorModal');
//     if (modalElement) {
//       const modalBody = modalElement.querySelector('.modal-body');
//       if (modalBody) modalBody.textContent = message;
//       const modal = new bootstrap.Modal(modalElement);
//       modal.show();
//     }
//   }

//   private showPermissionErrorModal(message: string) {
//     const modalElement = document.getElementById('permissionModal');
//     if (modalElement) {
//       const modalBody = modalElement.querySelector('.modal-body');
//       if (modalBody) modalBody.textContent = message;
//       const modal = new bootstrap.Modal(modalElement);
//       modal.show();
//     }
//   }


// }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/user.service';
import { ProfileService, Profile } from 'src/app/profile.service';
import { PermissionService } from 'src/app/permission.service';
import { User } from 'src/app/Models/user.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  user: User = {
    id: 0,
    username: '',
    password: undefined,
    role: '',
    profileCode: '',
    email: '',
    status: 'Pending',
    firstName: '',
    lastName: '',
    birthdate: '',
    gender: '',
    address: '',
    phoneNumber: '',
    department: '',
    accessLevel: '',
    employeeId: '',
    hireDate: '',
    schoolName: '',
    adminCode: '',
    subjectSpecialization: '',
    qualification: '',
    teacherRank: '',
    schoolNameTeacher: '',
    studentId: '',
    enrollmentDate: '',
    gradeLevel: '',
    schoolClass: '',
    parentName: '',
    parentContact: '',
    previousSchool: '',
    medicalConditions: '',
    studentStatus: '',
    schoolNameStudent: ''
  };
  profiles: Profile[] = [];
  allowedProfiles: Profile[] = [];
  isSubmitted: boolean = false;
  newPassword: string = ''; // Separate field for new password input

  constructor(
    private userService: UserService,
    private profileService: ProfileService,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.permissionService.refreshPermissions();
    this.loadProfiles();
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.user = {
          ...user,
          profileCode: user.profile ? user.profile.code : user.profileCode,
          password: undefined
        };
      },
      error: (error) => this.showErrorModal('User not found or failed to load: ' + error.message)
    });
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

  canEditUser(): boolean {
    const permission = `EDIT_USER_${this.user.role.toUpperCase()}`;
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
    this.isSubmitted = true;

    if (!confirmed) {
      this.confirmSubmit();
      return;
    }

    // Basic validation
    if (!this.user.username || !this.user.email || !this.user.role || 
        !this.user.firstName || !this.user.lastName || !this.user.status || !this.user.profileCode) {
      this.showErrorModal('Required fields (Username, Email, Role, First Name, Last Name, Status, Profile) are missing');
      return;
    }

    // Role-specific validation
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

    // Validate profile permissions
    const selectedProfile = this.allowedProfiles.find(p => p.code === this.user.profileCode);
    if (!selectedProfile || !this.permissionService.isProfileAllowed(selectedProfile.permissions.map(p => p.name))) {
      this.showPermissionErrorModal(`You cannot assign profile '${selectedProfile?.designation}' as it contains permissions you do not have.`);
      return;
    }

    // Check edit permission
    if (!this.canEditUser()) {
      this.showPermissionErrorModal(`Your profile does not allow this action: EDIT_USER_${this.user.role.toUpperCase()}`);
      return;
    }

    // Only include password if a new, non-empty password is provided
    const updatePayload = { ...this.user };
    delete updatePayload.password; // Always remove password
    if (this.newPassword && this.newPassword.trim() !== '') {
      updatePayload.password = this.newPassword.trim(); // Only add if new password set
    }
    console.log('Update payload:', JSON.stringify(updatePayload));
    this.userService.updateUser(this.user.id!, updatePayload).subscribe({
      next: (response) => {
        console.log('Update response:', response);
        this.router.navigate(['/admin/users']);
      },
      error: (err) => console.error('Update failed:', err)
    });
  }

  // Modal Display Functions
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