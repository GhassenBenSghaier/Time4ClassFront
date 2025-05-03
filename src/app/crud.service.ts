
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { School, Level, Specialty, SubjectDTO, ClassroomDTO, ClassDTO, Program, TimeSlotDTO } from './Models/timetable.model';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
//  private baseUrl = 'http://localhost:9999/api/new-timetable-service/api/v1';
  private baseUrl = 'http://192.168.157.131:30000/api/new-timetable-service/api/v1';
  

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('JWT Token:', token);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status}, ${error.error?.message || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // School CRUD Operations
  getSchools(): Observable<School[]> {
    console.log('Requesting schools from:', `${this.baseUrl}/schools`);
    return this.http.get<School[]>(`${this.baseUrl}/schools`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSchoolById(id: number): Observable<School> {
    console.log('Requesting school with id:', id, 'from:', `${this.baseUrl}/schools/${id}`);
    return this.http.get<School>(`${this.baseUrl}/schools/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createSchool(school: School): Observable<School> {
    console.log('Creating school with payload:', school, 'to:', `${this.baseUrl}/schools`);
    return this.http.post<School>(`${this.baseUrl}/schools`, school, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSchool(id: number, school: School): Observable<School> {
    console.log('Updating school with id:', id, 'payload:', school, 'to:', `${this.baseUrl}/schools/${id}`);
    return this.http.put<School>(`${this.baseUrl}/schools/${id}`, school, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteSchool(id: number): Observable<void> {
    console.log('Deleting school with id:', id, 'from:', `${this.baseUrl}/schools/${id}`);
    return this.http.delete<void>(`${this.baseUrl}/schools/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Level CRUD Operations
  getLevels(): Observable<Level[]> {
    console.log('Requesting levels from:', `${this.baseUrl}/levels`);
    return this.http.get<Level[]>(`${this.baseUrl}/levels`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getLevelById(id: number): Observable<Level> {
    console.log('Requesting level with id:', id, 'from:', `${this.baseUrl}/levels/${id}`);
    return this.http.get<Level>(`${this.baseUrl}/levels/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createLevel(level: Level): Observable<Level> {
    console.log('Creating level with payload:', level, 'to:', `${this.baseUrl}/levels`);
    return this.http.post<Level>(`${this.baseUrl}/levels`, level, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateLevel(id: number, level: Level): Observable<Level> {
    console.log('Updating level with id:', id, 'payload:', level, 'to:', `${this.baseUrl}/levels/${id}`);
    return this.http.put<Level>(`${this.baseUrl}/levels/${id}`, level, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteLevel(id: number): Observable<void> {
    console.log('Deleting level with id:', id, 'from:', `${this.baseUrl}/levels/${id}`);
    return this.http.delete<void>(`${this.baseUrl}/levels/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Specialty CRUD Operations
  getSpecialties(): Observable<Specialty[]> {
    console.log('Requesting specialties from:', `${this.baseUrl}/specialties`);
    return this.http.get<Specialty[]>(`${this.baseUrl}/specialties`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSpecialtyById(id: number): Observable<Specialty> {
    console.log('Requesting specialty with id:', id, 'from:', `${this.baseUrl}/specialties/${id}`);
    return this.http.get<Specialty>(`${this.baseUrl}/specialties/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createSpecialty(specialty: Specialty): Observable<Specialty> {
    console.log('Creating specialty with payload:', specialty, 'to:', `${this.baseUrl}/specialties`);
    return this.http.post<Specialty>(`${this.baseUrl}/specialties`, specialty, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSpecialty(id: number, specialty: Specialty): Observable<Specialty> {
    console.log('Updating specialty with id:', id, 'payload:', specialty, 'to:', `${this.baseUrl}/specialties/${id}`);
    return this.http.put<Specialty>(`${this.baseUrl}/specialties/${id}`, specialty, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteSpecialty(id: number): Observable<void> {
    console.log('Deleting specialty with id:', id, 'from:', `${this.baseUrl}/specialties/${id}`);
    return this.http.delete<void>(`${this.baseUrl}/specialties/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Subject CRUD Operations
  getSubjects(): Observable<SubjectDTO[]> {
    console.log('Requesting subjects from:', `${this.baseUrl}/subjects`);
    return this.http.get<SubjectDTO[]>(`${this.baseUrl}/subjects`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSubjectById(id: number): Observable<SubjectDTO> {
    console.log('Requesting subject with id:', id, 'from:', `${this.baseUrl}/subjects/${id}`);
    return this.http.get<SubjectDTO>(`${this.baseUrl}/subjects/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createSubject(subject: SubjectDTO): Observable<SubjectDTO> {
    console.log('Creating subject with payload:', subject, 'to:', `${this.baseUrl}/subjects`);
    return this.http.post<SubjectDTO>(`${this.baseUrl}/subjects`, subject, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSubject(id: number, subject: SubjectDTO): Observable<SubjectDTO> {
    console.log('Updating subject with id:', id, 'payload:', subject, 'to:', `${this.baseUrl}/subjects/${id}`);
    return this.http.put<SubjectDTO>(`${this.baseUrl}/subjects/${id}`, subject, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteSubject(id: number): Observable<void> {
    console.log('Deleting subject with id:', id, 'from:', `${this.baseUrl}/subjects/${id}`);
    return this.http.delete<void>(`${this.baseUrl}/subjects/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Classroom CRUD Operations
  getClassrooms(): Observable<ClassroomDTO[]> {
    console.log('Requesting classrooms from:', `${this.baseUrl}/classrooms`);
    return this.http.get<ClassroomDTO[]>(`${this.baseUrl}/classrooms`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getClassroomById(id: number): Observable<ClassroomDTO> {
    console.log('Requesting classroom with id:', id, 'from:', `${this.baseUrl}/classrooms/${id}`);
    return this.http.get<ClassroomDTO>(`${this.baseUrl}/classrooms/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createClassroom(classroom: ClassroomDTO): Observable<ClassroomDTO> {
    console.log('Creating classroom with payload:', classroom, 'to:', `${this.baseUrl}/classrooms`);
    return this.http.post<ClassroomDTO>(`${this.baseUrl}/classrooms`, classroom, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateClassroom(id: number, classroom: ClassroomDTO): Observable<ClassroomDTO> {
    console.log('Updating classroom with id:', id, 'payload:', classroom, 'to:', `${this.baseUrl}/classrooms/${id}`);
    return this.http.put<ClassroomDTO>(`${this.baseUrl}/classrooms/${id}`, classroom, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteClassroom(id: number): Observable<void> {
    console.log('Deleting classroom with id:', id, 'from:', `${this.baseUrl}/classrooms/${id}`);
    return this.http.delete<void>(`${this.baseUrl}/classrooms/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Class CRUD Operations
getClasses(): Observable<ClassDTO[]> {
  console.log('Requesting classes from:', `${this.baseUrl}/classes`);
  return this.http.get<ClassDTO[]>(`${this.baseUrl}/classes`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

getClassById(id: number): Observable<ClassDTO> {
  console.log('Requesting class with id:', id, 'from:', `${this.baseUrl}/classes/${id}`);
  return this.http.get<ClassDTO>(`${this.baseUrl}/classes/${id}`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

createClass(classEntity: ClassDTO): Observable<ClassDTO> {
  console.log('Creating class with payload:', classEntity, 'to:', `${this.baseUrl}/classes`);
  return this.http.post<ClassDTO>(`${this.baseUrl}/classes`, classEntity, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

updateClass(id: number, classEntity: ClassDTO): Observable<ClassDTO> {
  console.log('Updating class with id:', id, 'payload:', classEntity, 'to:', `${this.baseUrl}/classes/${id}`);
  return this.http.put<ClassDTO>(`${this.baseUrl}/classes/${id}`, classEntity, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

deleteClass(id: number): Observable<void> {
  console.log('Deleting class with id:', id, 'from:', `${this.baseUrl}/classes/${id}`);
  return this.http.delete<void>(`${this.baseUrl}/classes/${id}`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

  // TimeSlot CRUD Operations
  getTimeSlots(): Observable<TimeSlotDTO[]> {
    console.log('Requesting time slots from:', `${this.baseUrl}/timeslots`);
    return this.http.get<TimeSlotDTO[]>(`${this.baseUrl}/timeslots`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTimeSlotById(id: number): Observable<TimeSlotDTO> {
    console.log('Requesting time slot with id:', id, 'from:', `${this.baseUrl}/timeslots/${id}`);
    return this.http.get<TimeSlotDTO>(`${this.baseUrl}/timeslots/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createTimeSlot(timeSlot: TimeSlotDTO): Observable<TimeSlotDTO> {
    console.log('Creating time slot with payload:', timeSlot, 'to:', `${this.baseUrl}/timeslots`);
    return this.http.post<TimeSlotDTO>(`${this.baseUrl}/timeslots`, timeSlot, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateTimeSlot(id: number, timeSlot: TimeSlotDTO): Observable<TimeSlotDTO> {
    console.log('Updating time slot with id:', id, 'payload:', timeSlot, 'to:', `${this.baseUrl}/timeslots/${id}`);
    return this.http.put<TimeSlotDTO>(`${this.baseUrl}/timeslots/${id}`, timeSlot, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteTimeSlot(id: number): Observable<void> {
    console.log('Deleting time slot with id:', id, 'from:', `${this.baseUrl}/timeslots/${id}`);
    return this.http.delete<void>(`${this.baseUrl}/timeslots/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

getPrograms(): Observable<Program[]> {
  console.log('Requesting programs from:', `${this.baseUrl}/programs`);
  return this.http.get<Program[]>(`${this.baseUrl}/program`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

getProgramById(id: number): Observable<Program> {
  console.log('Requesting program with id:', id, 'from:', `${this.baseUrl}/programs/${id}`);
  return this.http.get<Program>(`${this.baseUrl}/program/${id}`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

getTeacherPrograms(teacherId: number): Observable<Program[]> {
  console.log('Requesting programs for teacher with id:', teacherId, 'from:', `${this.baseUrl}/teachers/${teacherId}/programs`);
  return this.http.get<Program[]>(`${this.baseUrl}/teachers/${teacherId}/programs`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

addProgramToTeacher(teacherId: number, programId: number): Observable<void> {
  console.log('Adding program with id:', programId, 'to teacher with id:', teacherId, 'to:', `${this.baseUrl}/teachers/${teacherId}/programs/${programId}`);
  return this.http.post<void>(`${this.baseUrl}/teachers/${teacherId}/programs/${programId}`, {}, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

removeProgramFromTeacher(teacherId: number, programId: number): Observable<void> {
  console.log('Removing program with id:', programId, 'from teacher with id:', teacherId, 'from:', `${this.baseUrl}/teachers/${teacherId}/programs/${programId}`);
  return this.http.delete<void>(`${this.baseUrl}/teachers/${teacherId}/programs/${programId}`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}

getClassesBySchool(schoolId: number): Observable<ClassDTO[]> {
  console.log('Requesting classes for school with id:', schoolId, 'from:', `${this.baseUrl}/classes/school/${schoolId}`);
  return this.http.get<ClassDTO[]>(`${this.baseUrl}/classes/school/${schoolId}`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
}
}