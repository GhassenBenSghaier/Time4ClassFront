import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../../calendar.service';
import { SchoolCalendar } from 'src/app/Models/calendar.model';

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
  selector: 'app-view-calendar',
  templateUrl: './view-calendar.component.html',
  styleUrls: ['./view-calendar.component.css']
})
export class ViewCalendarComponent implements OnInit {
  currentCalendar: SchoolCalendar | null = null;
  calendarRows: CalendarRow[] = [];
  currentSchoolYear: string = '';
  displayMode: 'year' | 'month' = 'year'; // Track display mode
  currentMonth: Date = new Date(); // Track current month for month view

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.loadCurrentCalendar();
  }

  loadCurrentCalendar() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    this.currentSchoolYear = currentDate.getMonth() < 7
      ? `${currentYear - 1}-${currentYear}`
      : `${currentYear}-${currentYear + 1}`;

    this.calendarService.getCalendarBySchoolYear(this.currentSchoolYear).subscribe({
      next: (calendar) => {
        this.currentCalendar = calendar;
        this.currentMonth = new Date(calendar.startDate); // Initialize currentMonth to calendar start
        this.generateCalendarRows(calendar);
      },
      error: (err) => {
        console.error('Error loading calendar:', err);
        if (err.status === 404) {
          alert(`No calendar found for school year ${this.currentSchoolYear}.`);
        } else {
          alert('Failed to load the calendar. Please try again later.');
        }
      }
    });
  }

  generateCalendarRows(calendar: SchoolCalendar) {
    const start = new Date(calendar.startDate);
    const rows: CalendarRow[] = [];

    if (this.displayMode === 'year') {
      // Year-based view
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

  // Methods to handle display mode switching and month navigation
  setDisplayMode(mode: 'year' | 'month') {
    this.displayMode = mode;
    if (mode === 'month' && this.currentCalendar) {
      this.currentMonth = new Date(this.currentCalendar.startDate);
    }
    if (this.currentCalendar) {
      this.generateCalendarRows(this.currentCalendar);
    }
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    if (this.currentCalendar) {
      this.generateCalendarRows(this.currentCalendar);
    }
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    if (this.currentCalendar) {
      this.generateCalendarRows(this.currentCalendar);
    }
  }
}