import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SchoolCalendar } from './Models/calendar.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
//  private apiUrl = 'http://localhost:9999/api/calendar';
  private apiUrl = 'http://192.168.157.131:30000/api/calendar';
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    console.log('Sending token in Authorization header:', token);
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  generateCalendar(calendar: SchoolCalendar): Observable<SchoolCalendar> {
    return this.http.post<SchoolCalendar>(`${this.apiUrl}/generate`, calendar, this.getHeaders());
  }

  getCalendarBySchoolYear(schoolYear: string): Observable<SchoolCalendar> {
    return this.http.get<SchoolCalendar>(`${this.apiUrl}/${schoolYear}`, this.getHeaders());
  }

  deleteCalendar(schoolYear: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${schoolYear}`, this.getHeaders());
  }

  // New method to fetch all school years
  getAllSchoolYears(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/years`, this.getHeaders());
  }
}