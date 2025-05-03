import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TimetableProgramService {
//  private baseUrl = 'http://localhost:9999/api/new-timetable-service/api/v1/program';
  private baseUrl = 'http://192.168.157.131:30000/api/new-timetable-service/api/v1/program';


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

  getPrograms(): Observable<any[]> {
    console.log('Sending request to:', this.baseUrl);
    return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders() }).pipe(
        tap((response) => console.log('Programs response:', response)),
        catchError((error) => {
            console.error('Error fetching programs:', error);
            console.error('Status:', error.status, 'Message:', error.message);
            console.error('Response body:', JSON.stringify(error.error, null, 2));
            throw error;
        })
    );
}

  getProgramById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap((response) => console.log('Program by ID response:', response)),
      catchError((error) => {
        console.error('Error fetching program by ID:', error);
        throw error;
      })
    );
  }

  getProgramByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/by-name/${encodeURIComponent(name)}`, { headers: this.getHeaders() }).pipe(
      tap((response) => console.log('Program by name response:', response)),
      catchError((error) => {
        console.error('Error fetching program by name:', error);
        throw error;
      })
    );
  }

  createProgram(program: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, program, { headers: this.getHeaders() }).pipe(
      tap((response) => console.log('Create program response:', response)),
      catchError((error) => {
        console.error('Error creating program:', error);
        throw error;
      })
    );
  }

  updateProgram(program: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${program.id}`, program, { headers: this.getHeaders() }).pipe(
      tap((response) => console.log('Update program response:', response)),
      catchError((error) => {
        console.error('Error updating program:', error);
        throw error;
      })
    );
  }

  deleteProgram(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('Program deleted:', id)),
      catchError((error) => {
        console.error('Error deleting program:', error);
        throw error;
      })
    );
  }

  getLevels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/level`, { headers: this.getHeaders() }).pipe(
      tap((response) => console.log('Levels response:', response)),
      catchError((error) => {
        console.error('Error fetching levels:', error);
        throw error;
      })
    );
  }

  getSpecialties(levelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/specialty/${levelId}`, { headers: this.getHeaders() }).pipe(
      tap((response) => console.log('Specialties response:', response)),
      catchError((error) => {
        console.error('Error fetching specialties:', error);
        throw error;
      })
    );
  }

  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/subject`, { headers: this.getHeaders() }).pipe(
      tap((response) => console.log('Subjects response:', response)),
      catchError((error) => {
        console.error('Error fetching subjects:', error);
        throw error;
      })
    );
  }
}