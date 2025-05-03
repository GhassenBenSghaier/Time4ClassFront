
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CalendarService } from '../../calendar.service';
import { SchoolCalendar, Holiday, ExamPeriod, Event, Milestone } from 'src/app/Models/calendar.model';
import * as bootstrap from 'bootstrap';

interface EnrichedDate {
  date: Date;
  dayName: string;
  isSunday: boolean;
  holiday: string | null;
  exam: string | null;
  event: string | null;
  milestone: string | null;
  isStartDay?: boolean;
  isEndDay?: boolean;
  isDivisionStart?: boolean;
}

interface MonthRow {
  isMonthRow: true;
  monthYear: string;
}

interface DayRow {
  isMonthRow: false;
  days: EnrichedDate[];
}

type CalendarRow = MonthRow | DayRow;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  calendarForm: FormGroup;
  generatedCalendar: SchoolCalendar | null = null;
  calendarRows: CalendarRow[] = [];
  selectedSchoolYear: string | null = null;
  previousSchoolYear: string | null = null;
  availableSchoolYears: string[] = [];
  schoolYearToDelete: string | null = null;
  displayMode: 'year' | 'month' = 'year'; // Track display mode
  currentMonth: Date = new Date(); // Track current month for month view

  constructor(private fb: FormBuilder, private calendarService: CalendarService) {
    this.calendarForm = this.fb.group({
      schoolYear: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      divisionType: ['', Validators.required],
      divisions: this.fb.array([]),
      holidays: this.fb.array([]),
      examPeriods: this.fb.array([]),
      events: this.fb.array([]),
      milestones: this.fb.array([])
    });

    this.calendarForm.get('startDate')?.valueChanges.subscribe(() => this.syncDivisionDates());
    this.calendarForm.get('endDate')?.valueChanges.subscribe(() => this.syncDivisionDates());
    this.calendarForm.get('divisionType')?.valueChanges.subscribe((type) => this.updateDivisions(type));
  }

  ngOnInit(): void {
    this.calendarForm.get('schoolYear')?.valueChanges.subscribe((schoolYear) => {
      if (schoolYear && schoolYear !== this.previousSchoolYear) {
        this.previousSchoolYear = schoolYear;
        this.checkSchoolYear(schoolYear);
      }
    });
    this.loadAvailableSchoolYears();
  }

  get holidays() { return this.calendarForm.get('holidays') as FormArray; }
  get examPeriods() { return this.calendarForm.get('examPeriods') as FormArray; }
  get events() { return this.calendarForm.get('events') as FormArray; }
  get milestones() { return this.calendarForm.get('milestones') as FormArray; }
  get divisions() { return this.calendarForm.get('divisions') as FormArray; }

  addHoliday(holiday?: Holiday) {
    this.holidays.push(this.fb.group({
      name: [holiday?.name || '', Validators.required],
      startDate: [holiday?.startDate || '', Validators.required],
      endDate: [holiday?.endDate || '', Validators.required]
    }));
  }

  addExamPeriod(examPeriod?: ExamPeriod) {
    this.examPeriods.push(this.fb.group({
      name: [examPeriod?.name || '', Validators.required],
      startDate: [examPeriod?.startDate || '', Validators.required],
      endDate: [examPeriod?.endDate || '', Validators.required]
    }));
  }

  addEvent(event?: Event) {
    this.events.push(this.fb.group({
      name: [event?.name || '', Validators.required],
      startDate: [event?.startDate || '', Validators.required],
      endDate: [event?.endDate || '', Validators.required],
      description: [event?.description || '']
    }));
  }

  addMilestone(milestone?: Milestone) {
    this.milestones.push(this.fb.group({
      name: [milestone?.name || '', Validators.required],
      date: [milestone?.date || '', Validators.required],
      description: [milestone?.description || '']
    }));
  }

  removeItem(array: FormArray, index: number) {
    array.removeAt(index);
    this.syncDivisionDates();
  }

  addDivision(startDate?: string, endDate?: string) {
    const division = this.fb.group({
      startDate: [startDate || '', Validators.required],
      endDate: [endDate || '', Validators.required]
    });
    this.divisions.push(division);
  }

  updateDivisions(type: string) {
    while (this.divisions.length) this.divisions.removeAt(0);
    if (type === 'semesters' || type === 'trimesters') {
      const count = type === 'semesters' ? 2 : 3;
      for (let i = 0; i < count; i++) {
        this.addDivision();
      }
      this.syncDivisionDates();
    }
  }

  syncDivisionDates() {
    const schoolYearStart = this.calendarForm.get('startDate')?.value;
    const schoolYearEnd = this.calendarForm.get('endDate')?.value;
    const divisionControls = this.divisions.controls;

    if (schoolYearStart && schoolYearEnd && divisionControls.length > 0) {
      divisionControls[0].patchValue({ startDate: schoolYearStart });
      divisionControls[divisionControls.length - 1].patchValue({ endDate: schoolYearEnd });
    }
  }

  checkSchoolYear(schoolYear: string) {
    this.calendarService.getCalendarBySchoolYear(schoolYear).subscribe({
      next: (calendar) => {
        this.selectedSchoolYear = schoolYear;
        this.showConfirmModal(calendar);
      },
      error: (err) => {
        if (err.status === 404) {
          this.resetForm(schoolYear);
        } else {
          console.error('Error checking school year:', err);
          alert('Failed to check school year. Please try again.');
        }
      }
    });
  }

  showConfirmModal(calendar: SchoolCalendar) {
    const modalElement = document.getElementById('confirmLoadModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) {
        modalBody.textContent = `A calendar for ${this.selectedSchoolYear} already exists. Do you want to load and edit it?`;
      }
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmLoad(confirmed: boolean) {
    if (confirmed && this.selectedSchoolYear) {
      this.loadCalendarData(this.selectedSchoolYear);
    } else {
      this.resetForm('');
    }
    this.selectedSchoolYear = null;
  }

  loadCalendarData(schoolYear: string) {
    this.calendarService.getCalendarBySchoolYear(schoolYear).subscribe({
      next: (calendar) => {
        this.calendarForm.patchValue({
          schoolYear: calendar.schoolYear,
          startDate: calendar.startDate,
          endDate: calendar.endDate,
          divisionType: calendar.divisionType || ''
        });

        while (this.divisions.length) this.divisions.removeAt(0);
        const divisions = calendar.divisions || [];
        divisions.forEach(div => this.addDivision(div.startDate, div.endDate));

        while (this.holidays.length) this.holidays.removeAt(0);
        while (this.examPeriods.length) this.examPeriods.removeAt(0);
        while (this.events.length) this.events.removeAt(0);
        while (this.milestones.length) this.milestones.removeAt(0);

        calendar.holidays?.forEach(holiday => this.addHoliday(holiday));
        calendar.examPeriods?.forEach(exam => this.addExamPeriod(exam));
        calendar.events?.forEach(event => this.addEvent(event));
        calendar.milestones?.forEach(milestone => this.addMilestone(milestone));

        this.generatedCalendar = calendar;
        this.generateCalendarRows(calendar);
      },
      error: (err) => {
        console.error('Error loading calendar:', err);
        alert('Failed to load calendar data. Please try again.');
      }
    });
  }

  resetForm(schoolYear: string) {
    this.calendarForm.reset({
      schoolYear,
      divisionType: ''
    });
    while (this.holidays.length) this.holidays.removeAt(0);
    while (this.examPeriods.length) this.examPeriods.removeAt(0);
    while (this.events.length) this.events.removeAt(0);
    while (this.milestones.length) this.milestones.removeAt(0);
    while (this.divisions.length) this.divisions.removeAt(0);
    this.generatedCalendar = null;
    this.calendarRows = [];
  }

  onSubmit() {
    if (this.calendarForm.valid) {
      const calendarData: SchoolCalendar = {
        ...this.calendarForm.value,
        divisions: this.divisions.value
      };
      console.log('Submitting calendar data:', calendarData);
      this.calendarService.generateCalendar(calendarData).subscribe({
        next: (result) => {
          this.generatedCalendar = result;
          console.log('Generated calendar:', this.generatedCalendar);
          this.generateCalendarRows(result);
          this.loadAvailableSchoolYears();
          alert('Calendar saved successfully!');
        },
        error: (err) => {
          console.error('Error generating/updating calendar:', err);
          alert('Failed to generate/update calendar. Please try again.');
        }
      });
    } else {
      console.log('Form invalid:', this.calendarForm.errors);
    }
  }

  generateCalendarRows(calendar: SchoolCalendar) {
    const start = new Date(calendar.startDate);
    const rows: CalendarRow[] = [];

    if (this.displayMode === 'year') {
      const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(start.getFullYear(), start.getMonth() + 12, 0);

      let currentDate = new Date(startMonth);
      let currentMonth = -1;

      while (currentDate <= endMonth) {
        const monthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        if (currentDate.getMonth() !== currentMonth) {
          rows.push({ isMonthRow: true, monthYear });
          currentMonth = currentDate.getMonth();
        }

        const allDays: EnrichedDate[] = [];
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        while (currentDate <= monthEnd) {
          const enriched = this.enrichDate(new Date(currentDate), calendar);
          const currentDateStr = currentDate.toDateString();

          if (currentDateStr === start.toDateString()) {
            enriched.isStartDay = true;
            enriched.event = enriched.event || 'School Year Start';
          }
          const end = new Date(calendar.endDate);
          if (currentDateStr === end.toDateString()) {
            enriched.isEndDay = true;
            enriched.event = enriched.event || 'School Year End';
          }

          if (calendar.divisions) {
            calendar.divisions.forEach((div, index) => {
              const divStartDate = new Date(div.startDate).toDateString();
              const divisionLabel = calendar.divisionType === 'semesters' ? 'Semester' : 'Trimester';

              if (currentDateStr === divStartDate) {
                enriched.isDivisionStart = true;
                enriched.event = enriched.event || `${divisionLabel} ${index + 1} Start`;
              }
            });
          }

          allDays.push(enriched);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        if (allDays.length > 0) {
          const firstRowDays = allDays.slice(0, 11);
          const secondRowDays = allDays.slice(11, 22);
          const thirdRowDays = allDays.slice(22);
          rows.push({ isMonthRow: false, days: firstRowDays });
          if (secondRowDays.length > 0) {
            rows.push({ isMonthRow: false, days: secondRowDays });
          }
          if (thirdRowDays.length > 0) {
            rows.push({ isMonthRow: false, days: thirdRowDays });
          }
        }
      }
    } else {
      // Month-based view
      const monthStart = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
      const monthEnd = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
      const monthYear = this.currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      rows.push({ isMonthRow: true, monthYear });

      let currentDate = new Date(monthStart);
      const allDays: EnrichedDate[] = [];

      while (currentDate <= monthEnd) {
        const enriched = this.enrichDate(new Date(currentDate), calendar);
        const currentDateStr = currentDate.toDateString();

        if (currentDateStr === start.toDateString()) {
          enriched.isStartDay = true;
          enriched.event = enriched.event || 'School Year Start';
        }
        const end = new Date(calendar.endDate);
        if (currentDateStr === end.toDateString()) {
          enriched.isEndDay = true;
          enriched.event = enriched.event || 'School Year End';
        }

        if (calendar.divisions) {
          calendar.divisions.forEach((div, index) => {
            const divStartDate = new Date(div.startDate).toDateString();
            const divisionLabel = calendar.divisionType === 'semesters' ? 'Semester' : 'Trimester';

            if (currentDateStr === divStartDate) {
              enriched.isDivisionStart = true;
              enriched.event = enriched.event || `${divisionLabel} ${index + 1} Start`;
            }
          });
        }

        allDays.push(enriched);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Split days into weeks
      const weeks: EnrichedDate[][] = [];
      let week: EnrichedDate[] = [];
      allDays.forEach((day, index) => {
        week.push(day);
        if (week.length === 7 || index === allDays.length - 1) {
          weeks.push(week);
          week = [];
        }
      });

      weeks.forEach(week => {
        rows.push({ isMonthRow: false, days: week });
      });
    }

    this.calendarRows = rows;
    console.log('Generated calendar rows:', this.calendarRows);
  }

  enrichDate(date: Date, calendar: SchoolCalendar): EnrichedDate {
    const dateStr = date.toLocaleDateString('en-CA');
    const dayName = date.toLocaleString('en-US', { weekday: 'short' });
    const isSunday = date.getDay() === 0;
    const holiday = calendar.holidays?.find(h => dateStr >= h.startDate && dateStr <= h.endDate);
    const exam = calendar.examPeriods?.find(e => dateStr >= e.startDate && dateStr <= e.endDate);
    const event = calendar.events?.find(e => dateStr >= e.startDate && dateStr <= e.endDate);
    const milestone = calendar.milestones?.find(m => dateStr === m.date);

    return {
      date,
      dayName,
      isSunday,
      holiday: holiday ? holiday.name : null,
      exam: exam ? exam.name : null,
      event: event ? event.name : null,
      milestone: milestone ? milestone.name : null
    };
  }

  loadAvailableSchoolYears() {
    this.calendarService.getAllSchoolYears().subscribe({
      next: (years) => {
        this.availableSchoolYears = years;
        console.log('Loaded school years:', this.availableSchoolYears);
      },
      error: (err) => {
        console.error('Error fetching school years:', err);
        this.availableSchoolYears = [];
        alert('Failed to load school years from the database.');
      }
    });
  }

  showDeleteConfirmModal(schoolYear: string) {
    this.schoolYearToDelete = schoolYear;
    const modalElement = document.getElementById('confirmDeleteModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) {
        modalBody.textContent = `Are you sure you want to delete the calendar for ${schoolYear}?`;
      }
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(confirmed: boolean) {
    if (confirmed && this.schoolYearToDelete) {
      this.calendarService.deleteCalendar(this.schoolYearToDelete).subscribe({
        next: () => {
          this.availableSchoolYears = this.availableSchoolYears.filter(year => year !== this.schoolYearToDelete);
          if (this.generatedCalendar?.schoolYear === this.schoolYearToDelete) {
            this.generatedCalendar = null;
            this.calendarRows = [];
          }
          this.schoolYearToDelete = null;
          alert('Calendar deleted successfully!');
          this.loadAvailableSchoolYears();
        },
        error: (err) => {
          console.error('Error deleting calendar:', err);
          alert('Failed to delete calendar. Please try again.');
        }
      });
    } else {
      this.schoolYearToDelete = null;
    }
  }

  // Methods to handle display mode switching and month navigation
  setDisplayMode(mode: 'year' | 'month') {
    this.displayMode = mode;
    if (mode === 'month' && this.generatedCalendar) {
      this.currentMonth = new Date(this.generatedCalendar.startDate);
    }
    if (this.generatedCalendar) {
      this.generateCalendarRows(this.generatedCalendar);
    }
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    if (this.generatedCalendar) {
      this.generateCalendarRows(this.generatedCalendar);
    }
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    if (this.generatedCalendar) {
      this.generateCalendarRows(this.generatedCalendar);
    }
  }
}