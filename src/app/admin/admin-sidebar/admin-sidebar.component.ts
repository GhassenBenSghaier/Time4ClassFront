import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';
import { PermissionService } from 'src/app/permission.service'; // Import PermissionService

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {
  isCentralAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService, 
    private router: Router
  ) {}

  ngOnInit() {
    const userRole = this.authService.getRole();
    this.isCentralAdmin = userRole === 'CENTRAL_ADMIN';
    this.permissionService.refreshPermissions(); 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // New method to handle calendar navigation
  navigateToCalendar() {
    if (this.permissionService.hasPermission('ADD_CALENDAR')) {
      this.router.navigate(['/admin/calendar']); 
    } else if (this.permissionService.hasPermission('VIEW_CALENDAR')) {
      this.router.navigate(['/admin/view-calendar']); 
     } 
    // else {

    //   console.warn('User lacks calendar permissions');
    //   this.router.navigate(['/admin/access-denied']); 
    // }
  }
}