import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TimetableProgramService } from 'src/app/timetable-program.service';
import { Program } from 'src/app/Models/program.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-programs-list',
  templateUrl: './programs-list.component.html',
  styleUrls: ['./programs-list.component.css']
})
export class ProgramsListComponent implements OnInit {
  programs: Program[] = [];
  filteredPrograms: Program[] = [];
  searchForm: FormGroup;
  showSearch: boolean = false;
  showDeleted: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  selectedProgram: Program | null = null;

  constructor(
    private timetablesService: TimetableProgramService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      numSubjects: ['']
    });
  }

  ngOnInit() {
    this.loadPrograms();
    this.searchForm.valueChanges.subscribe(() => this.filterPrograms());
  }

  loadPrograms() {
    this.timetablesService.getPrograms().subscribe({
      next: (programs) => {
        console.log('Loaded programs from server:', programs);
        this.programs = programs as Program[];
        this.filterPrograms();
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Failed to load programs: ' + err.message)
    });
  }

  filterPrograms() {
    const formValue = this.searchForm.value;
    this.filteredPrograms = this.programs.filter(program => {
      const statusFilter = this.showDeleted ? program.status === 'Deleted' : program.status !== 'Deleted';
      const nameMatch = !formValue.name || program.name.toLowerCase().includes(formValue.name.toLowerCase());
      const numSubjectsMatch = !formValue.numSubjects || 
        program.programSubjects.length.toString() === formValue.numSubjects.toString();
      return statusFilter && nameMatch && numSubjectsMatch;
    });
    this.totalPages = Math.ceil(this.filteredPrograms.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    console.log('Filtered programs:', this.filteredPrograms);
    this.cdr.detectChanges();
  }

  getPaginatedPrograms(): Program[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredPrograms.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    this.cdr.detectChanges();
  }

  toggleDeleted() {
    this.showDeleted = !this.showDeleted;
    this.filterPrograms();
  }

  editProgram(program: Program) {
    this.selectedProgram = program;
    const modalElement = document.getElementById('editConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to edit ${program.name}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmEdit(confirmed: boolean) {
    if (confirmed && this.selectedProgram && this.selectedProgram.id) {
      this.router.navigate([`/admin/programs/edit/${this.selectedProgram.id}`]);
    }
    this.selectedProgram = null;
  }

  viewDetails(program: Program) {
    if (program.id) {
      this.router.navigate([`/admin/programs/details/${program.id}`]);
    }
  }

  deleteProgram(program: Program) {
    this.selectedProgram = program;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete ${program.name}? This action cannot be undone.`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean) {
    if (confirmed && this.selectedProgram && this.selectedProgram.id) {
      this.timetablesService.deleteProgram(this.selectedProgram.id).subscribe({
        next: () => {
          this.programs = this.programs.filter(p => p.id !== this.selectedProgram!.id);
          console.log('Programs after deletion:', this.programs);
          this.filterPrograms();
          this.showSuccessModal(`Program ${this.selectedProgram!.name} deleted successfully!`);
          this.selectedProgram = null;
        },
        error: (err) => this.showErrorModal('Failed to delete program: ' + err.message)
      });
    } else {
      this.selectedProgram = null;
    }
  }

  private showSuccessModal(message: string, callback?: () => void) {
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

  private showErrorModal(message: string) {
    const modalElement = document.getElementById('errorModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = message;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}