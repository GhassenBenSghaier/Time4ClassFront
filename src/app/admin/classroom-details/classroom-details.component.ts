import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/crud.service';
import { ClassroomDTO, School } from 'src/app/Models/timetable.model';

@Component({
  selector: 'app-classroom-details',
  templateUrl: './classroom-details.component.html',
  styleUrls: ['./classroom-details.component.css']
})
export class ClassroomDetailsComponent implements OnInit {
  classroom: ClassroomDTO | null = null;
  school: School | null = null;
  errorMessage: string | null = null;

  constructor(
    private crudService: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.crudService.getClassroomById(id).subscribe({
      next: (classroom) => {
        this.classroom = classroom;
        this.crudService.getSchoolById(classroom.schoolId).subscribe({
          next: (school) => {
            this.school = school;
          },
          error: (error) => {
            this.errorMessage = 'Failed to load school details: ' + error.message;
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load classroom details: ' + error.message;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/classrooms-list']);
  }
}