
// import { Component, OnInit } from '@angular/core';
// import { Router, NavigationEnd } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { ProfileService, Profile } from 'src/app/profile.service';
// import { filter } from 'rxjs/operators';

// @Component({
//   selector: 'app-profiles-list',
//   templateUrl: './profiles-list.component.html',
//   styleUrls: ['./profiles-list.component.css']
// })
// export class ProfilesListComponent implements OnInit {
//   profiles: Profile[] = [];
//   filteredProfiles: Profile[] = [];
//   searchForm: FormGroup;
//   showSearch: boolean = false;
//   currentPage: number = 1;
//   pageSize: number = 10;
//   totalPages: number = 0;

//   constructor(
//     private profileService: ProfileService,
//     private router: Router,
//     private fb: FormBuilder
//   ) {
//     this.searchForm = this.fb.group({
//       code: [''],
//       designation: [''],
//       status: ['']
//     });
//   }

//   ngOnInit(): void {
//     this.loadProfiles();
//     this.searchForm.valueChanges.subscribe(() => this.filterProfiles());

//     // Listen for navigation back to this component
//     this.router.events
//       .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/profiles-list'))
//       .subscribe(() => this.loadProfiles());
//   }

//   loadProfiles(): void {
//     this.profileService.getAllProfiles().subscribe({
//       next: (profiles) => {
//         this.profiles = profiles;
//         this.filterProfiles();
//       },
//       error: (err) => console.error('Error fetching profiles:', err.message)
//     });
//   }

//   filterProfiles(): void {
//     const formValue = this.searchForm.value;
//     this.filteredProfiles = this.profiles.filter(profile => {
//       return (
//         (!formValue.code || profile.code.toLowerCase().includes(formValue.code.toLowerCase())) &&
//         (!formValue.designation || profile.designation.toLowerCase().includes(formValue.designation.toLowerCase())) &&
//         (!formValue.status || profile.status === formValue.status)
//       );
//     });
//     this.totalPages = Math.ceil(this.filteredProfiles.length / this.pageSize);
//     this.currentPage = 1;
//   }

//   getPaginatedProfiles(): Profile[] {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     return this.filteredProfiles.slice(startIndex, startIndex + this.pageSize);
//   }

//   changePage(page: number): void {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//     }
//   }

//   toggleSearch(): void {
//     this.showSearch = !this.showSearch;
//   }

//   viewDetails(profile: Profile): void {
//     this.router.navigate([`/admin/profiles/details/${profile.id}`]);
//   }

//   editProfile(profile: Profile): void {
//     this.router.navigate([`/admin/profiles/edit/${profile.id}`]);
//   }

//   deleteProfile(profile: Profile): void {
//     if (confirm(`Are you sure you want to delete ${profile.designation} (${profile.code})?`)) {
//       this.profileService.deleteProfile(profile.id!).subscribe({
//         next: () => this.loadProfiles(),
//         error: (err) => console.error('Error deleting profile:', err.message)
//       });
//     }
//   }
// }
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService, Profile } from 'src/app/profile.service';
import { PermissionService } from 'src/app/permission.service'; // Add this import
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-profiles-list',
  templateUrl: './profiles-list.component.html',
  styleUrls: ['./profiles-list.component.css']
})
export class ProfilesListComponent implements OnInit {
  profiles: Profile[] = [];
  filteredProfiles: Profile[] = [];
  searchForm: FormGroup;
  showSearch: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  selectedProfile: Profile | null = null;

  constructor(
    private profileService: ProfileService,
    private permissionService: PermissionService, // Add this
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      code: [''],
      designation: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.permissionService.refreshPermissions(); // Ensure permissions are loaded
    this.loadProfiles();
    this.searchForm.valueChanges.subscribe(() => this.filterProfiles());

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/profiles-list'))
      .subscribe(() => this.loadProfiles());
  }

  loadProfiles(): void {
    this.profileService.getAllProfiles().subscribe({
      next: (profiles) => {
        // Filter profiles based on current user's permissions
        this.profiles = profiles.filter(profile => 
          this.permissionService.isProfileAllowed(profile.permissions.map(p => p.name))
        );
        this.filterProfiles();
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching profiles: ' + err.message)
    });
  }

  filterProfiles(): void {
    const formValue = this.searchForm.value;
    this.filteredProfiles = this.profiles.filter(profile => {
      return (
        (!formValue.code || profile.code.toLowerCase().includes(formValue.code.toLowerCase())) &&
        (!formValue.designation || profile.designation.toLowerCase().includes(formValue.designation.toLowerCase())) &&
        (!formValue.status || profile.status === formValue.status)
      );
    });
    this.totalPages = Math.ceil(this.filteredProfiles.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.cdr.detectChanges();
  }

  getPaginatedProfiles(): Profile[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredProfiles.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    this.cdr.detectChanges();
  }

  viewDetails(profile: Profile): void {
    this.router.navigate([`/admin/profiles/details/${profile.id}`]);
  }

  editProfile(profile: Profile): void {
    this.router.navigate([`/admin/profiles/edit/${profile.id}`]);
  }

  deleteProfile(profile: Profile): void {
    this.selectedProfile = profile;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete ${profile.designation} (${profile.code})?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean) {
    if (confirmed && this.selectedProfile) {
      this.profileService.deleteProfile(this.selectedProfile.id!).subscribe({
        next: () => {
          this.profiles = this.profiles.filter(p => p.id !== this.selectedProfile!.id);
          this.filterProfiles();
          this.showSuccessModal(`Profile ${this.selectedProfile!.designation} deleted successfully!`);
          this.selectedProfile = null;
        },
        error: (err) => this.showErrorModal('Error deleting profile: ' + err.message)
      });
    } else {
      this.selectedProfile = null;
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