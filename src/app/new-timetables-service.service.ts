import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces matching backend DTOs
export interface SchoolDTO {
  id: number;
  name: string;
  academicYear: string;
}

export interface ClassDTO {
  id: number;
  name: string;
  specialtyName: string;
  levelName: string;
  studentCount: number;
}

export interface SubjectDTO {
  id: number;
  name: string;
  defaultHoursPerWeek: number;
}

export interface TeacherDTO {
  id: number;
  name: string;
  maxHoursPerWeek: number;
  subjects: SubjectDTO[];
}

export interface ClassroomDTO {
  id: number;
  name: string;
  capacity: number;
  type: string;
}

export interface TimeSlotDTO {
  id: number;
  day: string;
  startTime: string; // e.g., "08:00:00"
  endTime: string;   // e.g., "10:00:00"
}

export interface ScheduleDTO {
  id: number | null;
  classEntity: ClassDTO;
  subject: SubjectDTO;
  teacher: TeacherDTO;
  classroom: ClassroomDTO;
  timeSlot: TimeSlotDTO;
}

export interface TimetableVersionDTO {
  id: number;
  school: SchoolDTO;
  versionNumber: number;
  status: string;
  generatedAt: string;
  createdBy: string;
  schedules: ScheduleDTO[];
}

export interface GenerateTimetableRequestDTO {
  schoolId: number;
  classIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class new_TimetablesService {
  // Update this URL to match your backend service port and Eureka setup
  private apiUrl = 'http://localhost:8083/api/v1/timetable/generate'; // Adjust port to 8083 as per application.yml

  constructor(private http: HttpClient) {}

  generateTimetable(request: GenerateTimetableRequestDTO): Observable<TimetableVersionDTO> {
    return this.http.post<TimetableVersionDTO>(this.apiUrl, request);
  }
}