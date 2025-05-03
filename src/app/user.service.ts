import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CrudService } from './crud.service';
import { User, UserResponse } from './Models/user.model';
import { SubjectDTO, School } from './Models/timetable.model';
import { TeacherResponseDTO } from './Models/user.model';
import { ProfileService } from './profile.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
//    private apiUrl = 'http://localhost:9999/api/admin/users';
    private apiUrl = 'http://192.168.157.131:30000/api/admin/users';

//    private timetableApiUrl = 'http://localhost:9999/api/new-timetable-service/api/v1/teachers';
    private timetableApiUrl = 'http://192.168.157.131:30000/api/new-timetable-service/api/v1/teachers';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private crudService: CrudService,
        private profileService: ProfileService
    ) {}

    private getHeaders(): { headers: HttpHeaders } {
        const token = this.authService.getToken();
        console.log('Sending token in Authorization header:', token ? 'Present' : 'Missing');
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            })
        };
    }

    addUser(user: User): Observable<User> {
        console.log('Adding user with payload:', user);

        // Ensure id is not sent
        const userToSend = { ...user, id: undefined };
        console.log('Sanitized user payload (id removed):', userToSend);

        if (userToSend.role === 'LOCAL_ADMIN') {
            return this.crudService.getSchools().pipe(
                switchMap(schools => {
                    const school = schools.find(s => s.name === userToSend.schoolNameLocalAdmin);
                    if (!school) {
                        return throwError(() => new Error(`School not found: ${userToSend.schoolNameLocalAdmin}`));
                    }
                    return this.http.post<UserResponse>(this.apiUrl, userToSend, this.getHeaders()).pipe(
                        map(userResponse => userResponse as User),
                        catchError(this.handleError('addUser'))
                    );
                }),
                catchError(this.handleError('addUser'))
            );
        }

        if (userToSend.role === 'TEACHER') {
            return this.crudService.getSubjects().pipe(
                switchMap(subjects => {
                    const subject = subjects.find(s => s.name === userToSend.subjectSpecialization);
                    if (!subject) {
                        return throwError(() => new Error(`Subject not found: ${userToSend.subjectSpecialization}`));
                    }

                    return this.crudService.getSchools().pipe(
                        switchMap(schools => {
                            const school = schools.find(s => s.name === userToSend.schoolNameTeacher);
                            if (!school) {
                                return throwError(() => new Error(`School not found: ${userToSend.schoolNameTeacher}`));
                            }

                            return this.http.post<UserResponse>(this.apiUrl, userToSend, this.getHeaders()).pipe(
                                switchMap(adminUser => {
                                    const teacherDTO = {
                                        id: adminUser.id,
                                        name: `${adminUser.firstName} ${adminUser.lastName}`,
                                        maxHoursPerWeek: 20,
                                        subjectId: subject.id,
                                        schoolId: school.id
                                    };
                                    console.log('Creating teacher in Timetable Service with payload:', teacherDTO);
                                    return this.http.post<any>(this.timetableApiUrl, teacherDTO, this.getHeaders()).pipe(
                                        map(() => adminUser as User),
                                        catchError(error => {
                                            console.error('Failed to add teacher to Timetable Service:', error);
                                            return this.deleteUser(adminUser.id).pipe(
                                                switchMap(() => throwError(() => new Error('Failed to add teacher to Timetable Service: ' + (error.message || 'Unknown error')))),
                                                catchError(rollbackError => {
                                                    console.error('Rollback failed:', rollbackError);
                                                    return throwError(() => new Error('Failed to add teacher and rollback failed: ' + (error.message || 'Unknown error')));
                                                })
                                            );
                                        })
                                    );
                                }),
                                catchError(this.handleError('addUser'))
                            );
                        })
                    );
                }),
                catchError(this.handleError('addUser'))
            );
        }

        if (userToSend.role === 'STUDENT') {
            return this.crudService.getSchools().pipe(
                switchMap(schools => {
                    const school = schools.find(s => s.name === userToSend.schoolNameStudent);
                    if (!school) {
                        return throwError(() => new Error(`School not found: ${userToSend.schoolNameStudent}`));
                    }
                    return this.http.post<UserResponse>(this.apiUrl, userToSend, this.getHeaders()).pipe(
                        map(userResponse => userResponse as User),
                        catchError(this.handleError('addUser'))
                    );
                }),
                catchError(this.handleError('addUser'))
            );
        }

        return this.http.post<UserResponse>(this.apiUrl, userToSend, this.getHeaders()).pipe(
            map(userResponse => userResponse as User),
            catchError(this.handleError('addUser'))
        );
    }

    updateUser(id: number, user: User): Observable<User> {
        console.log('Updating user with ID:', id, 'payload:', user);

        if (user.role === 'LOCAL_ADMIN') {
            const isDeactivation = user.status === 'Suspended';
            if (!isDeactivation && !user.schoolNameLocalAdmin) {
                console.error('schoolNameLocalAdmin is undefined or empty for local admin update.');
                return throwError(() => new Error('School is required for local admin. Please select a school.'));
            }

            return this.crudService.getSchools().pipe(
                switchMap(schools => {
                    let school: School | undefined;
                    if (!isDeactivation) {
                        school = schools.find(s => s.name === user.schoolNameLocalAdmin);
                        if (!school) {
                            return throwError(() => new Error(`School not found: ${user.schoolNameLocalAdmin}`));
                        }
                    }
                    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user, this.getHeaders()).pipe(
                        map(userResponse => userResponse as User),
                        catchError(this.handleError('updateUser'))
                    );
                }),
                catchError(this.handleError('updateUser'))
            );
        }

        if (user.role === 'TEACHER') {
            const isDeactivation = user.status === 'Suspended';
            if (!isDeactivation && !user.schoolNameTeacher) {
                console.error('schoolNameTeacher is undefined or empty for teacher update.');
                return throwError(() => new Error('School is required for teacher. Please select a school.'));
            }

            return this.crudService.getSubjects().pipe(
                switchMap((subjects: SubjectDTO[]) => {
                    const subject = subjects.find(s => s.name === user.subjectSpecialization);
                    if (!subject) {
                        return throwError(() => new Error(`Subject not found: ${user.subjectSpecialization}`));
                    }

                    return this.crudService.getSchools().pipe(
                        switchMap((schools: School[]) => {
                            let school: School | undefined;
                            if (!isDeactivation) {
                                school = schools.find(s => s.name === user.schoolNameTeacher);
                                if (!school) {
                                    return throwError(() => new Error(`School not found: ${user.schoolNameTeacher}`));
                                }
                            }

                            return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user, this.getHeaders()).pipe(
                                switchMap(adminUser => {
                                    if (isDeactivation) {
                                        return of(adminUser as User);
                                    }

                                    const teacherDTO = {
                                        id: adminUser.id,
                                        name: `${adminUser.firstName} ${adminUser.lastName}`,
                                        maxHoursPerWeek: 20,
                                        subjectId: subject.id,
                                        schoolId: school!.id
                                    };
                                    console.log('Updating teacher in Timetable Service with payload:', teacherDTO);
                                    return this.http.put<any>(`${this.timetableApiUrl}/${adminUser.id}`, teacherDTO, this.getHeaders()).pipe(
                                        map(() => adminUser as User),
                                        catchError(this.handleError('updateUser'))
                                    );
                                }),
                                catchError(this.handleError('updateUser'))
                            );
                        })
                    );
                }),
                catchError(this.handleError('updateUser'))
            );
        }

        if (user.role === 'STUDENT') {
            const isDeactivation = user.status === 'Suspended';
            if (!isDeactivation && !user.schoolNameStudent) {
                console.error('schoolNameStudent is undefined or empty for student update.');
                return throwError(() => new Error('School is required for student. Please select a school.'));
            }

            return this.crudService.getSchools().pipe(
                switchMap(schools => {
                    let school: School | undefined;
                    if (!isDeactivation) {
                        school = schools.find(s => s.name === user.schoolNameStudent);
                        if (!school) {
                            return throwError(() => new Error(`School not found: ${user.schoolNameStudent}`));
                        }
                    }
                    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user, this.getHeaders()).pipe(
                        map(userResponse => userResponse as User),
                        catchError(this.handleError('updateUser'))
                    );
                }),
                catchError(this.handleError('updateUser'))
            );
        }

        return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user, this.getHeaders()).pipe(
            map(userResponse => userResponse as User),
            catchError(this.handleError('updateUser'))
        );
    }

    deleteUser(id: number, role?: string): Observable<void> {
        console.log('Deleting user from Admin Service with ID:', id);
        return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
            switchMap(() => {
                if (role === 'TEACHER') {
                    console.log('Deleting teacher from Timetable Service with ID:', id);
                    return this.deleteTeacherFromTimetable(id).pipe(
                        catchError((timetableError) => {
                            console.error('Failed to delete teacher from Timetable Service:', timetableError);
                            return this.getUser(id).pipe(
                                switchMap((user) => {
                                    console.log('Attempting to rollback Admin Service deletion for user:', id);
                                    return this.http.post<UserResponse>(this.apiUrl, user, this.getHeaders()).pipe(
                                        switchMap(() => throwError(() => new Error('Failed to delete teacher from Timetable Service: ' + timetableError.message))),
                                        catchError((rollbackError) => {
                                            console.error('Rollback failed:', rollbackError);
                                            return throwError(() => new Error('Failed to delete teacher and rollback failed: ' + timetableError.message));
                                        })
                                    );
                                }),
                                catchError(() => throwError(() => new Error('Failed to delete teacher from Timetable Service and unable to rollback: ' + timetableError.message)))
                            );
                        })
                    );
                }
                return of(void 0);
            }),
            catchError(this.handleError('deleteUser'))
        );
    }

    deleteTeacherFromTimetable(id: number): Observable<void> {
        console.log('Deleting teacher from Timetable Service with ID:', id);
        return this.http.delete<void>(`${this.timetableApiUrl}/${id}`, this.getHeaders()).pipe(
            catchError(this.handleError('deleteTeacherFromTimetable'))
        );
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl, this.getHeaders()).pipe(
            catchError(this.handleError('getUsers'))
        );
    }

    getUser(id: number): Observable<User> {
        console.log('Fetching user with ID:', id);
        return this.http.get<User>(`${this.apiUrl}/${id}`, this.getHeaders()).pipe(
            switchMap(user => {
                console.log('Received user:', user);
                if (user.profileCode) {
                    return this.profileService.getProfileByCode(user.profileCode).pipe(
                        map(profile => {
                            console.log('Received profile for code', user.profileCode, ':', profile);
                            return {
                                ...user,
                                profile: profile ? { code: profile.code, designation: profile.designation } : undefined
                            };
                        }),
                        catchError(err => {
                            console.warn('Failed to fetch profile for code', user.profileCode, ':', err);
                            return of(user);
                        })
                    );
                }
                return of(user);
            }),
            switchMap(user => {
                if (user.role === 'TEACHER' && !user.schoolNameTeacher) {
                    console.log('schoolNameTeacher missing, fetching from Timetable Service for ID:', id);
                    return this.getTeacherFromTimetable(id).pipe(
                        map(teacher => {
                            console.log('Received teacher from Timetable Service:', teacher);
                            return {
                                ...user,
                                schoolNameTeacher: teacher.schoolName || user.schoolNameTeacher,
                                subjectSpecialization: teacher.subjectName || user.subjectSpecialization
                            };
                        }),
                        catchError(err => {
                            console.warn('Failed to fetch teacher from Timetable Service:', err);
                            return of(user);
                        })
                    );
                }
                return of(user);
            }),
            map(user => ({
                ...user,
                schoolNameTeacher: user.schoolNameTeacher || '',
                schoolNameLocalAdmin: user.schoolNameLocalAdmin || '',
                schoolNameStudent: user.schoolNameStudent || '',
                subjectSpecialization: user.subjectSpecialization || ''
            })),
            catchError(this.handleError('getUser'))
        );
    }

    getTeacherFromTimetable(id: number): Observable<TeacherResponseDTO> {
        console.log('Fetching teacher from Timetable Service with ID:', id);
        return this.http.get<TeacherResponseDTO>(`${this.timetableApiUrl}/${id}`, this.getHeaders()).pipe(
            catchError(this.handleError('getTeacherFromTimetable'))
        );
    }

    getUserByUsername(username: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/username/${username}`, this.getHeaders()).pipe(
            catchError(this.handleError('getUserByUsername'))
        );
    }

    private handleError(operation = 'operation') {
        return (error: any): Observable<never> => {
            console.error(`${operation} failed:`, error);
            let errorMessage = `Failed to ${operation}`;
            if (error.status === 403) {
                errorMessage = 'Access denied: Insufficient permissions';
            } else if (error.status === 400) {
                errorMessage = 'Invalid data: ' + (error.error?.message || 'Check the form fields');
            } else if (error.status === 404) {
                errorMessage = 'Resource not found';
            } else {
                errorMessage = error.message || 'Server error';
            }
            console.error(errorMessage);
            return throwError(() => new Error(errorMessage));
        };
    }

    getUsersBySchool(schoolName: string): Observable<User[]> {
        console.log('Fetching users for school:', schoolName);
        return this.getUsers().pipe(
            map((users: User[]) => users.filter(user =>
                (user.role === 'LOCAL_ADMIN' && user.schoolNameLocalAdmin === schoolName) ||
                (user.role === 'TEACHER' && user.schoolNameTeacher === schoolName) ||
                (user.role === 'STUDENT' && user.schoolNameStudent === schoolName)
            )),
            catchError(this.handleError('getUsersBySchool'))
        );
    }
}