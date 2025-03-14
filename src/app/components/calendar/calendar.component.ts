import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth', // Month view by default
    plugins: [dayGridPlugin, timeGridPlugin], // Enable month and week views
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay' // Switch between views
    },
    events: [
      
      { title: 'School Holiday', start: '2025-03-20', allDay: true },
      // Add more events (e.g., timetable or agenda items)
    ]
  };
}


