// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ProfileService, Profile, Permission } from 'src/app/profile.service';

// @Component({
//   selector: 'app-profile-edit',
//   templateUrl: './profile-edit.component.html',
//   styleUrls: ['./profile-edit.component.css']
// })
// export class ProfileEditComponent implements OnInit {
//   profileForm: FormGroup;
//   permissions: Permission[] = [];
//   userManagementActions = ['VIEW_USERS', 'ADD_USER', 'EDIT_USER', 'DELETE_USER'];
//   roles = ['CENTRAL_ADMIN', 'LOCAL_ADMIN', 'TEACHER', 'STUDENT'];
//   profilePermissions = ['CREATE_PROFILE', 'VIEW_PROFILES', 'EDIT_PROFILE', 'DELETE_PROFILE'];
//   selectedPermissions: string[] = [];
//   profileId: number | null = null;
//   successMessage: string | null = null;
//   errorMessage: string | null = null;

//   constructor(
//     private fb: FormBuilder,
//     private profileService: ProfileService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {
//     this.profileForm = this.fb.group({
//       code: ['', Validators.required],
//       designation: ['', Validators.required],
//       status: ['ACTIVE', Validators.required]
//     });
//   }

//   ngOnInit(): void {
//     this.profileId = +this.route.snapshot.paramMap.get('id')!;
//     this.loadPermissions();
//     this.loadProfile();
//   }

//   loadProfile(): void {
//     if (this.profileId) {
//       this.profileService.getProfile(this.profileId).subscribe({
//         next: (profile) => {
//           this.profileForm.patchValue({
//             code: profile.code,
//             designation: profile.designation,
//             status: profile.status
//           });
//           // Extract permission names from Permission objects
//           this.selectedPermissions = (profile.permissions || []).map(p => p.name);
//           console.log('Loaded Permissions:', this.selectedPermissions);
//         },
//         error: (err) => this.errorMessage = 'Failed to load profile: ' + err.message
//       });
//     }
//   }

//   loadPermissions(): void {
//     this.profileService.getAllPermissions().subscribe({
//       next: (perms) => {
//         this.permissions = perms;
//       },
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
//     console.log('Updated Permissions:', this.selectedPermissions);
//   }

//   isPermissionSelected(action: string, role?: string): boolean {
//     const perm = role ? `${action}_${role}` : action;
//     return this.selectedPermissions.includes(perm);
//   }

//   onSubmit(): void {
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

//     const updatedProfile: Profile = {
//       id: this.profileId!,
//       code: this.profileForm.get('code')?.value,
//       designation: this.profileForm.get('designation')?.value,
//       status: this.profileForm.get('status')?.value,
//       permissions: this.selectedPermissions.map(name => ({ name } as Permission)) // Convert back to Permission objects
//     };

//     this.profileService.updateProfile(updatedProfile).subscribe({
//       next: () => {
//         this.successMessage = 'Profile updated successfully! Redirecting...';
//         setTimeout(() => {
//           this.router.navigate(['/admin/profiles-list']);
//         }, 2000);
//       },
//       error: (err) => this.errorMessage = 'Failed to update profile: ' + err.message
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService, Profile, Permission } from 'src/app/profile.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  permissions: Permission[] = [];
  userManagementActions = ['VIEW_USERS', 'ADD_USER', 'EDIT_USER', 'DELETE_USER'];
  roles = ['CENTRAL_ADMIN', 'LOCAL_ADMIN', 'TEACHER', 'STUDENT'];
  profilePermissions = ['CREATE_PROFILE', 'VIEW_PROFILES', 'EDIT_PROFILE', 'DELETE_PROFILE'];
  selectedPermissions: string[] = [];
  profileId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      code: ['', Validators.required],
      designation: ['', Validators.required],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.profileId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPermissions();
    this.loadProfile();
  }

  loadProfile(): void {
    if (this.profileId) {
      this.profileService.getProfile(this.profileId).subscribe({
        next: (profile) => {
          this.profileForm.patchValue({
            code: profile.code,
            designation: profile.designation,
            status: profile.status
          });
          this.selectedPermissions = (profile.permissions || []).map(p => p.name);
        },
        error: (err) => this.showErrorModal('Failed to load profile: ' + err.message)
      });
    }
  }

  loadPermissions(): void {
    this.profileService.getAllPermissions().subscribe({
      next: (perms) => {
        this.permissions = perms;
      },
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

    const updatedProfile: Profile = {
      id: this.profileId!,
      code: this.profileForm.get('code')?.value,
      designation: this.profileForm.get('designation')?.value,
      status: this.profileForm.get('status')?.value,
      permissions: this.selectedPermissions.map(name => ({ name } as Permission))
    };

    this.profileService.updateProfile(updatedProfile).subscribe({
      next: () => {
        this.showSuccessModal('Profile updated successfully! Redirecting...', () => {
          this.router.navigate(['/admin/profiles-list']);
        });
      },
      error: (err) => this.showErrorModal('Failed to update profile: ' + err.message)
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