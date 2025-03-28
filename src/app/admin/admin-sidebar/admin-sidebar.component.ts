import { Component, OnInit } from '@angular/core'; // Add OnInit
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit { 
  isCentralAdmin: boolean = false; // Flag to track if user is CENTRAL_ADMIN

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check the user's role on initialization
    const userRole = this.authService.getRole();
    this.isCentralAdmin = userRole === 'CENTRAL_ADMIN';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}