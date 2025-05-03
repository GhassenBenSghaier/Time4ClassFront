import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from 'src/app/crud.service';
import { SubjectDTO } from 'src/app/Models/timetable.model';
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-subject-list',
  templateUrl: './subject-list.component.html',
  styleUrls: ['./subject-list.component.css']
})
export class SubjectListComponent implements OnInit {
  subjects: SubjectDTO[] = [];
  filteredSubjects: SubjectDTO[] = [];
  searchForm: FormGroup;
  subjectForm: FormGroup;
  showSearch: boolean = false;
  showSubjectForm: boolean = false;
  isEditMode: boolean = false;
  selectedSubject: SubjectDTO | null = null;
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
      roomType: ['']
    });
    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      // defaultHoursPerWeek: ['', [Validators.required, Validators.min(0)]],
      roomType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
    this.searchForm.valueChanges.subscribe(() => this.filterSubjects());

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/subjects-list'))
      .subscribe(() => this.loadSubjects());
  }

  loadSubjects(): void {
    this.crudService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.filterSubjects();
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching subjects: ' + (err.error?.error || err.message))
    });
  }

  filterSubjects(): void {
    const formValue = this.searchForm.value;
    this.filteredSubjects = this.subjects.filter(subject => {
      return (
        (!formValue.name || subject.name.toLowerCase().includes(formValue.name.toLowerCase())) &&
        (!formValue.roomType || subject.roomType?.toLowerCase().includes(formValue.roomType.toLowerCase()))
      );
    });
    this.totalPages = Math.ceil(this.filteredSubjects.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.cdr.detectChanges();
  }

  getPaginatedSubjects(): SubjectDTO[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredSubjects.slice(startIndex, startIndex + this.pageSize);
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

  toggleSubjectForm(subject?: SubjectDTO): void {
    this.showSubjectForm = !this.showSubjectForm;
    if (subject) {
      this.isEditMode = true;
      this.selectedSubject = subject;
      this.subjectForm.patchValue({
        name: subject.name,
        defaultHoursPerWeek: subject.defaultHoursPerWeek,
        roomType: subject.roomType
      });
    } else {
      this.isEditMode = false;
      this.selectedSubject = null;
      this.subjectForm.reset();
    }
    this.cdr.detectChanges();
  }

  onSubjectFormSubmit(): void {
    if (!this.subjectForm.valid) {
      this.showErrorModal('Required fields are missing');
      return;
    }

    const formValue = this.subjectForm.value;
    const subject: SubjectDTO = {
      id: this.isEditMode && this.selectedSubject ? this.selectedSubject.id : 0,
      name: formValue.name,
      defaultHoursPerWeek: +formValue.defaultHoursPerWeek,
      roomType: formValue.roomType
    };

    console.log('Submitting subject:', subject);

    if (this.isEditMode && this.selectedSubject) {
      this.crudService.updateSubject(subject.id, subject).subscribe({
        next: (updatedSubject) => {
          const index = this.subjects.findIndex(s => s.id === updatedSubject.id);
          if (index !== -1) this.subjects[index] = updatedSubject;
          this.filterSubjects();
          this.showSuccessModal('Subject updated successfully!');
          this.toggleSubjectForm();
        },
        error: (err) => this.showErrorModal('Error updating subject: ' + (err.error?.error || err.message))
      });
    } else {
      this.crudService.createSubject(subject).subscribe({
        next: (newSubject) => {
          this.subjects.push(newSubject);
          this.filterSubjects();
          this.showSuccessModal('Subject created successfully!');
          this.toggleSubjectForm();
        },
        error: (err) => {
          console.error('Create subject error:', err);
          this.showErrorModal('Error creating subject: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  viewDetails(subject: SubjectDTO): void {
    this.router.navigate([`/admin/subjects/details/${subject.id}`]);
  }

  editSubject(subject: SubjectDTO): void {
    this.toggleSubjectForm(subject);
  }

  deleteSubject(subject: SubjectDTO): void {
    this.selectedSubject = subject;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete ${subject.name}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean): void {
    if (confirmed && this.selectedSubject) {
      this.crudService.deleteSubject(this.selectedSubject.id).subscribe({
        next: () => {
          this.subjects = this.subjects.filter(s => s.id !== this.selectedSubject!.id);
          this.filterSubjects();
          this.showSuccessModal(`Subject ${this.selectedSubject!.name} deleted successfully!`);
          this.selectedSubject = null;
        },
        error: (err) => this.showErrorModal('Error deleting subject: ' + (err.error?.error || err.message))
      });
    } else {
      this.selectedSubject = null;
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
}