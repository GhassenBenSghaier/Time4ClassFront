import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/user.service';
import { CrudService } from 'src/app/crud.service';
import { AuthService } from 'src/app/auth.service';
import { User, Program } from 'src/app/Models/user.model';
import { FormControl } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;
  errorMessage: string | null = null;
  programs: Program[] = [];
  selectedProgram = new FormControl('');
  programError: string | null = null;
  selectedProgramToAdd: number | null = null;
  selectedProgramToRemove: Program | null = null;
  isLocalAdmin: boolean = false;
  isAuthorized: boolean = false;
  currentUserSchool: string | null = null;

  constructor(
    private userService: UserService,
    private crudService: CrudService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Check if the logged-in user is a local admin
    this.isLocalAdmin = this.authService.isLocalAdmin();

    // Get the current user's school (if local admin)
    if (this.isLocalAdmin) {
      this.authService.getCurrentUserSchool().subscribe({
        next: (schoolName: string | null) => {
          this.currentUserSchool = schoolName;
          this.loadUserDetails();
        },
        error: (err: any) => {
          this.showErrorModal('Failed to load school name: ' + err.message);
        }
      });
    } else {
      this.loadUserDetails();
    }
  }

  loadUserDetails() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(+id)) {
      this.errorMessage = 'Invalid user ID';
      return;
    }
    const userId = +id;
    this.userService.getUser(userId).subscribe({
      next: (user) => {
        this.user = user;
        // Check authorization for program management
        if (this.isLocalAdmin && user.role === 'TEACHER' && user.schoolNameTeacher) {
          this.isAuthorized = this.currentUserSchool === user.schoolNameTeacher;
        } else {
          this.isAuthorized = false; // Only local admins of the teacher's school can manage programs
        }
        // Load programs if the user is a teacher
        if (user.role === 'TEACHER' && user.id !== undefined) {
          this.loadTeacherPrograms(user.id);
          if (this.isAuthorized) {
            this.loadAllPrograms(); // Load available programs only for authorized users
          }
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showErrorModal('Failed to load user details: ' + error.message);
      }
    });
  }

  loadTeacherPrograms(teacherId: number) {
    this.crudService.getTeacherPrograms(teacherId).subscribe({
      next: (programs) => {
        if (this.user) {
          this.user.programs = programs;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showErrorModal('Failed to load teacher programs: ' + error.message);
      }
    });
  }

  loadAllPrograms() {
    this.crudService.getPrograms().subscribe({
      next: (programs) => {
        this.programs = programs;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showErrorModal('Failed to load programs: ' + error.message);
      }
    });
  }

  initiateAddProgram() {
    if (!this.isAuthorized) {
      this.showErrorModal('You are not authorized to add programs for this teacher.');
      return;
    }
    if (!this.selectedProgram.value) {
      this.programError = 'Please select a program';
      return;
    }
    if (!this.user || this.user.id === undefined) {
      this.programError = 'User data not loaded';
      return;
    }
    this.selectedProgramToAdd = +this.selectedProgram.value;
    const program = this.programs.find(p => p.id === this.selectedProgramToAdd);
    const modalElement = document.getElementById('addProgramConfirmModal');
    if (modalElement && program) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) {
        modalBody.textContent = `Are you sure you want to add the program "${program.name}" to ${this.user.username}?`;
      }
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmAddProgram(confirmed: boolean) {
    if (!this.isAuthorized) {
      this.showErrorModal('You are not authorized to add programs for this teacher.');
      this.selectedProgramToAdd = null;
      return;
    }
    if (confirmed && this.selectedProgramToAdd !== null && this.user && this.user.id !== undefined) {
      const teacherId = this.user.id;
      this.crudService.addProgramToTeacher(teacherId, this.selectedProgramToAdd).subscribe({
        next: () => {
          this.loadTeacherPrograms(teacherId);
          this.selectedProgram.reset();
          this.programError = null;
          this.showSuccessModal(`Program added successfully to ${this.user!.username}!`);
          this.selectedProgramToAdd = null;
        },
        error: (error) => {
          this.showErrorModal('Failed to add program: ' + error.message);
          this.selectedProgramToAdd = null;
        }
      });
    } else {
      this.selectedProgramToAdd = null;
    }
    this.cdr.detectChanges();
  }

  initiateRemoveProgram(program: Program) {
    if (!this.isAuthorized) {
      this.showErrorModal('You are not authorized to remove programs for this teacher.');
      return;
    }
    if (!this.user || this.user.id === undefined) {
      this.programError = 'User data not loaded';
      return;
    }
    this.selectedProgramToRemove = program;
    const modalElement = document.getElementById('removeProgramConfirmModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) {
        modalBody.textContent = `Are you sure you want to remove the program "${program.name}" from ${this.user.username}?`;
      }
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmRemoveProgram(confirmed: boolean) {
    if (!this.isAuthorized) {
      this.showErrorModal('You are not authorized to remove programs for this teacher.');
      this.selectedProgramToRemove = null;
      return;
    }
    if (confirmed && this.selectedProgramToRemove && this.user && this.user.id !== undefined) {
      const teacherId = this.user.id;
      this.crudService.removeProgramFromTeacher(teacherId, this.selectedProgramToRemove.id).subscribe({
        next: () => {
          this.loadTeacherPrograms(teacherId);
          this.programError = null;
          this.showSuccessModal(`Program "${this.selectedProgramToRemove!.name}" removed successfully from ${this.user!.username}!`);
          this.selectedProgramToRemove = null;
        },
        error: (error) => {
          this.showErrorModal('Failed to remove program: ' + error.message);
          this.selectedProgramToRemove = null;
        }
      });
    } else {
      this.selectedProgramToRemove = null;
    }
    this.cdr.detectChanges();
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }

  private showSuccessModal(message: string) {
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
      const modalBody = modalElement.querySelector('.modal-body');
      if (modalBody) modalBody.textContent = message;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
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
}