import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/crud.service';
import { UserService } from 'src/app/user.service';
import { ClassDTO, School, ProgramDTO } from 'src/app/Models/timetable.model';
import { User } from 'src/app/Models/user.model';

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.component.html',
  styleUrls: ['./class-details.component.css']
})
export class ClassDetailsComponent implements OnInit {
  classEntity: ClassDTO | null = null;
  school: School | null = null;
  program: ProgramDTO | null = null;
  students: User[] = []; // Store students in this class
  errorMessage: string | null = null;

  constructor(
    private crudService: CrudService,
    private userService: UserService, // Add UserService
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.crudService.getClassById(id).subscribe({
      next: (classEntity) => {
        this.classEntity = classEntity;
        // Load school details
        this.crudService.getSchoolById(classEntity.schoolId).subscribe({
          next: (school) => {
            this.school = school;
            // Load students for this school
            this.loadStudents(school.name);
          },
          error: (error) => {
            this.errorMessage = 'Failed to load school details: ' + error.message;
          }
        });
        // Load program details
        this.crudService.getProgramById(classEntity.programId).subscribe({
          next: (program) => {
            this.program = program;
          },
          error: (error) => {
            this.errorMessage = 'Failed to load program details: ' + error.message;
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load class details: ' + error.message;
      }
    });
  }

  loadStudents(schoolName: string): void {
    this.userService.getUsersBySchool(schoolName).subscribe({
      next: (users) => {
        this.students = users.filter(user =>
          user.role === 'STUDENT' &&
          user.schoolNameStudent === schoolName &&
          user.schoolClass === this.classEntity?.name
        );
      },
      error: (error) => {
        this.errorMessage = 'Failed to load students: ' + error.message;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/classes-list']);
  }
}