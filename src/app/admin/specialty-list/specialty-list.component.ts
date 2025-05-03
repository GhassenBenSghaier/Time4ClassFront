import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from 'src/app/crud.service';
import { Specialty, Level } from 'src/app/Models/timetable.model';
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-specialty-list',
  templateUrl: './specialty-list.component.html',
  styleUrls: ['./specialty-list.component.css']
})
export class SpecialtyListComponent implements OnInit {
  specialties: Specialty[] = [];
  filteredSpecialties: Specialty[] = [];
  levels: Level[] = [];
  specialtyLevels: Level[] = []; // Filtered levels where supportsSpecialty is true
  searchForm: FormGroup;
  specialtyForm: FormGroup;
  showSearch: boolean = false;
  showSpecialtyForm: boolean = false;
  isEditMode: boolean = false;
  selectedSpecialty: Specialty | null = null;
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
      levelId: ['']
    });
    this.specialtyForm = this.fb.group({
      name: ['', Validators.required],
      levelId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadLevels();
    this.loadSpecialties();
    this.searchForm.valueChanges.subscribe(() => this.filterSpecialties());

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/specialties-list'))
      .subscribe(() => this.loadSpecialties());
  }

  loadLevels(): void {
    this.crudService.getLevels().subscribe({
      next: (levels) => {
        this.levels = levels;
        this.specialtyLevels = levels.filter(level => level.supportsSpecialty); // Filter levels for specialty form and search
        console.log('All levels:', this.levels);
        console.log('Specialty-supporting levels:', this.specialtyLevels);
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching levels: ' + (err.message || 'Unknown error'))
    });
  }

  loadSpecialties(): void {
    this.crudService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties;
        this.filterSpecialties();
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching specialties: ' + (err.message || 'Unknown error'))
    });
  }

  filterSpecialties(): void {
    const formValue = this.searchForm.value;
    this.filteredSpecialties = this.specialties.filter(specialty => {
      const matchesName = !formValue.name || specialty.name.toLowerCase().includes(formValue.name.toLowerCase());
      const matchesLevel = !formValue.levelId || specialty.levelId === +formValue.levelId;
      return matchesName && matchesLevel;
    });
    this.totalPages = Math.ceil(this.filteredSpecialties.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.cdr.detectChanges();
  }

  getPaginatedSpecialties(): Specialty[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredSpecialties.slice(startIndex, startIndex + this.pageSize);
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
      this.searchForm.reset({ name: '', levelId: '' });
      this.filterSpecialties();
    }
    this.cdr.detectChanges();
  }

  toggleSpecialtyForm(specialty?: Specialty): void {
    if (!specialty && this.specialtyLevels.length === 0) {
      this.showErrorModal('No levels that support specialties are available. Please create a level with specialty support first.');
      return;
    }
    this.showSpecialtyForm = !this.showSpecialtyForm;
    if (specialty) {
      this.isEditMode = true;
      this.selectedSpecialty = specialty;
      this.specialtyForm.patchValue({
        name: specialty.name,
        levelId: specialty.levelId
      });
      // Ensure the current level is included in the dropdown for editing
      const currentLevel = this.levels.find(l => l.id === specialty.levelId);
      if (currentLevel && !this.specialtyLevels.some(l => l.id === currentLevel.id)) {
        this.specialtyLevels = [...this.specialtyLevels, currentLevel];
      }
    } else {
      this.isEditMode = false;
      this.selectedSpecialty = null;
      this.specialtyForm.reset();
      // Reset specialtyLevels to only include levels with supportsSpecialty: true
      this.specialtyLevels = this.levels.filter(level => level.supportsSpecialty);
    }
    this.cdr.detectChanges();
  }

  onSpecialtyFormSubmit(): void {
    if (!this.specialtyForm.valid) {
      this.showErrorModal('Required fields are missing');
      return;
    }

    const formValue = this.specialtyForm.value;
    const specialty: Specialty = {
      id: this.isEditMode && this.selectedSpecialty ? this.selectedSpecialty.id : undefined,
      name: formValue.name,
      levelId: +formValue.levelId
    };

    console.log('Submitting specialty:', specialty);

    if (this.isEditMode && this.selectedSpecialty) {
      this.crudService.updateSpecialty(specialty.id!, specialty).subscribe({
        next: (updatedSpecialty) => {
          const index = this.specialties.findIndex(s => s.id === updatedSpecialty.id);
          if (index !== -1) this.specialties[index] = updatedSpecialty;
          this.filterSpecialties();
          this.showSuccessModal('Specialty updated successfully!');
          this.toggleSpecialtyForm();
        },
        error: (err) => this.showErrorModal('Error updating specialty: ' + (err.message || 'Unknown error'))
      });
    } else {
      this.crudService.createSpecialty(specialty).subscribe({
        next: (newSpecialty) => {
          this.specialties.push(newSpecialty);
          this.filterSpecialties();
          this.showSuccessModal('Specialty created successfully!');
          this.toggleSpecialtyForm();
        },
        error: (err) => {
          console.error('Create specialty error:', err);
          this.showErrorModal('Error creating specialty: ' + (err.message || 'Unknown error'));
        }
      });
    }
  }

  viewDetails(specialty: Specialty): void {
    this.router.navigate([`/admin/specialties/details/${specialty.id}`]);
  }

  editSpecialty(specialty: Specialty): void {
    this.toggleSpecialtyForm(specialty);
  }

  deleteSpecialty(specialty: Specialty): void {
    this.selectedSpecialty = specialty;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete ${specialty.name}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean): void {
    if (confirmed && this.selectedSpecialty) {
      this.crudService.deleteSpecialty(this.selectedSpecialty.id!).subscribe({
        next: () => {
          this.specialties = this.specialties.filter(s => s.id !== this.selectedSpecialty!.id);
          this.filterSpecialties();
          this.showSuccessModal(`Specialty ${this.selectedSpecialty!.name} deleted successfully!`);
          this.selectedSpecialty = null;
        },
        error: (err) => this.showErrorModal('Error deleting specialty: ' + (err.message || 'Unknown error'))
      });
    } else {
      this.selectedSpecialty = null;
    }
  }

  getLevelName(levelId: number): string {
    const level = this.levels.find(l => l.id === levelId);
    return level ? level.name : 'Unknown';
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