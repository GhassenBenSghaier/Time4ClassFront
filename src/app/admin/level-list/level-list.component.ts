import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from 'src/app/crud.service';
import { Level, School } from 'src/app/Models/timetable.model';
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-level-list',
  templateUrl: './level-list.component.html',
  styleUrls: ['./level-list.component.css']
})
export class LevelListComponent implements OnInit {
  levels: Level[] = [];
  filteredLevels: Level[] = [];
  schools: School[] = [];
  searchForm: FormGroup;
  levelForm: FormGroup;
  showSearch: boolean = false;
  showLevelForm: boolean = false;
  isEditMode: boolean = false;
  selectedLevel: Level | null = null;
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
      // schoolId: ['']
    });
    this.levelForm = this.fb.group({
      name: ['', Validators.required],
      supportsSpecialty: [true]
      // schoolId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadSchools();
    this.loadLevels();
    this.searchForm.valueChanges.subscribe(() => this.filterLevels());

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/levels-list'))
      .subscribe(() => this.loadLevels());
  }

  loadSchools(): void {
    this.crudService.getSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal(`Error fetching schools: ${err.message || 'Server not reachable'}`)
    });
  }

  loadLevels(): void {
    this.crudService.getLevels().subscribe({
      next: (levels) => {
        this.levels = levels;
        this.filterLevels();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Load levels error:', err);
        this.showErrorModal(`Error fetching levels: ${err.message || 'Server not reachable'}`);
      }
    });
  }

  filterLevels(): void {
    const formValue = this.searchForm.value;
    this.filteredLevels = this.levels.filter(level => {
      return (
        (!formValue.name || level.name.toLowerCase().includes(formValue.name.toLowerCase()))
        // (!formValue.schoolId || level.schoolId === +formValue.schoolId)
      );
    });
    this.totalPages = Math.ceil(this.filteredLevels.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.cdr.detectChanges();
  }

  getPaginatedLevels(): Level[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredLevels.slice(startIndex, startIndex + this.pageSize);
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

  toggleLevelForm(level?: Level): void {
    this.showLevelForm = !this.showLevelForm;
    if (level) {
      this.isEditMode = true;
      this.selectedLevel = level;
      this.levelForm.patchValue({
        name: level.name,
        supportsSpecialty: level.supportsSpecialty
        // schoolId: level.schoolId
      });
    } else {
      this.isEditMode = false;
      this.selectedLevel = null;
      this.levelForm.reset({
        name: '',
        supportsSpecialty: true
        // schoolId: ''
      });
    }
    this.cdr.detectChanges();
  }

  onLevelFormSubmit(): void {
    if (!this.levelForm.valid) {
      this.showErrorModal('Required fields are missing');
      return;
    }

    const formValue = this.levelForm.value;
    const level: Level = {
      id: this.isEditMode && this.selectedLevel ? this.selectedLevel.id : undefined,
      name: formValue.name,
      supportsSpecialty: formValue.supportsSpecialty
      // schoolId: +formValue.schoolId
    };

    console.log('Submitting level:', level);

    if (this.isEditMode && this.selectedLevel) {
      this.crudService.updateLevel(level.id!, level).subscribe({
        next: (updatedLevel) => {
          const index = this.levels.findIndex(l => l.id === updatedLevel.id);
          if (index !== -1) this.levels[index] = updatedLevel;
          this.filterLevels();
          this.showSuccessModal('Level updated successfully!');
          this.toggleLevelForm();
        },
        error: (err) => this.showErrorModal(`Error updating level: ${err.message || 'Unknown error'}`)
      });
    } else {
      this.crudService.createLevel(level).subscribe({
        next: (newLevel) => {
          this.levels.push(newLevel);
          this.filterLevels();
          this.showSuccessModal('Level created successfully!');
          this.toggleLevelForm();
        },
        error: (err) => {
          console.error('Create level error:', err);
          this.showErrorModal(`Error creating level: ${err.message || 'Unknown error'}`);
        }
      });
    }
  }

  viewDetails(level: Level): void {
    this.router.navigate([`/admin/levels/details/${level.id}`]);
  }

  editLevel(level: Level): void {
    this.toggleLevelForm(level);
  }

  deleteLevel(level: Level): void {
    this.selectedLevel = level;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete ${level.name}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean): void {
    if (confirmed && this.selectedLevel) {
      this.crudService.deleteLevel(this.selectedLevel.id!).subscribe({
        next: () => {
          this.levels = this.levels.filter(l => l.id !== this.selectedLevel!.id);
          this.filterLevels();
          this.showSuccessModal(`Level ${this.selectedLevel!.name} deleted successfully!`);
          this.selectedLevel = null;
        },
        error: (err) => this.showErrorModal(`Error deleting level: ${err.message || 'Unknown error'}`)
      });
    } else {
      this.selectedLevel = null;
    }
  }

  getSchoolName(schoolId: number): string {
    const school = this.schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown';
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