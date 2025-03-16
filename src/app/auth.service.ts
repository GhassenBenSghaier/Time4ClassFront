// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { tap, catchError, throwError } from 'rxjs';

// @Injectable({
//     providedIn: 'root'
// })
// export class AuthService {
//     private apiUrl = 'http://localhost:9999/api/auth/login';
//     private tokenKey = 'authToken';

//     constructor(private http: HttpClient) {}

//     login(credentials: { username: string; password: string }): Observable<string> {
//         const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//         console.log('AuthService: Sending login request to:', this.apiUrl);
//         console.log('AuthService: Credentials:', credentials);
//         return this.http.post<string>(this.apiUrl, credentials, { headers, responseType: 'text' as 'json' }).pipe(
//             tap(token => {
//                 console.log('AuthService: Received token:', token);
//                 localStorage.setItem(this.tokenKey, token);
//                 console.log('AuthService: Token stored in localStorage:', localStorage.getItem(this.tokenKey));
//             }),
//             catchError(error => {
//                 console.error('AuthService: Login error:', {
//                     status: error.status,
//                     statusText: error.statusText,
//                     message: error.message,
//                     url: error.url
//                 });
//                 return throwError(() => new Error('Login failed: ' + (error.message || 'Unknown error')));
//             })
//         );
//     }

//     getToken(): string | null {
//         const token = localStorage.getItem(this.tokenKey);
//         console.log('AuthService: Retrieved token:', token);
//         return token;
//     }

//     getRole(): string | null {
//         const token = this.getToken();
//         if (token) {
//             try {
//                 const payload = JSON.parse(atob(token.split('.')[1]));
//                 console.log('AuthService: Decoded token payload:', payload);
//                 let role = payload.role || null;
//                 if (role && role.startsWith('ROLE_')) {
//                     role = role.replace('ROLE_', '');
//                 }
//                 console.log('AuthService: Extracted role:', role);
//                 return role;
//             } catch (error) {
//                 console.error('AuthService: Error decoding token:', error);
//                 return null;
//             }
//         }
//         console.log('AuthService: No token found for role extraction');
//         return null;
//     }

//     isAdmin(): boolean {
//         const role = this.getRole();
//         const isAdmin = role === 'ADMIN';
//         console.log('AuthService: Is user admin?', isAdmin, 'Role:', role);
//         return isAdmin;
//     }

//     isAuthenticated(): boolean {
//         const token = this.getToken();
//         const isAuthenticated = !!token;
//         console.log('AuthService: Is user authenticated?', isAuthenticated);
//         return isAuthenticated;
//     }

//     logout(): void {
//         console.log('AuthService: Logging out, removing token');
//         localStorage.removeItem(this.tokenKey);
//     }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
//  private apiUrl = 'http://localhost:9999/api/auth/login';
  private apiUrl = 'http://api.time4class.com:30080/api/auth/login';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('AuthService: Sending login request to:', this.apiUrl);
    console.log('AuthService: Credentials:', credentials);
    return this.http.post(this.apiUrl, credentials, { headers, responseType: 'text' }).pipe(
      tap((token: string) => {
        console.log('AuthService: Received token:', token);
        localStorage.setItem(this.tokenKey, token);
        console.log('AuthService: Token stored in localStorage:', localStorage.getItem(this.tokenKey));
      }),
      catchError(error => {
        console.error('AuthService: Login error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        return throwError(() => new Error('Login failed: ' + (error.message || 'Unknown error')));
      })
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('AuthService: Retrieved token:', token);
    return token;
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1]; // Get the payload part of the JWT
        const decodedPayload = atob(payloadBase64); // Decode Base64
        const payload = JSON.parse(decodedPayload); // Parse JSON
        console.log('AuthService: Decoded token payload:', payload);
        let role = payload.role || null;
        if (role && role.startsWith('ROLE_')) {
          role = role.replace('ROLE_', '');
        }
        console.log('AuthService: Extracted role:', role);
        return role;
      } catch (error) {
        console.error('AuthService: Error decoding token:', error);
        return null;
      }
    }
    console.log('AuthService: No token found for role extraction');
    return null;
  }

  isAdmin(): boolean {
    const role = this.getRole();
    const isAdmin = role === 'ADMIN';
    console.log('AuthService: Is user admin?', isAdmin, 'Role:', role);
    return isAdmin;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const isAuthenticated = !!token;
    console.log('AuthService: Is user authenticated?', isAuthenticated);
    return isAuthenticated;
  }

  logout(): void {
    console.log('AuthService: Logging out, removing token');
    localStorage.removeItem(this.tokenKey);
  }
}