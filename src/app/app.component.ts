import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isAdminRoute: boolean = false;
  isLoginRoute: boolean = false;
  private routerSubscription: Subscription | undefined;

  constructor(private router: Router) {}

  ngOnInit() {
    // Log initial route
    console.log('Initial route:', this.router.url);

    // Subscribe to router events to detect route changes
    this.routerSubscription = this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects;
      console.log('Current route (urlAfterRedirects):', currentUrl);

      // Check if the current route is an admin route
      this.isAdminRoute = currentUrl.startsWith('/admin');
      // Check if the current route is the login route
      this.isLoginRoute = currentUrl === '/login' ;

      // Log the state of the flags for debugging
      console.log('isAdminRoute:', this.isAdminRoute);
      console.log('isLoginRoute:', this.isLoginRoute);
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}