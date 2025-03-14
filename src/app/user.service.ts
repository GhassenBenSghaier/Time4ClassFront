// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { AuthService } from './auth.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//   private apiUrl = 'http://localhost:9999/api/admin/users';

//   constructor(private http: HttpClient, private authService: AuthService) {}

//   private getHeaders() {
//     const token = this.authService.getToken();
//     return token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};
//   }

//   getUsers(): Observable<any[]> {
//     return this.http.get<any[]>(this.apiUrl, this.getHeaders()).pipe(
//       catchError(this.handleError<any[]>('getUsers', []))
//     );
//   }

//   addUser(user: any): Observable<any> {
//     return this.http.post<any>(this.apiUrl, user, this.getHeaders()).pipe(
//       catchError(this.handleError<any>('addUser', user))
//     );
//   }

//   deleteUser(id: number): Observable<any> {
//     return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
//       catchError(this.handleError<any>('deleteUser', null))
//     );
//   }

//   private handleError<T>(operation = 'operation', result?: T) {
//     return (error: any): Observable<T> => {
//       console.error(`${operation} failed:`, error);
//       return throwError(() => new Error(`${operation} failed: ${error.message}`));
//     };
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:9999/api/admin/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders()).pipe(
      catchError(this.handleError<any[]>('getUsers', []))
    );
  }

  addUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, user, this.getHeaders()).pipe(
      catchError(this.handleError<any>('addUser', user))
    );
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user, this.getHeaders()).pipe(
      catchError(this.handleError<any>('updateUser', user))
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
      catchError(this.handleError<any>('deleteUser', null))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }
}