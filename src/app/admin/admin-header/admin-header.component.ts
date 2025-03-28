import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core'; // Add AfterViewInit, ElementRef
import { AuthService } from 'src/app/auth.service';
import { UserService } from 'src/app/user.service';
import { Router } from '@angular/router';
import { User } from 'src/app/Models/user.model';
import { jwtDecode } from 'jwt-decode';
import * as bootstrap from 'bootstrap'; // Import Bootstrap JS

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit, AfterViewInit { // Add AfterViewInit
  searchQuery: string = '';
  isSearchBarVisible: boolean = false;
  isMobileNavActive: boolean = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private elementRef: ElementRef // Inject ElementRef for DOM access
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  ngAfterViewInit() {
    // Manually initialize Bootstrap dropdowns after view is rendered
    const dropdownElements = this.elementRef.nativeElement.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach((element: HTMLElement) => {
      new bootstrap.Dropdown(element);
    });
  }

  loadCurrentUser() {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('Decoded token:', decoded);
        const username = decoded.sub;

        this.currentUser = {
          id: decoded.id || null,
          username: username,
          firstName: decoded.firstName || 'Unknown',
          lastName: decoded.lastName || 'User',
          role: decoded.role || 'Unknown',
          profileCode: decoded.profileCode || null,
          email: decoded.email || '',
          status: 'Active',
          password: '',
          birthdate: '',
          gender: '',
          address: '',
          phoneNumber: ''
        };

        if (!decoded.firstName || !decoded.lastName || !decoded.id) {
          this.userService.getUserByUsername(username).subscribe({
            next: (user) => {
              this.currentUser = user;
              console.log('Fetched user:', this.currentUser);
            },
            error: (error) => {
              console.error('Failed to fetch user by username:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error decoding JWT:', error);
        this.currentUser = null;
      }
    }
  }

  toggleSidebar() {
    document.body.classList.toggle('toggle-sidebar');
  }

  toggleSearchBar() {
    this.isSearchBarVisible = !this.isSearchBarVisible;
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      searchBar.classList.toggle('search-bar-show', this.isSearchBarVisible);
    }
  }

  toggleMobileNav() {
    this.isMobileNavActive = !this.isMobileNavActive;
    document.body.classList.toggle('mobile-nav-active', this.isMobileNavActive);
  }

  onSearch() {
    console.log('Search:', this.searchQuery);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile() {
    if (this.currentUser && this.currentUser.id) {
      this.router.navigate(['/admin/users/details', this.currentUser.id]);
    } else {
      console.warn('User ID not available for profile navigation');
    }
  }
}