import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimetableProgramService } from 'src/app/timetable-program.service';
import { Program } from 'src/app/Models/program.model';

@Component({
  selector: 'app-program-details',
  templateUrl: './program-details.component.html',
  styleUrls: ['./program-details.component.css']
})
export class ProgramDetailsComponent implements OnInit {
  program: Program | null = null;
  errorMessage: string | null = null;
  subjectsMap: { [key: number]: string } = {};

  constructor(
    private timetablesService: TimetableProgramService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    // Load subjects to map IDs to names
    this.timetablesService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjectsMap = subjects.reduce((map, subject) => {
          map[subject.id] = subject.name;
          return map;
        }, {} as { [key: number]: string });
        console.log('Subjects map:', this.subjectsMap);
        // Load program after subjects
        this.loadProgram(id);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load subjects: ' + error.message;
      }
    });
  }

  loadProgram(id: number) {
    this.timetablesService.getProgramById(id).subscribe({
      next: (program) => {
        this.program = program;
        console.log('Loaded program:', program);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load program details: ' + error.message;
      }
    });
  }

  getTotalHours(program: Program | null): number {
    if (!program || !program.programSubjects) return 0;

    // Sum hours for core subjects
    const coreHours = program.programSubjects
      .filter(subject => subject.isCore)
      .reduce((sum, subject) => sum + subject.hoursPerWeek, 0);

    // Find max hours for non-core subjects (include only one)
    const nonCoreSubjects = program.programSubjects.filter(subject => !subject.isCore);
    const maxNonCoreHours = nonCoreSubjects.length > 0
      ? Math.max(...nonCoreSubjects.map(subject => subject.hoursPerWeek))
      : 0;

    return coreHours + maxNonCoreHours;
  }

  goBack() {
    this.router.navigate(['/admin/programs']);
  }
}