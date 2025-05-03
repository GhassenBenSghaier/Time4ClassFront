import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/crud.service';
import { School } from 'src/app/Models/timetable.model';

@Component({
  selector: 'app-school-details',
  templateUrl: './school-details.component.html',
  styleUrls: ['./school-details.component.css']
})
export class SchoolDetailsComponent implements OnInit {
  school: School | null = null;
  errorMessage: string | null = null;

  constructor(
    private crudService: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.crudService.getSchoolById(id).subscribe({
      next: (school) => {
        this.school = school;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load school details: ' + error.message;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/schools-list']);
  }
}