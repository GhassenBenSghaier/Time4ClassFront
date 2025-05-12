import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { CapacityRequest, CapacityResponse, GenerateTimetableRequest, TimetableDTO, School, Program, Subject } from './Models/timetable.model';

@Injectable({
  providedIn: 'root'
})
export class TimetablesService {
//  private baseUrl = 'http://localhost:9999/api/new-timetable-service/api/v1/timetable';
   private baseUrl = 'http://192.168.157.131:30000/api/new-timetable-service/api/v1/timetable';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getSchools(): Observable<School[]> {
    return this.http.get<School[]>(`${this.baseUrl}/schools`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getPrograms(schoolId: number): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.baseUrl}/programs?schoolId=${schoolId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  checkCapacity(request: CapacityRequest): Observable<CapacityResponse> {
    return this.http.post<CapacityResponse>(`${this.baseUrl}/capacity`, request, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  generateTimetable(request: GenerateTimetableRequest): Observable<TimetableDTO> {
    return this.http.post<TimetableDTO>(`${this.baseUrl}/generate`, request, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTimetableBySchool(schoolId: number, status: string = 'Draft'): Observable<TimetableDTO | null> {
    return this.http.get<TimetableDTO>(`${this.baseUrl}/school/${schoolId}?status=${status}`, { headers: this.getHeaders() })
      .pipe(
        map((response) => response), // Return the timetable if found
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            // Throw a custom error to indicate no timetable exists
            return throwError(() => new Error('NO_TIMETABLE_FOUND'));
          }
          // Handle other errors using the existing handleError method
          return this.handleError(error);
        })
      );
  }

  deleteTimetableData(schoolId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/school/${schoolId}`, { headers: this.getHeaders(), responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status}, ${error.error?.message || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}