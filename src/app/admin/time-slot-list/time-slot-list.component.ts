import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from 'src/app/crud.service';
import { AuthService } from 'src/app/auth.service';
import { TimeSlotDTO, School } from 'src/app/Models/timetable.model';
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-timeslot-list',
  templateUrl: './time-slot-list.component.html',
  styleUrls: ['./time-slot-list.component.css']
})
export class TimeSlotListComponent implements OnInit {
  timeSlots: TimeSlotDTO[] = [];
  filteredTimeSlots: TimeSlotDTO[] = [];
  schools: School[] = [];
  searchForm: FormGroup;
  timeSlotForm: FormGroup;
  showSearch: boolean = false;
  showTimeSlotForm: boolean = false;
  isEditMode: boolean = false;
  selectedTimeSlot: TimeSlotDTO | null = null;
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 0;
  isLocalAdmin: boolean = false;
  adminSchool: School | null = null;
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private crudService: CrudService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      day: [''],
      schoolId: ['']
    });
    this.timeSlotForm = this.fb.group({
      schoolId: ['', Validators.required],
      day: ['', Validators.required],
      startTime: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      endTime: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]]
    });
  }

  ngOnInit(): void {
    this.isLocalAdmin = this.authService.isLocalAdmin();
    this.loadSchools();
    this.loadTimeSlots();
    this.searchForm.valueChanges.subscribe(() => this.filterTimeSlots());
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && this.router.url === '/admin/timeslots-list'))
      .subscribe(() => this.loadTimeSlots());
  }

  loadTimeSlots(): void {
    this.crudService.getTimeSlots().subscribe({
      next: (timeSlots) => {
        this.timeSlots = this.isLocalAdmin && this.adminSchool
          ? timeSlots.filter(timeSlot => timeSlot.schoolId === this.adminSchool!.id)
          : timeSlots;
        this.filterTimeSlots();
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching time slots: ' + err.message)
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
                  this.timeSlotForm.patchValue({ schoolId: matchedSchool.id });
                  this.searchForm.patchValue({ schoolId: matchedSchool.id });
                  this.filterTimeSlots();
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
          this.timeSlotForm.patchValue({ schoolId: this.schools[0].id });
        }
        this.cdr.detectChanges();
      },
      error: (err) => this.showErrorModal('Error fetching schools: ' + err.message)
    });
  }

  filterTimeSlots(): void {
    const formValue = this.searchForm.value;
    this.filteredTimeSlots = this.timeSlots.filter(timeSlot => {
      const matchesDay = !formValue.day || timeSlot.day.toLowerCase().includes(formValue.day.toLowerCase());
      const matchesSchool = this.isLocalAdmin && this.adminSchool
        ? timeSlot.schoolId === this.adminSchool.id
        : !formValue.schoolId || timeSlot.schoolId === +formValue.schoolId;
      return matchesDay && matchesSchool;
    });
    this.totalPages = Math.ceil(this.filteredTimeSlots.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.cdr.detectChanges();
  }

  getPaginatedTimeSlots(): TimeSlotDTO[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredTimeSlots.slice(startIndex, startIndex + this.pageSize);
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
      this.searchForm.reset({ day: '', schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : '' });
      this.filterTimeSlots();
    }
    this.cdr.detectChanges();
  }

  toggleTimeSlotForm(timeSlot?: TimeSlotDTO): void {
    if (!this.schools.length && !timeSlot && !this.isLocalAdmin) {
      this.showErrorModal('No schools available. Please create a school first.');
      return;
    }
    if (this.isLocalAdmin && !this.adminSchool) {
      this.showErrorModal('No school assigned to this Local Admin.');
      return;
    }
    this.showTimeSlotForm = !this.showTimeSlotForm;
    if (timeSlot) {
      this.isEditMode = true;
      this.selectedTimeSlot = timeSlot;
      this.timeSlotForm.patchValue({
        schoolId: timeSlot.schoolId,
        day: timeSlot.day,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime
      });
    } else {
      this.isEditMode = false;
      this.selectedTimeSlot = null;
      this.timeSlotForm.reset();
      this.timeSlotForm.patchValue({
        schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : this.schools[0]?.id || '',
        day: '',
        startTime: '',
        endTime: ''
      });
    }
    this.cdr.detectChanges();
  }

  onTimeSlotFormSubmit(): void {
    if (!this.timeSlotForm.valid) {
      this.showErrorModal('Required fields are missing or invalid');
      return;
    }

    const formValue = this.timeSlotForm.value;
    const timeSlot: TimeSlotDTO = {
      id: this.isEditMode && this.selectedTimeSlot ? this.selectedTimeSlot.id : 0,
      schoolId: this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : +formValue.schoolId,
      day: formValue.day,
      startTime: formValue.startTime,
      endTime: formValue.endTime
    };

    // Frontend overlap validation
    if (this.hasOverlap(timeSlot)) {
      this.showErrorModal('This time slot overlaps with an existing time slot for the same school and day');
      return;
    }

    console.log('Submitting time slot:', timeSlot);

    if (this.isEditMode && this.selectedTimeSlot) {
      this.crudService.updateTimeSlot(timeSlot.id, timeSlot).subscribe({
        next: (updatedTimeSlot) => {
          const index = this.timeSlots.findIndex(t => t.id === updatedTimeSlot.id);
          if (index !== -1) this.timeSlots[index] = updatedTimeSlot;
          this.filterTimeSlots();
          this.showSuccessModal('Time slot updated successfully!');
          this.toggleTimeSlotForm();
        },
        error: (err) => {
          const errorMessage = err.error || 'Error updating time slot';
          this.showErrorModal(errorMessage);
        }
      });
    } else {
      this.crudService.createTimeSlot(timeSlot).subscribe({
        next: (newTimeSlot) => {
          this.timeSlots.push(newTimeSlot);
          this.filterTimeSlots();
          this.showSuccessModal('Time slot created successfully!');
          this.toggleTimeSlotForm();
        },
        error: (err) => {
          const errorMessage = err.error || 'Error creating time slot';
          this.showErrorModal(errorMessage);
        }
      });
    }
  }

  viewDetails(timeSlot: TimeSlotDTO): void {
    this.router.navigate([`/admin/timeslots/details/${timeSlot.id}`]);
  }

  editTimeSlot(timeSlot: TimeSlotDTO): void {
    this.toggleTimeSlotForm(timeSlot);
  }

  deleteTimeSlot(timeSlot: TimeSlotDTO): void {
    this.selectedTimeSlot = timeSlot;
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = `Are you sure you want to delete the time slot for ${timeSlot.day} from ${timeSlot.startTime} to ${timeSlot.endTime}?`;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean): void {
    if (confirmed && this.selectedTimeSlot) {
      this.crudService.deleteTimeSlot(this.selectedTimeSlot.id).subscribe({
        next: () => {
          this.timeSlots = this.timeSlots.filter(t => t.id !== this.selectedTimeSlot!.id);
          this.filterTimeSlots();
          this.showSuccessModal(`Time slot deleted successfully!`);
          this.selectedTimeSlot = null;
        },
        error: (err) => this.showErrorModal('Error deleting time slot: ' + err.message)
      });
    } else {
      this.selectedTimeSlot = null;
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

  private hasOverlap(newTimeSlot: TimeSlotDTO): boolean {
    const newStart = this.parseTime(newTimeSlot.startTime);
    const newEnd = this.parseTime(newTimeSlot.endTime);
    const schoolId = newTimeSlot.schoolId;
    const day = newTimeSlot.day;

    return this.timeSlots.some(existing => {
      // Skip the time slot being updated
      if (this.isEditMode && this.selectedTimeSlot && existing.id === this.selectedTimeSlot.id) {
        return false;
      }

      // Check if same school and day
      if (existing.schoolId !== schoolId || existing.day !== day) {
        return false;
      }

      const existingStart = this.parseTime(existing.startTime);
      const existingEnd = this.parseTime(existing.endTime);

      // Check for overlap
      return !(newEnd <= existingStart || newStart >= existingEnd);
    });
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}