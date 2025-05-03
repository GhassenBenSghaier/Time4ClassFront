import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from 'src/app/crud.service';
import { School } from 'src/app/Models/timetable.model';
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-school-list',
  templateUrl: './school-list.component.html',
  styleUrls: ['./school-list.component.css']
})
export class SchoolListComponent implements OnInit {
  schools: School[] = [];
  filteredSchools: School[] = [];
  searchForm: FormGroup;
  schoolForm: FormGroup;
  showSearch: boolean = false;
  showSchoolForm: boolean = false;
  isEditMode: boolean = false;
  selectedSchool: School | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  constructor(
    private crudService: CrudService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      region: [''],
      type: ['']
    });
    this.schoolForm = this.fb.group({
      name: ['', Validators.required],
      // academicYear: ['', Validators.required],
      region: [''],
      type: ['']
    });
  }

  ngOnInit(): void {
    this.loadSchools();
    this.searchForm.valueChanges.subscribe(() => this.filterSchools());

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/schools-list'))
      .subscribe(() => this.loadSchools());
  }

  loadSchools(): void {
    this.crudService.getSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
        this.filterSchools();
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching schools: ' + err.message)
    });
  }

  filterSchools(): void {
    const formValue = this.searchForm.value;
    this.filteredSchools = this.schools.filter(school => {
      return (
        (!formValue.name || school.name.toLowerCase().includes(formValue.name.toLowerCase())) &&
        (!formValue.region || school.region?.toLowerCase().includes(formValue.region.toLowerCase())) &&
        (!formValue.type || school.type?.toLowerCase().includes(formValue.type.toLowerCase()))
      );
    });
    this.totalPages = Math.ceil(this.filteredSchools.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.cdr.detectChanges();
  }

  getPaginatedSchools(): School[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredSchools.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    this.cdr.detectChanges();
  }

  toggleSchoolForm(school?: School): void {
    this.showSchoolForm = !this.showSchoolForm;
    if (school) {
      this.isEditMode = true;
      this.selectedSchool = school;
      this.schoolForm.patchValue({
        name: school.name,
        region: school.region,
        type: school.type
      });
    } else {
      this.isEditMode = false;
      this.selectedSchool = null;
      this.schoolForm.reset();
    }
    this.cdr.detectChanges();
  }

  onSchoolFormSubmit(): void {
    if (!this.schoolForm.valid) {
      this.showErrorModal('Required fields are missing');
      return;
    }

    const school: School = this.schoolForm.value;
    if (this.isEditMode && this.selectedSchool) {
      school.id = this.selectedSchool.id;
      this.crudService.updateSchool(school.id, school).subscribe({
        next: (updatedSchool) => {
          const index = this.schools.findIndex(s => s.id === updatedSchool.id);
          if (index !== -1) this.schools[index] = updatedSchool;
          this.filterSchools();
          this.showSuccessModal('School updated successfully!');
          this.toggleSchoolForm();
        },
        error: (err) => this.showErrorModal('Error updating school: ' + err.message)
      });
    } else {
      this.crudService.createSchool(school).subscribe({
        next: (newSchool) => {
          this.schools.push(newSchool);
          this.filterSchools();
          this.showSuccessModal('School created successfully!');
          this.toggleSchoolForm();
        },
        error: (err) => this.showErrorModal('Error creating school: ' + err.message)
      });
    }
  }

  viewDetails(school: School): void {
    this.router.navigate([`/admin/schools/details/${school.id}`]);
  }

  editSchool(school: School): void {
    this.toggleSchoolForm(school);
  }

  deleteSchool(school: School): void {
    this.selectedSchool = school;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete ${school.name}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean): void {
    if (confirmed && this.selectedSchool) {
      this.crudService.deleteSchool(this.selectedSchool.id).subscribe({
        next: () => {
          this.schools = this.schools.filter(s => s.id !== this.selectedSchool!.id);
          this.filterSchools();
          this.showSuccessModal(`School ${this.selectedSchool!.name} deleted successfully!`);
          this.selectedSchool = null;
        },
        error: (err) => this.showErrorModal('Error deleting school: ' + err.message)
      });
    } else {
      this.selectedSchool = null;
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
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = message;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}