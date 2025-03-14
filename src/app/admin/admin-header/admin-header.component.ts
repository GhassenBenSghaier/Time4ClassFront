import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-header',
    templateUrl: './admin-header.component.html',
    styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {
    searchQuery: string = '';
    isSearchBarVisible: boolean = false;
    isMobileNavActive: boolean = false;

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
}