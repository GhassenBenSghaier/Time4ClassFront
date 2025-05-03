import { Component, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { new_TimetablesService, ScheduleDTO, TimetableVersionDTO, GenerateTimetableRequestDTO } from 'src/app/new-timetables-service.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-new-timetables',
  templateUrl: './new-timetables.component.html',
  styleUrls: ['./new-timetables.component.css']
})
export class NewTimetablesComponent {days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timeSlots: string[] = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'];
  displayedColumns: string[] = ['day', ...this.timeSlots];
  dataSources: { dataSource: MatTableDataSource<any>, className: string }[] = [];

  constructor(
    private timetablesService: new_TimetablesService,
    private cdr: ChangeDetectorRef
  ) {}

  generateSchedules(schoolId: number = 1, classIds: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    console.log('Generating timetables for school', schoolId, 'with classes', classIds);
    const request: GenerateTimetableRequestDTO = { schoolId, classIds };

    this.timetablesService.generateTimetable(request).subscribe(
      (data: TimetableVersionDTO) => {
        console.log('Timetable data received:', data);
        if (!data || !data.schedules || data.schedules.length === 0) {
          console.warn('No schedules received from backend.');
          return;
        }

        // Group schedules by class
        const schedulesByClass = this.groupSchedulesByClass(data.schedules);

        // Sort by specialty and assign class names
        const specialtyOrder = ['Technology', 'Math', 'Lettre'];
        this.dataSources = [];
        specialtyOrder.forEach(specialty => {
          const classesForSpecialty = schedulesByClass.filter(group => 
            group.schedules[0]?.classEntity.specialtyName === specialty
          );
          classesForSpecialty.forEach((group, index) => {
            const className = `Class: ${specialty} ${index + 1}`;
            const gridData = this.transformScheduleData(group.schedules);
            console.log(`Timetable for ${className} grid data:`, gridData);
            this.dataSources.push({ dataSource: new MatTableDataSource<any>(gridData), className });
          });
        });

        console.log('Data sources:', this.dataSources);
        this.cdr.detectChanges();
      },
      (error: HttpErrorResponse) => {
        console.error('Error generating timetables:', error.message);
      },
      () => {
        console.log('Timetable generation completed.');
      }
    );
  }

  private groupSchedulesByClass(schedules: ScheduleDTO[]): { classId: number, schedules: ScheduleDTO[] }[] {
    const grouped: { [key: number]: ScheduleDTO[] } = {};
    schedules.forEach(schedule => {
      const classId = schedule.classEntity.id;
      if (!grouped[classId]) {
        grouped[classId] = [];
      }
      grouped[classId].push(schedule);
    });
    return Object.entries(grouped).map(([classId, schedules]) => ({
      classId: Number(classId),
      schedules
    }));
  }

  private transformScheduleData(schedules: ScheduleDTO[]): any[] {
    const scheduleMap: { [key: string]: ScheduleDTO[] } = {};
    schedules.forEach(schedule => {
      const timeSlotKey = `${schedule.timeSlot.startTime.slice(0, 5)} - ${schedule.timeSlot.endTime.slice(0, 5)}`; // e.g., "08:00 - 10:00"
      const key = `${schedule.timeSlot.day}-${timeSlotKey}`;
      if (!scheduleMap[key]) {
        scheduleMap[key] = [];
      }
      scheduleMap[key].push(schedule);
    });

    return this.days.map(day => {
      const row: any = { day };
      this.timeSlots.forEach(timeSlot => {
        const key = `${day}-${timeSlot}`;
        const schedulesForSlot = scheduleMap[key] || [];
        if (schedulesForSlot.length > 0) {
          row[timeSlot] = schedulesForSlot.map(s =>
            `${s.subject.name} (${s.classroom.name}, ${s.teacher.name})`
          ).join('\n');
        } else {
          row[timeSlot] = '';
        }
      });
      return row;
    });
  }
}
