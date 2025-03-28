import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService, Profile, Permission } from 'src/app/profile.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {
  profile: Profile | null = null;
  errorMessage: string | null = null;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.profileService.getProfile(id).subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile details: ' + error.message;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/profiles-list']);
  }
}