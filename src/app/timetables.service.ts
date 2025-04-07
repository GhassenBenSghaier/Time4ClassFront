import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Schedule {
  id: number | null;
  teacher: { id?: number; name?: string } | null;
  classroom: { id?: number; name?: string } | null;
  subject: { id?: number; name?: string } | null;
  day: string;
  timeSlot: string;
  schoolClass: { id?: number; name?: string; specialty?: string } | null; // Added specialty
}

@Injectable({
  providedIn: 'root'
})
export class TimetablesService {
//  private apiUrl = 'http://localhost:9999/api/timetable-service/generate'; 
  private apiUrl = 'http://192.168.157.131:30000/api/timetable-service/generate';

  constructor(private http: HttpClient) {}

  getSchedules(numClasses: number = 12): Observable<Schedule[][]> { 
    return this.http.get<Schedule[][]>(`${this.apiUrl}?numClasses=${numClasses}`);
  }
}