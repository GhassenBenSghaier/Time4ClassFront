import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/user.service';
import { ProfileService, Profile } from 'src/app/profile.service';
import { PermissionService } from 'src/app/permission.service';
import { CrudService } from 'src/app/crud.service';
import { AuthService } from 'src/app/auth.service';
import { User } from 'src/app/Models/user.model';
import { SubjectDTO, School, ClassDTO } from 'src/app/Models/timetable.model';
import * as bootstrap from 'bootstrap';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
    user: User = {
        id: 0,
        username: '',
        password: undefined,
        role: '',
        profileCode: '',
        email: '',
        status: 'Pending',
        firstName: '',
        lastName: '',
        birthdate: '',
        gender: '',
        address: '',
        phoneNumber: '',
        department: '',
        accessLevel: '',
        employeeId: '',
        hireDate: '',
        schoolNameLocalAdmin: '',
        adminCode: '',
        subjectSpecialization: '',
        qualification: '',
        teacherRank: '',
        schoolNameTeacher: '',
        studentId: '',
        enrollmentDate: '',
        gradeLevel: '',
        schoolClass: '',
        parentName: '',
        parentContact: '',
        previousSchool: '',
        medicalConditions: '',
        studentStatus: '',
        schoolNameStudent: ''
    };
    profiles: Profile[] = [];
    allowedProfiles: Profile[] = [];
    subjects: SubjectDTO[] = [];
    schools: School[] = [];
    classes: ClassDTO[] = []; // Store classes for the selected school
    isSubmitted: boolean = false;
    newPassword: string = '';
    isLocalAdmin: boolean = false;
    adminSchool: string | null = null;

    constructor(
        private userService: UserService,
        private profileService: ProfileService,
        private permissionService: PermissionService,
        private crudService: CrudService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        const id = +this.route.snapshot.paramMap.get('id')!;
        this.permissionService.refreshPermissions();
        this.isLocalAdmin = this.authService.isLocalAdmin();

        if (this.isLocalAdmin) {
            this.authService.getCurrentUserSchool().subscribe({
                next: (schoolName: string | null) => {
                    this.adminSchool = schoolName;
                    if (!schoolName) {
                        this.showErrorModal('No school assigned to this Local Admin. Please contact support.');
                    }
                },
                error: (err) => this.showErrorModal('Failed to load admin school: ' + err.message)
            });
        }

        forkJoin({
            profiles: this.profileService.getAllProfiles(),
            subjects: this.crudService.getSubjects(),
            schools: this.crudService.getSchools()
        }).subscribe({
            next: ({ profiles, subjects, schools }) => {
                this.profiles = profiles;
                this.allowedProfiles = profiles.filter(profile =>
                    this.permissionService.isProfileAllowed(profile.permissions.map(p => p.name))
                );
                console.log('Loaded profiles:', this.profiles);

                this.subjects = subjects;
                console.log('Loaded subjects:', this.subjects);

                this.schools = schools;
                console.log('Loaded schools:', this.schools);
                if (schools.length === 0) {
                    this.showErrorModal('No schools found. Please add schools in the system.');
                }

                if (this.isLocalAdmin && this.adminSchool) {
                    const schoolExists = schools.some(school => school.name === this.adminSchool);
                    if (!schoolExists) {
                        this.showErrorModal(`The assigned school '${this.adminSchool}' is not available. Please contact support.`);
                        this.adminSchool = null;
                    }
                }

                this.userService.getUser(id).subscribe({
                    next: (user) => {
                        this.user = {
                            ...user,
                            profileCode: user.profile ? user.profile.code : user.profileCode,
                            password: undefined,
                            schoolNameTeacher: user.schoolNameTeacher || '',
                            schoolNameLocalAdmin: user.schoolNameLocalAdmin || '',
                            schoolNameStudent: user.schoolNameStudent || '',
                            schoolClass: user.schoolClass || '' // Ensure schoolClass is initialized
                        };
                        console.log('Loaded user:', this.user);

                        if (this.isLocalAdmin && this.adminSchool) {
                            // For LOCAL_ADMIN, enforce the admin's school
                            if (this.user.role === 'LOCAL_ADMIN') {
                                this.user.schoolNameLocalAdmin = this.adminSchool;
                            } else if (this.user.role === 'TEACHER') {
                                this.user.schoolNameTeacher = this.adminSchool;
                            } else if (this.user.role === 'STUDENT') {
                                this.user.schoolNameStudent = this.adminSchool;
                                this.loadClassesForSchool(this.adminSchool); // Load classes for student's school
                            }
                            // Validate that the user's school matches the admin's school
                            if (this.user.role === 'LOCAL_ADMIN' && this.user.schoolNameLocalAdmin !== this.adminSchool) {
                                this.showErrorModal(`Cannot edit this user. Their school (${this.user.schoolNameLocalAdmin}) does not match your school (${this.adminSchool}).`);
                                this.router.navigate(['/admin/users']);
                                return;
                            } else if (this.user.role === 'TEACHER' && this.user.schoolNameTeacher !== this.adminSchool) {
                                this.showErrorModal(`Cannot edit this user. Their school (${this.user.schoolNameTeacher}) does not match your school (${this.adminSchool}).`);
                                this.router.navigate(['/admin/users']);
                                return;
                            } else if (this.user.role === 'STUDENT' && this.user.schoolNameStudent !== this.adminSchool) {
                                this.showErrorModal(`Cannot edit this user. Their school (${this.user.schoolNameStudent}) does not match your school (${this.adminSchool}).`);
                                this.router.navigate(['/admin/users']);
                                return;
                            }
                        } else if (this.user.role === 'STUDENT' && this.user.schoolNameStudent) {
                            this.loadClassesForSchool(this.user.schoolNameStudent); // Load classes for non-local admin
                        }

                        if (this.user.role === 'TEACHER') {
                            if (this.user.subjectSpecialization) {
                                const subjectExists = this.subjects.some(s => s.name === this.user.subjectSpecialization);
                                if (!subjectExists) {
                                    console.warn(`Teacher's subject '${this.user.subjectSpecialization}' not found.`);
                                    this.showErrorModal(`The teacher's subject '${this.user.subjectSpecialization}' is not available. Please select a valid subject.`);
                                    this.user.subjectSpecialization = '';
                                }
                            }
                            if (this.user.schoolNameTeacher && !this.isLocalAdmin) {
                                this.validateTeacherSchool(this.user.schoolNameTeacher);
                            }
                        } else if (this.user.role === 'LOCAL_ADMIN') {
                            if (this.user.schoolNameLocalAdmin && !this.isLocalAdmin) {
                                this.validateLocalAdminSchool(this.user.schoolNameLocalAdmin);
                            }
                        } else if (this.user.role === 'STUDENT') {
                            if (this.user.schoolNameStudent && !this.isLocalAdmin) {
                                this.validateStudentSchool(this.user.schoolNameStudent);
                            }
                        }
                    },
                    error: (error) => this.showErrorModal('User not found or failed to load: ' + error.message)
                });
            },
            error: (err) => this.showErrorModal('Failed to load initial data: ' + err.message)
        });
    }

    loadClassesForSchool(schoolName: string) {
        const school = this.schools.find(s => s.name === schoolName);
        if (school && school.id) {
            this.crudService.getClassesBySchool(school.id).subscribe({
                next: (classes) => {
                    this.classes = classes;
                },
                error: (err) => {
                    this.classes = [];
                    this.showErrorModal('Failed to load classes for school: ' + err.message);
                }
            });
        } else {
            this.classes = [];
        }
    }

    onSchoolChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        if (target && this.user.role === 'STUDENT') {
            this.user.schoolNameStudent = target.value;
            this.user.schoolClass = ''; // Reset class when school changes
            this.loadClassesForSchool(this.user.schoolNameStudent);
        }
    }

    validateTeacherSchool(schoolNameTeacher: string) {
        if (!schoolNameTeacher) {
            console.warn('Teacher school is undefined or empty.');
            this.showErrorModal('Please select a valid school for the teacher.');
            return;
        }
        const schoolExists = this.schools.some(school => school.name === schoolNameTeacher);
        if (!schoolExists) {
            console.warn(`Teacher's school '${schoolNameTeacher}' not found in loaded schools.`);
            this.showErrorModal(`The teacher's assigned school '${schoolNameTeacher}' is not available. Please select a valid school.`);
            this.user.schoolNameTeacher = '';
        } else {
            console.log(`Teacher's school '${schoolNameTeacher}' validated successfully.`);
        }
    }

    validateLocalAdminSchool(schoolNameLocalAdmin: string) {
        if (!schoolNameLocalAdmin) {
            console.warn('Local Admin school is undefined or empty.');
            this.showErrorModal('Please select a valid school for the local admin.');
            return;
        }
        const schoolExists = this.schools.some(school => school.name === schoolNameLocalAdmin);
        if (!schoolExists) {
            console.warn(`Local Admin's school '${schoolNameLocalAdmin}' not found in loaded schools.`);
            this.showErrorModal(`The local admin's assigned school '${schoolNameLocalAdmin}' is not available. Please select a valid school.`);
            this.user.schoolNameLocalAdmin = '';
        } else {
            console.log(`Local Admin's school '${schoolNameLocalAdmin}' validated successfully.`);
        }
    }

    validateStudentSchool(schoolNameStudent: string) {
        if (!schoolNameStudent) {
            console.warn('Student school is undefined or empty.');
            this.showErrorModal('Please select a valid school for the student.');
            return;
        }
        const schoolExists = this.schools.some(school => school.name === schoolNameStudent);
        if (!schoolExists) {
            console.warn(`Student's school '${schoolNameStudent}' not found in loaded schools.`);
            this.showErrorModal(`The student's assigned school '${schoolNameStudent}' is not available. Please select a valid school.`);
            this.user.schoolNameStudent = '';
        } else {
            console.log(`Student's school '${schoolNameStudent}' validated successfully.`);
        }
    }

    canEditUser(): boolean {
        const permission = `EDIT_USER_${this.user.role.toUpperCase()}`;
        return this.permissionService.hasPermission(permission);
    }

    confirmSubmit() {
        const modalElement = document.getElementById('confirmModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    onSubmit(confirmed: boolean = false) {
        this.isSubmitted = true;

        if (!confirmed) {
            this.confirmSubmit();
            return;
        }

        if (!this.user.username || !this.user.email || !this.user.role ||
            !this.user.firstName || !this.user.lastName || !this.user.status || !this.user.profileCode) {
            this.showErrorModal('Required fields (Username, Email, Role, First Name, Last Name, Status, Profile) are missing');
            return;
        }

        if (this.user.role === 'CENTRAL_ADMIN' && !this.user.employeeId) {
            this.showErrorModal('Employee ID is required for Central Admin');
            return;
        } else if (this.user.role === 'LOCAL_ADMIN' && !this.user.schoolNameLocalAdmin) {
            this.showErrorModal('School is required for Local Admin');
            return;
        } else if (this.user.role === 'TEACHER' && (!this.user.subjectSpecialization || !this.user.schoolNameTeacher)) {
            this.showErrorModal('Subject and School are required for Teacher');
            return;
        } else if (this.user.role === 'STUDENT' && (!this.user.studentId || !this.user.schoolNameStudent)) {
            this.showErrorModal('Student ID and School are required for Student');
            return;
        }

        const selectedProfile = this.allowedProfiles.find(p => p.code === this.user.profileCode);
        if (!selectedProfile || !this.permissionService.isProfileAllowed(selectedProfile.permissions.map(p => p.name))) {
            this.showPermissionErrorModal(`You cannot assign profile '${selectedProfile?.designation}' as it contains permissions you do not have.`);
            return;
        }

        if (!this.canEditUser()) {
            this.showPermissionErrorModal(`Your profile does not allow this action: EDIT_USER_${this.user.role.toUpperCase()}`);
            return;
        }

        const updatePayload: User = { ...this.user };
        delete updatePayload.password;
        if (this.newPassword && this.newPassword.trim() !== '') {
            updatePayload.password = this.newPassword.trim();
        }
        console.log('Update payload:', JSON.stringify(updatePayload));

        this.userService.updateUser(this.user.id!, updatePayload).subscribe({
            next: (response) => {
                console.log('Update response:', response);
                this.showSuccessModal('User updated successfully! Redirecting...', () => {
                    this.router.navigate(['/admin/users']);
                });
            },
            error: (error) => {
                console.error('Update failed:', error);
                const message = error.message.includes('Timetable Service')
                    ? 'Failed to update teacher in Timetable Service. Please try again or contact support.'
                    : 'Failed to update user: ' + error.message;
                this.showErrorModal(message);
            }
        });
    }

    private showSuccessModal(message: string, callback?: () => void) {
        const modalElement = document.getElementById('successModal');
        if (modalElement) {
            const modalBody = modalElement.querySelector('.modal-body');
            if (modalBody) modalBody.textContent = message;
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            if (callback) {
                modalElement.addEventListener('hidden.bs.modal', callback, { once: true });
            }
        }
    }

    private showErrorModal(message: string) {
        const modalElement = document.getElementById('errorModal');
        if (modalElement) {
            const modalBody = modalElement.querySelector('.modal-body');
            if (modalBody) modalBody.textContent = message;
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    private showPermissionErrorModal(message: string) {
        const modalElement = document.getElementById('permissionModal');
        if (modalElement) {
            const modalBody = modalElement.querySelector('.modal-body');
            if (modalBody) modalBody.textContent = message;
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }
}