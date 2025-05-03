import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/crud.service';
import { Specialty, Level } from 'src/app/Models/timetable.model';

@Component({
  selector: 'app-specialty-details',
  templateUrl: './specialty-details.component.html',
  styleUrls: ['./specialty-details.component.css']
})
export class SpecialtyDetailsComponent implements OnInit {
  specialty: Specialty | null = null;
  level: Level | null = null;
  errorMessage: string | null = null;

  constructor(
    private crudService: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.crudService.getSpecialtyById(id).subscribe({
      next: (specialty) => {
        this.specialty = specialty;
        this.loadLevel(specialty.levelId);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load specialty details: ' + (error.message || 'Unknown error');
      }
    });
  }

  loadLevel(levelId: number): void {
    this.crudService.getLevelById(levelId).subscribe({
      next: (level) => {
        this.level = level;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load level details: ' + (error.message || 'Unknown error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/specialties-list']);
  }
}