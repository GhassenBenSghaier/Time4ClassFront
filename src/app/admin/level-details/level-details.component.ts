import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/crud.service';
import { Level, School } from 'src/app/Models/timetable.model';

@Component({
  selector: 'app-level-details',
  templateUrl: './level-details.component.html',
  styleUrls: ['./level-details.component.css']
})
export class LevelDetailsComponent implements OnInit {
  level: Level | null = null;
  school: School | null = null;
  errorMessage: string | null = null;

  constructor(
    private crudService: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.crudService.getLevelById(id).subscribe({
      next: (level) => {
        this.level = level;
      },
      error: (error) => {
        this.errorMessage = `Failed to load level details: ${error.message || 'Unknown error'}`;
      }
    });
  }

  loadSchool(schoolId: number): void {
    this.crudService.getSchoolById(schoolId).subscribe({
      next: (school) => {
        this.school = school;
      },
      error: (error) => {
        this.errorMessage = `Failed to load school details: ${error.message || 'Unknown error'}`;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/levels-list']);
  }
}