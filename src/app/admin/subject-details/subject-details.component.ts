import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/crud.service';
import { SubjectDTO } from 'src/app/Models/timetable.model';

@Component({
  selector: 'app-subject-details',
  templateUrl: './subject-details.component.html',
  styleUrls: ['./subject-details.component.css']
})
export class SubjectDetailsComponent implements OnInit {
  subject: SubjectDTO | null = null;
  errorMessage: string | null = null;

  constructor(
    private crudService: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.crudService.getSubjectById(id).subscribe({
      next: (subject) => {
        this.subject = subject;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load subject details: ' + (error.error?.error || error.message);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/subjects-list']);
  }
}