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
  
    // Start from the first day of the start month
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    // End with the last day of the month 11 months later
    const endMonth = new Date(start.getFullYear(), start.getMonth() + 11, 0); // 0 = last day of previous month
  
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
  
      while (currentDate <= monthEnd) { // Stop at month end, not calendar end
        const enriched = this.enrichDate(new Date(currentDate), calendar);
        const currentDateStr = currentDate.toDateString();
  
        // Mark School Year Start and End (if within range)
        if (currentDateStr === start.toDateString()) {
          enriched.isStartDay = true;
          enriched.event = enriched.event || 'School Year Start';
        }
        const end = new Date(calendar.endDate);
        if (currentDateStr === end.toDateString()) {
          enriched.isEndDay = true;
          enriched.event = enriched.event || 'School Year End';
        }
  
        // Mark division start dates (if within range)
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
        const firstRowDays = allDays.slice(0, 11); // Up to 11 days
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
}