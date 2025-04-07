

// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { AuthService } from './auth.service';

// export interface Permission {
//   id: number;
//   name: string;
//   description: string;
// }

// export interface Profile {
//   id?: number;
//   code: string;
//   designation: string;
//   status: string;
//   permissions: Permission[];
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ProfileService {
//   private apiUrl = 'http://localhost:9999/api/admin/profiles';
//   private permissionsUrl = 'http://localhost:9999/api/admin/permissions';

//   constructor(private http: HttpClient, private authService: AuthService) {}

//   private getHeaders(): { headers: HttpHeaders } {
//     const token = this.authService.getToken();
//     return {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'Authorization': token ? `Bearer ${token}` : ''
//       })
//     };
//   }

//   createProfile(profile: Profile): Observable<Profile> {
//     return this.http.post<Profile>(this.apiUrl, profile, this.getHeaders()).pipe(
//       catchError(error => {
//         let errorMessage = 'Failed to create profile';
//         if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
//         else if (error.status === 400) errorMessage = error.error?.error || 'Invalid profile data';
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }

//   getProfile(id: number): Observable<Profile> {
//     return this.http.get<Profile>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
//       catchError(error => {
//         let errorMessage = 'Failed to fetch profile';
//         if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
//         else if (error.status === 404) errorMessage = 'Profile not found';
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }

//   updateProfile(profile: Profile): Observable<Profile> {
//     return this.http.put<Profile>(`${this.apiUrl}/${profile.id}`, profile, this.getHeaders()).pipe(
//       catchError(error => {
//         let errorMessage = 'Failed to update profile';
//         if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
//         else if (error.status === 400) errorMessage = error.error?.error || 'Invalid profile data';
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }

//   deleteProfile(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
//       catchError(error => {
//         let errorMessage = 'Failed to delete profile';
//         if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }

//   getAllProfiles(): Observable<Profile[]> {
//     return this.http.get<Profile[]>(this.apiUrl, this.getHeaders()).pipe(
//       catchError(error => {
//         let errorMessage = 'Failed to fetch profiles';
//         if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }

//   getAllPermissions(): Observable<Permission[]> {
//     return this.http.get<Permission[]>(this.permissionsUrl, this.getHeaders()).pipe(
//       catchError(error => {
//         let errorMessage = 'Failed to fetch permissions';
//         if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface Profile {
  id?: number;
  code: string;
  designation: string;
  status: string;
  permissions: Permission[]; // Already includes permissions
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
//  private apiUrl = 'http://localhost:9999/api/admin/profiles';


  private apiUrl = 'http://192.168.157.131:30000/api/admin/profiles';

//  private permissionsUrl = 'http://localhost:9999/api/admin/permissions';


  private permissionsUrl ='http://192.168.157.131:30000/api/admin/permissions';
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  createProfile(profile: Profile): Observable<Profile> {
    return this.http.post<Profile>(this.apiUrl, profile, this.getHeaders()).pipe(
      catchError(error => {
        let errorMessage = 'Failed to create profile';
        if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
        else if (error.status === 400) errorMessage = error.error?.error || 'Invalid profile data';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
      catchError(error => {
        let errorMessage = 'Failed to fetch profile';
        if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
        else if (error.status === 404) errorMessage = 'Profile not found';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/${profile.id}`, profile, this.getHeaders()).pipe(
      catchError(error => {
        let errorMessage = 'Failed to update profile';
        if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
        else if (error.status === 400) errorMessage = error.error?.error || 'Invalid profile data';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
      catchError(error => {
        let errorMessage = 'Failed to delete profile';
        if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAllProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl, this.getHeaders()).pipe(
      catchError(error => {
        let errorMessage = 'Failed to fetch profiles';
        if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.permissionsUrl, this.getHeaders()).pipe(
      catchError(error => {
        let errorMessage = 'Failed to fetch permissions';
        if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getProfileByCode(code: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/code/${code}`, this.getHeaders()).pipe(
      catchError(error => {
        let errorMessage = 'Failed to fetch profile by code';
        if (error.status === 403) errorMessage = 'Access denied: Insufficient permissions';
        else if (error.status === 404) errorMessage = 'Profile not found';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}