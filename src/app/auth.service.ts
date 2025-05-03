import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { PermissionService } from './permission.service';
import { User } from './Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
//  private apiUrl = 'http://localhost:9999/api/auth/login';
  private apiUrl = 'http://192.168.157.131:30000/api/auth/login';

//  private userApiUrl = 'http://localhost:9999/api/admin/users';
  private userApiUrl = 'http://192.168.157.131:30000/api/admin/users';

  private tokenKey = 'authToken';

  constructor(private http: HttpClient, private permissionService: PermissionService) {}

  login(credentials: { username: string; password: string }): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('AuthService: Sending login request to:', this.apiUrl, 'with credentials:', credentials);
    return this.http.post(this.apiUrl, credentials, { headers, responseType: 'text' }).pipe(
      tap((token: string) => {
        console.log('AuthService: Received token:', token);
        localStorage.setItem(this.tokenKey, token);
        this.permissionService.refreshPermissions();
      }),
      catchError(error => {
        console.error('AuthService: Login error:', error);
        return throwError(() => new Error('Login failed: ' + (error.message || 'Unknown error')));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  extractUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);
      const username = payload.sub || null;
      console.log('AuthService: Extracted username:', username);
      return username;
    } catch (error) {
      console.error('AuthService: Error decoding token:', error);
      return null;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);
      const role = payload.role || null;
      console.log('AuthService: Extracted role:', role);
      return role;
    } catch (error) {
      console.error('AuthService: Error decoding token:', error);
      return null;
    }
  }

  getStatus(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);
      const status = payload.status || null;
      console.log('AuthService: Extracted status:', status);
      return status;
    } catch (error) {
      console.error('AuthService: Error decoding token:', error);
      return null;
    }
  }

  getCurrentUser(): Observable<User> {
    const username = this.extractUsername();
    if (!username) {
      return throwError(() => new Error('No user logged in'));
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get<User>(`${this.userApiUrl}/username/${username}`, { headers }).pipe(
      catchError(error => {
        console.error('AuthService: Failed to fetch current user:', error);
        return throwError(() => new Error('Failed to fetch user details: ' + (error.message || 'Unknown error')));
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isCentralAdmin(): boolean {
    return this.getRole() === 'CENTRAL_ADMIN';
  }

  isLocalAdmin(): boolean {
    return this.getRole() === 'LOCAL_ADMIN';
  }

  isAdmin(): boolean {
    const role = this.getRole();
    return role === 'CENTRAL_ADMIN' || role === 'LOCAL_ADMIN';
  }

  isTeacher(): boolean {
    return this.getRole() === 'TEACHER';
  }

  isStudent(): boolean {
    return this.getRole() === 'STUDENT';
  }

  logout(): void {
    console.log('AuthService: Logging out');
    localStorage.removeItem(this.tokenKey);
    this.permissionService.refreshPermissions();
  }

  getCurrentUserSchool(): Observable<string | null> {
    return this.getCurrentUser().pipe(
      map((user: User) => user.role === 'LOCAL_ADMIN' ? user.schoolNameLocalAdmin || null : null),
      catchError((error: any) => {
        console.error('AuthService: Failed to fetch current user school:', error);
        return of(null);
      })
    );
  }
}