import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { User } from './Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
//  private apiUrl = 'http://localhost:9999/api/admin/users';
  private apiUrl = 'http://api.time4class.com:30080/api/admin/users'; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    console.log('Sending token in Authorization header:', token); // Debug
    if (!token) {
      console.warn('No token found in localStorage');
    }
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, this.getHeaders()).pipe(
      catchError(this.handleError<User[]>('getUsers', []))
    );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
      catchError(this.handleError<User>('getUser'))
    );
  }

  addUser(user: User): Observable<User> {
    console.log('Adding user with payload:', user); // Debug
    return this.http.post<User>(this.apiUrl, user, this.getHeaders()).pipe(
      catchError(error => {
        console.error('addUser failed:', error);
        let errorMessage = 'Failed to add user';
        if (error.status === 403) {
          errorMessage = 'Access denied: Insufficient permissions';
        } else if (error.status === 400) {
          errorMessage = 'Invalid user data: ' + (error.error?.message || 'Check the form fields');
        } else {
          errorMessage = error.message || 'Server error';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateUser(id: number, user: User): Observable<User> {
    console.log('Sending update request for user ID:', id, 'with data:', user);
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, this.getHeaders()).pipe(
      catchError(this.handleError<User>('updateUser'))
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
      catchError(this.handleError<void>('deleteUser'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username/${username}`, this.getHeaders());
  }
}