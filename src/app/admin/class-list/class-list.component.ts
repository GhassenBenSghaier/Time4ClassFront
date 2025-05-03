import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from 'src/app/crud.service';
import { AuthService } from 'src/app/auth.service';
import { UserService } from 'src/app/user.service';
import { ClassDTO, School, ProgramDTO } from 'src/app/Models/timetable.model';
import { User } from 'src/app/Models/user.model';
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.css']
})
export class ClassListComponent implements OnInit {
  classes: ClassDTO[] = [];
  filteredClasses: ClassDTO[] = [];
  schools: School[] = [];
  programs: ProgramDTO[] = [];
  students: User[] = []; // Store students for counting
  searchForm: FormGroup;
  classForm: FormGroup;
  showSearch: boolean = false;
  showClassForm: boolean = false;
  isEditMode: boolean = false;
  selectedClass: ClassDTO | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  isLocalAdmin: boolean = false;
  adminSchool: School | null = null;

  constructor(
    private crudService: CrudService,
    private authService: AuthService,
    private userService: UserService, // Add UserService
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      schoolId: [''],
      programId: ['']
    });
    this.classForm = this.fb.group({
      schoolId: ['', Validators.required],
      programId: ['', Validators.required],
      name: ['', Validators.required],
      studentCount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.isLocalAdmin = this.authService.isLocalAdmin();
    this.loadSchools();
    this.loadPrograms();
    this.loadClasses();
    this.searchForm.valueChanges.subscribe(() => this.filterClasses());
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/classes-list'))
      .subscribe(() => this.loadClasses());
  }

  loadClasses(): void {
    this.crudService.getClasses().subscribe({
      next: (classes) => {
        this.classes = this.isLocalAdmin && this.adminSchool
          ? classes.filter(cls => cls.schoolId === this.adminSchool!.id)
          : classes;
        this.loadStudentsForClasses(); // Load students after classes
        this.filterClasses();
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching classes: ' + err.message)
    });
  }

  loadSchools(): void {
    this.crudService.getSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
        if (this.isLocalAdmin) {
          this.authService.getCurrentUserSchool().subscribe({
            next: (schoolName: string | null) => {
              if (schoolName) {
                const matchedSchool = this.schools.find(school => school.name === schoolName);
                if (matchedSchool) {
                  this.adminSchool = matchedSchool;
                  this.classForm.patchValue({ schoolId: matchedSchool.id });
                  this.searchForm.patchValue({ schoolId: matchedSchool.id });
                  this.loadStudentsForClasses(); // Load students for admin school
                  this.filterClasses();
                } else {
                  this.showErrorModal(`No school found matching '${schoolName}'. Please contact support.`);
                }
              } else {
                this.showErrorModal('No school assigned to this Local Admin. Please contact support.');
              }
              this.cdr.detectChanges();
            },
            error: (err) => this.showErrorModal('Failed to load admin school: ' + err.message)
          });
        } else if (this.schools.length > 0) {
          this.classForm.patchValue({ schoolId: this.schools[0].id });
        }
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching schools: ' + err.message)
    });
  }

  loadPrograms(): void {
    this.crudService.getPrograms().subscribe({
      next: (programs) => {
        this.programs = programs;
        if (this.programs.length > 0 && !this.isEditMode) {
          this.classForm.patchValue({ programId: this.programs[0].id });
        }
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching programs: ' + err.message)
    });
  }

  loadStudentsForClasses(): void {
    if (this.isLocalAdmin && this.adminSchool) {
      // Load students for the admin's school
      this.userService.getUsersBySchool(this.adminSchool.name).subscribe({
        next: (users) => {
          this.students = users.filter(user => user.role === 'STUDENT');
          this.updateStudentCounts();
          this.filterClasses();
          this.cdr.detectChanges();
        },
        error: (err) => this.showErrorModal('Error fetching students: ' + err.message)
      });
    } else {
      // Load students for all schools
      const schoolNames = [...new Set(this.classes.map(cls => this.getSchoolName(cls.schoolId)))];
      schoolNames.forEach(schoolName => {
        this.userService.getUsersBySchool(schoolName).subscribe({
          next: (users) => {
            this.students = [...this.students, ...users.filter(user => user.role === 'STUDENT')];
            this.updateStudentCounts();
            this.filterClasses();
            this.cdr.detectChanges();
          },
          error: (err) => this.showErrorModal(`Error fetching students for school ${schoolName}: ` + err.message)
        });
      });
    }
  }

  updateStudentCounts(): void {
    this.classes = this.classes.map(cls => {
      const schoolName = this.getSchoolName(cls.schoolId);
      const studentCount = this.students.filter(student =>
        student.role === 'STUDENT' &&
        student.schoolNameStudent === schoolName &&
        student.schoolClass === cls.name
      ).length;
      return { ...cls, actualStudentCount: studentCount };
    });
  }

  filterClasses(): void {
    const formValue = this.searchForm.value;
    this.filteredClasses = this.classes.filter(cls => {
      const matchesName = !formValue.name || cls.name.toLowerCase().includes(formValue.name.toLowerCase());
      const matchesSchool = this.isLocalAdmin && this.adminSchool
        ? cls.schoolId === this.adminSchool.id
        : !formValue.schoolId || cls.schoolId === +formValue.schoolId;
      const matchesProgram = !formValue.programId || cls.programId === +formValue.programId;
      return matchesName && matchesSchool && matchesProgram;
    });
    this.totalPages = Math.ceil(this.filteredClasses.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.cdr.detectChanges();
  }

  getPaginatedClasses(): ClassDTO[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredClasses.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchForm.reset({ 
        name: '', 
        schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : '', 
        programId: '' 
      });
      this.filterClasses();
    }
    this.cdr.detectChanges();
  }

  toggleClassForm(cls?: ClassDTO): void {
    if (!this.schools.length && !cls && !this.isLocalAdmin) {
      this.showErrorModal('No schools available. Please create a school first.');
      return;
    }
    if (!this.programs.length && !cls) {
      this.showErrorModal('No programs available. Please create a program first.');
      return;
    }
    if (this.isLocalAdmin && !this.adminSchool) {
      this.showErrorModal('No school assigned to this Local Admin.');
      return;
    }
    this.showClassForm = !this.showClassForm;
    if (cls) {
      this.isEditMode = true;
      this.selectedClass = cls;
      this.classForm.patchValue({
        schoolId: cls.schoolId,
        programId: cls.programId,
        name: cls.name,
        studentCount: cls.studentCount
      });
    } else {
      this.isEditMode = false;
      this.selectedClass = null;
      this.classForm.reset();
      this.classForm.patchValue({
        schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : this.schools[0]?.id || '',
        programId: this.programs[0]?.id || '',
        name: '',
        studentCount: ''
      });
    }
    this.cdr.detectChanges();
  }

  onClassFormSubmit(): void {
    if (!this.classForm.valid) {
      this.showErrorModal('Required fields are missing');
      return;
    }

    const formValue = this.classForm.value;
    const classEntity: ClassDTO = {
      id: this.isEditMode && this.selectedClass ? this.selectedClass.id : 0,
      schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : +formValue.schoolId,
      programId: +formValue.programId,
      name: formValue.name,
      studentCount: +formValue.studentCount
    };

    console.log('Submitting class:', classEntity);

    if (this.isEditMode && this.selectedClass) {
      this.crudService.updateClass(classEntity.id, classEntity).subscribe({
        next: (updatedClass) => {
          const index = this.classes.findIndex(c => c.id === updatedClass.id);
          if (index !== -1) this.classes[index] = updatedClass;
          this.loadStudentsForClasses(); // Refresh student counts
          this.showSuccessModal('Class updated successfully!');
          this.toggleClassForm();
        },
        error: (err) => this.showErrorModal('Error updating class: ' + err.message)
      });
    } else {
      this.crudService.createClass(classEntity).subscribe({
        next: (newClass) => {
          this.classes.push(newClass);
          this.loadStudentsForClasses(); // Refresh student counts
          this.showSuccessModal('Class created successfully!');
          this.toggleClassForm();
        },
        error: (err) => {
          console.error('Create class error:', err);
          this.showErrorModal('Error creating class: ' + err.message);
        }
      });
    }
  }

  viewDetails(cls: ClassDTO): void {
    this.router.navigate([`/admin/classes/details/${cls.id}`]);
  }

  editClass(cls: ClassDTO): void {
    this.toggleClassForm(cls);
  }

  deleteClass(cls: ClassDTO): void {
    this.selectedClass = cls;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete ${cls.name}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean): void {
    if (confirmed && this.selectedClass) {
      this.crudService.deleteClass(this.selectedClass.id).subscribe({
        next: () => {
          this.classes = this.classes.filter(c => c.id !== this.selectedClass!.id);
          this.loadStudentsForClasses(); // Refresh student counts
          this.showSuccessModal(`Class ${this.selectedClass!.name} deleted successfully!`);
          this.selectedClass = null;
        },
        error: (err) => this.showErrorModal('Error deleting class: ' + err.message)
      });
    } else {
      this.selectedClass = null;
    }
  }

  private showSuccessModal(message: string, callback?: () => void): void {
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = message;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      if (callback) {
        modalElement.addEventListener('hidden.bs.modal', callback, { once: true });
      }
    }
  }

  private showErrorModal(message: string): void {
    const modalElement = document.getElementById('errorModal');
    if (modalElement) {
      if (document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = message;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  getSchoolName(schoolId: number): string {
    return this.schools.find(s => s.id === schoolId)?.name || 'Unknown';
  }

  getProgramName(programId: number): string {
    return this.programs.find(p => p.id === programId)?.name || 'Unknown';
  }

  getActualStudentCount(cls: ClassDTO): number {
    return cls.actualStudentCount || 0;
  }
}