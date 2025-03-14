
import { Component, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TimetablesService, Schedule } from 'src/app/timetables.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-timetables',
  templateUrl: './timetables.component.html',
  styleUrls: ['./timetables.component.css']
})
export class TimetablesComponent {
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timeSlots: string[] = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'];
  displayedColumns: string[] = ['day', ...this.timeSlots];
  dataSources: MatTableDataSource<any>[] = [];

  constructor(
    private timetableservice: TimetablesService,
    private cdr: ChangeDetectorRef
  ) {}

  generateSchedules(numClasses: number = 10) {
    console.log('Fetching schedules for', numClasses, 'classes...');
    this.timetableservice.getSchedules(numClasses).subscribe(
      (data) => {
        console.log('Raw data received:', data);
        if (!data || data.length === 0) {
          console.warn('No timetables received from backend.');
          return;
        }
        this.dataSources = data.map((timetable, index) => {
          const gridData = this.transformScheduleData(timetable);
          console.log(`Timetable ${index + 1} grid data:`, gridData);
          return new MatTableDataSource<any>(gridData);
        });
        console.log('Data sources:', this.dataSources);
        this.cdr.detectChanges();
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching schedules:', error.message);
      },
      () => {
        console.log('Schedule fetch completed.');
      }
    );
  }

  transformScheduleData(schedules: Schedule[]): any[] {
    // Create a map to store all schedules by day and time slot
    const scheduleMap: { [key: string]: Schedule[] } = {};
    schedules.forEach(schedule => {
      const key = `${schedule.day}-${schedule.timeSlot}`;
      if (!scheduleMap[key]) {
        scheduleMap[key] = [];
      }
      scheduleMap[key].push(schedule);
    });

    // Create rows for each day, showing all schedules for each time slot
    return this.days.map(day => {
      const row: any = { day };
      this.timeSlots.forEach(timeSlot => {
        const key = `${day}-${timeSlot}`;
        const schedulesForSlot = scheduleMap[key] || [];
        if (schedulesForSlot.length > 0) {
          // Combine all schedules for this day-time slot into a single string or array
          row[timeSlot] = schedulesForSlot.map(s =>
            `${s.subject?.name || 'N/A'} (${s.classroom?.name || s.classroom?.id || 'N/A'}, ${s.teacher?.name || 'N/A'})`
          ).join('\n');
        } else {
          row[timeSlot] = '';
        }
      });
      return row;
    });
  }
}
