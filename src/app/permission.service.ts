import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions: string[] = [];
  private permissionsSubject = new BehaviorSubject<string[]>([]);
  private statusSubject = new BehaviorSubject<string | null>(null);

  constructor(private router: Router) {
    this.loadPermissions();
  }

  loadPermissions() {
    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token);
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('Decoded JWT:', decoded);
        const status = decoded.status || null;
        this.permissions = decoded.permissions || [];
        this.permissionsSubject.next(this.permissions);
        this.statusSubject.next(status); // Set status even if it’s Suspended
        console.log('Permissions loaded:', this.permissions, 'Status:', status);

        if (status === 'Suspended') {
          console.warn('Account is suspended');
          localStorage.removeItem('authToken'); // Clear token
          this.permissions = [];
          this.permissionsSubject.next(this.permissions);
          // Do NOT reset statusSubject here; keep it as "Suspended"
        }
      } catch (error) {
        console.error('Error decoding JWT:', error);
        this.permissions = [];
        this.permissionsSubject.next(this.permissions);
        this.statusSubject.next(null);
      }
    } else {
      console.warn('No token found in localStorage');
      this.permissions = [];
      this.permissionsSubject.next(this.permissions);
      // Only reset statusSubject to null if it wasn’t already set (e.g., on initial load)
      if (this.statusSubject.value === null) {
        this.statusSubject.next(null);
      }
    }
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  getPermissions(): string[] {
    return this.permissions;
  }

  refreshPermissions() {
    this.loadPermissions();
  }

  getPermissionsObservable() {
    return this.permissionsSubject.asObservable();
  }

  getStatusObservable() {
    return this.statusSubject.asObservable();
  }

  getAccountStatus(): string | null {
    return this.statusSubject.value;
  }

  isProfileAllowed(profilePermissions: string[]): boolean {
    return profilePermissions.every(permission => this.permissions.includes(permission));
  }
}