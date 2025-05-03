import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from 'src/app/crud.service';
import { AuthService } from 'src/app/auth.service'; // Import AuthService
import { ClassroomDTO, School } from 'src/app/Models/timetable.model';
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-classroom-list',
  templateUrl: './classroom-list.component.html',
  styleUrls: ['./classroom-list.component.css']
})
export class ClassroomListComponent implements OnInit {
  classrooms: ClassroomDTO[] = [];
  filteredClassrooms: ClassroomDTO[] = [];
  schools: School[] = [];
  searchForm: FormGroup;
  classroomForm: FormGroup;
  showSearch: boolean = false;
  showClassroomForm: boolean = false;
  isEditMode: boolean = false;
  selectedClassroom: ClassroomDTO | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  isLocalAdmin: boolean = false; // Track if user is LOCAL_ADMIN
  adminSchool: School | null = null; // Store LOCAL_ADMIN's school

  constructor(
    private crudService: CrudService,
    private authService: AuthService, // Inject AuthService
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      schoolId: [''],
      type: ['']
    });
    this.classroomForm = this.fb.group({
      schoolId: ['', Validators.required],
      name: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      type: ['']
    });
  }

  ngOnInit(): void {
    this.isLocalAdmin = this.authService.isLocalAdmin();
    this.loadSchools();
    this.loadClassrooms();
    this.searchForm.valueChanges.subscribe(() => this.filterClassrooms());
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/classrooms-list'))
      .subscribe(() => this.loadClassrooms());
  }

  loadClassrooms(): void {
    this.crudService.getClassrooms().subscribe({
      next: (classrooms) => {
        this.classrooms = this.isLocalAdmin && this.adminSchool
          ? classrooms.filter(classroom => classroom.schoolId === this.adminSchool!.id)
          : classrooms;
        this.filterClassrooms();
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching classrooms: ' + err.message)
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
                  this.classroomForm.patchValue({ schoolId: matchedSchool.id });
                  this.searchForm.patchValue({ schoolId: matchedSchool.id });
                  this.filterClassrooms();
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
          this.classroomForm.patchValue({ schoolId: this.schools[0].id });
        }
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching schools: ' + err.message)
    });
  }

  filterClassrooms(): void {
    const formValue = this.searchForm.value;
    this.filteredClassrooms = this.classrooms.filter(classroom => {
      const matchesName = !formValue.name || classroom.name.toLowerCase().includes(formValue.name.toLowerCase());
      const matchesSchool = this.isLocalAdmin && this.adminSchool
        ? classroom.schoolId === this.adminSchool.id
        : !formValue.schoolId || classroom.schoolId === +formValue.schoolId;
      const matchesType = !formValue.type || classroom.type?.toLowerCase().includes(formValue.type.toLowerCase());
      return matchesName && matchesSchool && matchesType;
    });
    this.totalPages = Math.ceil(this.filteredClassrooms.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.cdr.detectChanges();
  }

  getPaginatedClassrooms(): ClassroomDTO[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredClassrooms.slice(startIndex, startIndex + this.pageSize);
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
      this.searchForm.reset({ name: '', schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : '', type: '' });
      this.filterClassrooms();
    }
    this.cdr.detectChanges();
  }

  toggleClassroomForm(classroom?: ClassroomDTO): void {
    if (!this.schools.length && !classroom && !this.isLocalAdmin) {
      this.showErrorModal('No schools available. Please create a school first.');
      return;
    }
    if (this.isLocalAdmin && !this.adminSchool) {
      this.showErrorModal('No school assigned to this Local Admin.');
      return;
    }
    this.showClassroomForm = !this.showClassroomForm;
    if (classroom) {
      this.isEditMode = true;
      this.selectedClassroom = classroom;
      this.classroomForm.patchValue({
        schoolId: classroom.schoolId,
        name: classroom.name,
        capacity: classroom.capacity,
        type: classroom.type
      });
    } else {
      this.isEditMode = false;
      this.selectedClassroom = null;
      this.classroomForm.reset();
      this.classroomForm.patchValue({
        schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : this.schools[0]?.id || '',
        name: '',
        capacity: '',
        type: ''
      });
    }
    this.cdr.detectChanges();
  }

  onClassroomFormSubmit(): void {
    if (!this.classroomForm.valid) {
      this.showErrorModal('Required fields are missing');
      return;
    }

    const formValue = this.classroomForm.value;
    const classroom: ClassroomDTO = {
      id: this.isEditMode && this.selectedClassroom ? this.selectedClassroom.id : 0,
      schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : +formValue.schoolId,
      name: formValue.name,
      capacity: +formValue.capacity,
      type: formValue.type || null
    };

    console.log('Submitting classroom:', classroom);

    if (this.isEditMode && this.selectedClassroom) {
      this.crudService.updateClassroom(classroom.id, classroom).subscribe({
        next: (updatedClassroom) => {
          const index = this.classrooms.findIndex(c => c.id === updatedClassroom.id);
          if (index !== -1) this.classrooms[index] = updatedClassroom;
          this.filterClassrooms();
          this.showSuccessModal('Classroom updated successfully!');
          this.toggleClassroomForm();
        },
        error: (err) => this.showErrorModal('Error updating classroom: ' + err.message)
      });
    } else {
      this.crudService.createClassroom(classroom).subscribe({
        next: (newClassroom) => {
          this.classrooms.push(newClassroom);
          this.filterClassrooms();
          this.showSuccessModal('Classroom created successfully!');
          this.toggleClassroomForm();
        },
        error: (err) => {
          console.error('Create classroom error:', err);
          this.showErrorModal('Error creating classroom: ' + err.message);
        }
      });
    }
  }

  viewDetails(classroom: ClassroomDTO): void {
    this.router.navigate([`/admin/classrooms/details/${classroom.id}`]);
  }

  editClassroom(classroom: ClassroomDTO): void {
    this.toggleClassroomForm(classroom);
  }

  deleteClassroom(classroom: ClassroomDTO): void {
    this.selectedClassroom = classroom;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete ${classroom.name}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean): void {
    if (confirmed && this.selectedClassroom) {
      this.crudService.deleteClassroom(this.selectedClassroom.id).subscribe({
        next: () => {
          this.classrooms = this.classrooms.filter(c => c.id !== this.selectedClassroom!.id);
          this.filterClassrooms();
          this.showSuccessModal(`Classroom ${this.selectedClassroom!.name} deleted successfully!`);
          this.selectedClassroom = null;
        },
        error: (err) => this.showErrorModal('Error deleting classroom: ' + err.message)
      });
    } else {
      this.selectedClassroom = null;
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
}