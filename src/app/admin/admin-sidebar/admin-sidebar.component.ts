import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';
import { PermissionService } from 'src/app/permission.service';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {
  isCentralAdmin: boolean = false;
  isNomenclatureOpen: boolean = false; // Track dropdown state

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

  navigateToCalendar() {
    if (this.permissionService.hasPermission('ADD_CALENDAR')) {
      this.router.navigate(['/admin/calendar']);
    } else if (this.permissionService.hasPermission('VIEW_CALENDAR')) {
      this.router.navigate(['/admin/view-calendar']);
    }
  }

  navigateToTimetables() {
    const userRole = this.authService.getRole();
    if (userRole === 'CENTRAL_ADMIN') {
      this.router.navigate(['/admin/programs']);
    } else if (userRole === 'LOCAL_ADMIN') {
      this.router.navigate(['/admin/timetable_manager']);
    }
  }

  toggleNomenclatureDropdown() {
    this.isNomenclatureOpen = !this.isNomenclatureOpen;
  }

  navigateToSchools() {
    this.router.navigate(['/admin/schools-list']);
    this.isNomenclatureOpen = false; // Close dropdown after navigation
  }

  navigateToLevels() {
    this.router.navigate(['/admin/levels-list']);
    this.isNomenclatureOpen = false;
  }

  navigateToSpecialties() {
    this.router.navigate(['/admin/specialties-list']);
    this.isNomenclatureOpen = false;
  }

  navigateToSubjects() {
    this.router.navigate(['/admin/subjects-list']);
    this.isNomenclatureOpen = false;
  }

  navigateToClassrooms() {
    this.router.navigate(['/admin/classrooms-list']);
    this.isNomenclatureOpen = false;
  }

  navigateToClasses() {
    this.router.navigate(['/admin/classes-list']);
    this.isNomenclatureOpen = false;
  }

  navigateToTimeSlots() {
    this.router.navigate(['/admin/timeslot-list']);
    this.isNomenclatureOpen = false;
  }
}