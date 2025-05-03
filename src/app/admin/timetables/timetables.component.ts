// import { Component, ChangeDetectorRef } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
//  import { TimetablesService, Schedule } from 'src/app/timetables.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Component({
//   selector: 'app-timetables',
//   templateUrl: './timetables.component.html',
//   styleUrls: ['./timetables.component.css']
// })
// export class TimetablesComponent {
//   days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
//   timeSlots: string[] = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'];
//   displayedColumns: string[] = ['day', ...this.timeSlots];
//   dataSources: { dataSource: MatTableDataSource<any>, className: string }[] = [];

//   constructor(
//     private timetableservice: TimetablesService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   generateSchedules(numClasses: number = 12) {
//     console.log('Fetching schedules for', numClasses, 'classes...');
//     this.timetableservice.getSchedules(numClasses).subscribe(
//       (data) => {
//         console.log('Raw data received:', data);
//         if (!data || data.length === 0) {
//           console.warn('No timetables received from backend.');
//           return;
//         }

//         // Group and sort by specialty
//         const specialtyOrder = ['Technology', 'Math', 'Lettre']; // Desired order
//         const groupedBySpecialty: { [key: string]: Schedule[][] } = {
//           Technology: [],
//           Math: [],
//           Lettre: []
//         };

//         data.forEach(timetable => {
//           const specialty = timetable[0]?.schoolClass?.specialty || 'Unknown';
//           if (groupedBySpecialty[specialty]) {
//             groupedBySpecialty[specialty].push(timetable);
//           } else {
//             console.warn(`Unknown specialty: ${specialty} for timetable`, timetable);
//           }
//         });

//         // Flatten and sort dataSources by specialty order, numbering within each specialty
//         this.dataSources = [];
//         specialtyOrder.forEach(specialty => {
//           groupedBySpecialty[specialty].forEach((timetable, index) => {
//             const className = `Class: ${specialty} ${index + 1}`;
//             const gridData = this.transformScheduleData(timetable);
//             console.log(`Timetable for ${className} grid data:`, gridData);
//             this.dataSources.push({ dataSource: new MatTableDataSource<any>(gridData), className });
//           });
//         });

//         console.log('Data sources:', this.dataSources);
//         this.cdr.detectChanges();
//       },
//       (error: HttpErrorResponse) => {
//         console.error('Error fetching schedules:', error.message);
//       },
//       () => {
//         console.log('Schedule fetch completed.');
//       }
//     );
//   }

//   transformScheduleData(schedules: Schedule[]): any[] {
//     const scheduleMap: { [key: string]: Schedule[] } = {};
//     schedules.forEach(schedule => {
//       const key = `${schedule.day}-${schedule.timeSlot}`;
//       if (!scheduleMap[key]) {
//         scheduleMap[key] = [];
//       }
//       scheduleMap[key].push(schedule);
//     });

//     return this.days.map(day => {
//       const row: any = { day };
//       this.timeSlots.forEach(timeSlot => {
//         const key = `${day}-${timeSlot}`;
//         const schedulesForSlot = scheduleMap[key] || [];
//         if (schedulesForSlot.length > 0) {
//           row[timeSlot] = schedulesForSlot.map(s =>
//             `${s.subject?.name || 'N/A'} (${s.classroom?.name || s.classroom?.id || 'N/A'}, ${s.teacher?.name || 'N/A'})`
//           ).join('\n');
//         } else {
//           row[timeSlot] = '';
//         }
//       });
//       return row;
//     });
//   }
// }