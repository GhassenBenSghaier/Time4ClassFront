
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ProfileService, Profile, Permission } from 'src/app/profile.service';

// @Component({
//   selector: 'app-profiles',
//   templateUrl: './profiles.component.html',
//   styleUrls: ['./profiles.component.css']
// })
// export class ProfilesComponent implements OnInit {
//   profileForm: FormGroup;
//   permissions: Permission[] = []; 
//   userManagementActions = ['VIEW_USERS', 'ADD_USER', 'EDIT_USER', 'DELETE_USER'];
//   roles = ['CENTRAL_ADMIN', 'LOCAL_ADMIN', 'TEACHER', 'STUDENT'];
//   profilePermissions = ['CREATE_PROFILE', 'VIEW_PROFILES', 'EDIT_PROFILE', 'DELETE_PROFILE'];
//   selectedPermissions: string[] = [];
//   isSubmitted: boolean = false;
//   successMessage: string | null = null;
//   errorMessage: string | null = null;

//   constructor(
//     private fb: FormBuilder,
//     private profileService: ProfileService,
//     private router: Router
//   ) {
//     this.profileForm = this.fb.group({
//       code: ['', Validators.required],
//       designation: ['', Validators.required],
//       status: ['ACTIVE', Validators.required]
//     });
//   }

//   ngOnInit(): void {
//     this.profileService.getAllPermissions().subscribe({
//       next: (perms) => this.permissions = perms,
//       error: (err) => this.errorMessage = 'Failed to load permissions: ' + err.message
//     });
//   }

//   togglePermission(action: string, role?: string): void {
//     const perm = role ? `${action}_${role}` : action;
//     const index = this.selectedPermissions.indexOf(perm);
//     if (index > -1) {
//       this.selectedPermissions.splice(index, 1);
//     } else {
//       this.selectedPermissions.push(perm);
//     }
//   }

//   isPermissionSelected(action: string, role?: string): boolean {
//     const perm = role ? `${action}_${role}` : action;
//     return this.selectedPermissions.includes(perm);
//   }

//   onSubmit(): void {
//     this.isSubmitted = true;
//     this.successMessage = null;
//     this.errorMessage = null;

//     if (!this.profileForm.valid) {
//       this.errorMessage = 'Required fields are missing';
//       return;
//     }

//     if (this.selectedPermissions.length === 0) {
//       this.errorMessage = 'At least one permission must be selected';
//       return;
//     }

//     const profile: Profile = {
//       code: this.profileForm.get('code')?.value,
//       designation: this.profileForm.get('designation')?.value,
//       status: this.profileForm.get('status')?.value,
//       permissions: this.selectedPermissions.map(name => ({ name } as Permission)) // Still maps to Permission[] for Profile interface
//     };

//     this.profileService.createProfile(profile).subscribe({
//       next: (response) => {
//         this.successMessage = 'Profile created successfully! Redirecting...';
//         setTimeout(() => {
//           this.router.navigate(['/admin/profiles-list']);
//         }, 2000);
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to create profile: ' + err.message;
//       }
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, Profile, Permission } from 'src/app/profile.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {
  profileForm: FormGroup;
  permissions: Permission[] = []; 
  userManagementActions = ['VIEW_USERS', 'ADD_USER', 'EDIT_USER', 'DELETE_USER'];
  roles = ['CENTRAL_ADMIN', 'LOCAL_ADMIN', 'TEACHER', 'STUDENT'];
  profilePermissions = ['CREATE_PROFILE', 'VIEW_PROFILES', 'EDIT_PROFILE', 'DELETE_PROFILE'];
  selectedPermissions: string[] = [];
  isSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      code: ['', Validators.required],
      designation: ['', Validators.required],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.profileService.getAllPermissions().subscribe({
      next: (perms) => this.permissions = perms,
      error: (err) => this.showErrorModal('Failed to load permissions: ' + err.message)
    });
  }

  togglePermission(action: string, role?: string): void {
    const perm = role ? `${action}_${role}` : action;
    const index = this.selectedPermissions.indexOf(perm);
    if (index > -1) {
      this.selectedPermissions.splice(index, 1);
    } else {
      this.selectedPermissions.push(perm);
    }
  }

  isPermissionSelected(action: string, role?: string): boolean {
    const perm = role ? `${action}_${role}` : action;
    return this.selectedPermissions.includes(perm);
  }

  // Show Confirmation Modal
  confirmSubmit() {
    const modalElement = document.getElementById('confirmModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onSubmit(confirmed: boolean = false): void {
    this.isSubmitted = true;

    if (!confirmed) {
      this.confirmSubmit();
      return;
    }

    if (!this.profileForm.valid) {
      this.showErrorModal('Required fields are missing');
      return;
    }

    if (this.selectedPermissions.length === 0) {
      this.showErrorModal('At least one permission must be selected');
      return;
    }

    const profile: Profile = {
      code: this.profileForm.get('code')?.value,
      designation: this.profileForm.get('designation')?.value,
      status: this.profileForm.get('status')?.value,
      permissions: this.selectedPermissions.map(name => ({ name } as Permission))
    };

    this.profileService.createProfile(profile).subscribe({
      next: () => {
        this.showSuccessModal('Profile created successfully! Redirecting...', () => {
          this.router.navigate(['/admin/profiles-list']);
        });
      },
      error: (err) => this.showErrorModal('Failed to create profile: ' + err.message)
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
}