
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/user.service';
import { ProfileService, Profile } from 'src/app/profile.service';
import { PermissionService } from 'src/app/permission.service';
import { CrudService } from 'src/app/crud.service';
import { AuthService } from 'src/app/auth.service';
import { User } from 'src/app/Models/user.model';
import { SubjectDTO, School, ClassDTO } from 'src/app/Models/timetable.model';
import * as bootstrap from 'bootstrap';

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
    user: User = {
        username: '',
        password: '',
        role: '',
        profileCode: '',
        email: '',
        status: 'Active',
        firstName: '',
        lastName: '',
        birthdate: '',
        gender: '',
        address: '',
        phoneNumber: '',
        subjectSpecialization: '',
        schoolNameTeacher: '',
        schoolNameLocalAdmin: '',
        schoolNameStudent: '',
        schoolClass: '' 
    };
    profiles: Profile[] = [];
    allowedProfiles: Profile[] = [];
    allRoles: string[] = ['CENTRAL_ADMIN', 'LOCAL_ADMIN', 'TEACHER', 'STUDENT'];
    subjects: SubjectDTO[] = [];
    schools: School[] = [];
    classes: ClassDTO[] = []; 
    isSubmitted = false;
    isLocalAdmin: boolean = false;
    adminSchool: string | null = null;

    constructor(
        private userService: UserService,
        private profileService: ProfileService,
        private permissionService: PermissionService,
        private crudService: CrudService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        this.permissionService.refreshPermissions();
        this.isLocalAdmin = this.authService.isLocalAdmin();
        if (this.isLocalAdmin) {
            this.authService.getCurrentUserSchool().subscribe({
                next: (schoolName: string | null) => {
                    this.adminSchool = schoolName;
                    if (schoolName) {
                        this.user.schoolNameLocalAdmin = schoolName;
                        this.user.schoolNameTeacher = schoolName;
                        this.user.schoolNameStudent = schoolName;
                        this.loadClassesForSchool(schoolName); // Load classes for admin's school
                    } else {
                        this.showErrorModal('No school assigned to this Local Admin. Please contact support.');
                    }
                },
                error: (err) => this.showErrorModal('Failed to load admin school: ' + err.message)
            });
        }
        this.loadProfiles();
        this.loadSubjects();
        this.loadSchools();
    }

    loadProfiles() {
        this.profileService.getAllProfiles().subscribe({
            next: (profiles) => {
                this.profiles = profiles;
                this.allowedProfiles = profiles.filter(profile =>
                    this.permissionService.isProfileAllowed(profile.permissions.map(p => p.name))
                );
            },
            error: (err) => this.showErrorModal('Failed to load profiles: ' + err.message)
        });
    }

    loadSubjects() {
        this.crudService.getSubjects().subscribe({
            next: (subjects) => {
                this.subjects = subjects;
            },
            error: (err) => this.showErrorModal('Failed to load subjects: ' + err.message)
        });
    }

    loadSchools() {
        this.crudService.getSchools().subscribe({
            next: (schools) => {
                this.schools = schools;
                if (this.isLocalAdmin && this.adminSchool) {
                    const schoolExists = schools.some(school => school.name === this.adminSchool);
                    if (!schoolExists) {
                        this.showErrorModal(`The assigned school '${this.adminSchool}' is not available. Please contact support.`);
                        this.adminSchool = null;
                    }
                }
            },
            error: (err) => this.showErrorModal('Failed to load schools: ' + err.message)
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

    onRoleChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        if (target) {
            this.user.role = target.value;
            this.resetRoleSpecificFields();
            if (this.isLocalAdmin && this.adminSchool) {
                if (this.user.role === 'LOCAL_ADMIN') {
                    this.user.schoolNameLocalAdmin = this.adminSchool;
                } else if (this.user.role === 'TEACHER') {
                    this.user.schoolNameTeacher = this.adminSchool;
                } else if (this.user.role === 'STUDENT') {
                    this.user.schoolNameStudent = this.adminSchool;
                    this.loadClassesForSchool(this.adminSchool); // Load classes for student's school
                }
            }
        }
    }

    private resetRoleSpecificFields() {
        this.user.department = this.user.role === 'CENTRAL_ADMIN' ? this.user.department : '';
        this.user.schoolNameLocalAdmin = this.user.role === 'LOCAL_ADMIN' && this.isLocalAdmin ? this.adminSchool || '' : '';
        this.user.subjectSpecialization = this.user.role === 'TEACHER' ? this.user.subjectSpecialization : '';
        this.user.schoolNameTeacher = this.user.role === 'TEACHER' && this.isLocalAdmin ? this.adminSchool || '' : '';
        this.user.studentId = this.user.role === 'STUDENT' ? this.user.studentId : '';
        this.user.schoolNameStudent = this.user.role === 'STUDENT' && this.isLocalAdmin ? this.adminSchool || '' : '';
        this.user.schoolClass = this.user.role === 'STUDENT' ? this.user.schoolClass : ''; // Reset schoolClass
        this.classes = []; // Clear classes when role changes
    }

    canAddUser(): boolean {
        const permission = `ADD_USER_${this.user.role.toUpperCase()}`;
        return this.permissionService.hasPermission(permission);
    }

    confirmSubmit() {
        const modalElement = document.getElementById('confirmModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    resetUserForm() {
        this.user = {
            username: '',
            password: '',
            role: '',
            profileCode: '',
            email: '',
            status: 'Active',
            firstName: '',
            lastName: '',
            birthdate: '',
            gender: '',
            address: '',
            phoneNumber: '',
            subjectSpecialization: '',
            schoolNameTeacher: '',
            schoolNameLocalAdmin: '',
            schoolNameStudent: '',
            schoolClass: ''
        };
        if (this.isLocalAdmin && this.adminSchool) {
            this.user.schoolNameLocalAdmin = this.adminSchool;
            this.user.schoolNameTeacher = this.adminSchool;
            this.user.schoolNameStudent = this.adminSchool;
        }
        this.isSubmitted = false;
        this.classes = [];
    }

    onSubmit(confirmed: boolean = false) {
        if (!confirmed) {
            this.confirmSubmit();
            return;
        }

        this.isSubmitted = true;

        if (!this.user.username || !this.user.email || !this.user.role || !this.user.password ||
            !this.user.firstName || !this.user.lastName || !this.user.status || !this.user.profileCode) {
            this.showErrorModal('Required fields (Username, Email, Role, Password, First Name, Last Name, Status, Profile) are missing');
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

        if (!this.canAddUser()) {
            this.showPermissionErrorModal(`Your profile does not allow this action: ADD_USER_${this.user.role.toUpperCase()}`);
            return;
        }

        if (this.user.role === 'STUDENT' && !this.user.studentStatus) {
            this.user.studentStatus = 'Enrolled';
        }

        const userToSend = { ...this.user, id: undefined };
        console.log('Submitting user:', userToSend);

        this.userService.addUser(userToSend).subscribe({
            next: (addedUser) => {
                this.showSuccessModal('User added successfully! Redirecting...', () => {
                    this.router.navigate(['/admin/users']);
                });
                this.resetUserForm();
            },
            error: (error) => {
                console.error('Add user failed:', error);
                this.showErrorModal('Failed to add user: ' + error.message);
                this.resetUserForm();
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