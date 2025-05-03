import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TimetableProgramService } from 'src/app/timetable-program.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({  
  selector: 'app-program-creation',
  templateUrl: './program-creation.component.html',
  styleUrls: ['./program-creation.component.css']
})
export class ProgramCreationComponent implements OnInit, OnDestroy {
  programForm: FormGroup;
  levels: any[] = [];
  specialties: any[] = [];
  subjects: any[] = [];
  isUpdateMode = false;
  existingProgramId?: number;
  private isUpdatingProgramName = false;
  private levelIdSubscription?: Subscription;
  private specialtyIdSubscription?: Subscription;
  private isLoadingProgram = false; 

  constructor(
    private fb: FormBuilder,
    private timetablesService: TimetableProgramService,
    private route: ActivatedRoute
  ) {
    this.programForm = this.fb.group({
      levelId: [null, Validators.required],
      specialtyId: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      programSubjects: this.fb.array([])
    });
  }

  get subjectsArray(): FormArray {
    return this.programForm.get('programSubjects') as FormArray;
  }

  ngOnInit(): void {
    this.loadLevels();
    this.loadSubjects();

    // Check for edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isUpdateMode = true;
      this.existingProgramId = +id;
      this.loadProgram(+id);
    } else {
      this.addSubject();
    }

    this.levelIdSubscription = this.programForm.get('levelId')?.valueChanges.subscribe((levelId) => {
      console.log('levelId changed:', levelId);
      // Only reset specialty and update name if not loading program
      if (!this.isLoadingProgram) {
        this.programForm.get('specialtyId')?.reset();
        this.loadSpecialties();
        this.updateProgramName();
      }
    });

    this.specialtyIdSubscription = this.programForm.get('specialtyId')?.valueChanges.subscribe((specialtyId) => {
      console.log('specialtyId changed:', specialtyId);
      if (!this.isLoadingProgram) {
        this.updateProgramName();
      }
    });
  }

  ngOnDestroy(): void {
    this.levelIdSubscription?.unsubscribe();
    this.specialtyIdSubscription?.unsubscribe();
  }

  loadProgram(id: number): void {
    console.log('Attempting to load program ID:', id);
    this.isLoadingProgram = true; // Set loading flag
    this.timetablesService.getProgramById(id).subscribe({
      next: (program) => {
        console.log('Loaded program:', program);
        this.loadExistingProgram(program);
      },
      error: (err) => {
        console.error('Error loading program:', err);
        const message = err.status === 405
          ? 'Cannot fetch program: Server does not support this request. Please contact support.'
          : `Failed to load program: ${err.message || 'Unknown error'}`;
        this.showErrorModal(message);
        this.isLoadingProgram = false;
      }
    });
  }

  loadLevels(): void {
    this.timetablesService.getLevels().subscribe({
      next: (levels) => {
        this.levels = levels;
        console.log('Levels loaded:', levels);
      },
      error: (err) => {
        console.error('Error fetching levels:', err);
        this.showErrorModal('Failed to load levels: ' + err.message);
      }
    });
  }

  loadSpecialties(): void {
    const levelId = this.programForm.get('levelId')?.value;
    console.log('Loading specialties for levelId:', levelId);
    if (!levelId) {
      this.specialties = [];
      this.programForm.get('specialtyId')?.disable();
      this.programForm.get('specialtyId')?.setValue(null);
      return;
    }

    const level = this.levels.find(l => l.id == levelId);
    if (!level || !level.supportsSpecialty) {
      this.specialties = [];
      this.programForm.get('specialtyId')?.disable();
      this.programForm.get('specialtyId')?.setValue(null);
      return;
    }

    this.timetablesService.getSpecialties(levelId).subscribe({
      next: (specialties) => {
        this.specialties = specialties;
        console.log('Specialties response:', specialties);
        this.programForm.get('specialtyId')?.enable();
      },
      error: (err) => {
        console.error('Error fetching specialties:', err);
        this.showErrorModal('Failed to load specialties: ' + err.message);
      }
    });
  }

  loadSubjects(): void {
    this.timetablesService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        console.log('Subjects loaded:', subjects);
      },
      error: (err) => {
        console.error('Error fetching subjects:', err);
        this.showErrorModal('Failed to load subjects: ' + err.message);
      }
    });
  }

  addSubject(): void {
    const subjectGroup = this.fb.group({
      subjectId: [null, Validators.required],
      hoursPerWeek: [1, [Validators.required, Validators.min(1)]],
      isCore: [false]
    });
    this.subjectsArray.push(subjectGroup);
  }

  removeSubject(index: number): void {
    this.subjectsArray.removeAt(index);
  }

  private loadExistingProgram(program: any): void {
    console.log('Loading existing program:', program);
    // Patch all fields except specialtyId
    this.programForm.patchValue({
      levelId: program.levelId,
      name: program.name
    }, { emitEvent: false });

    // Load specialties, then set specialtyId and verify name
    const levelId = program.levelId;
    if (levelId) {
      const level = this.levels.find(l => l.id == levelId);
      this.timetablesService.getSpecialties(levelId).subscribe({
        next: (specialties) => {
          this.specialties = specialties;
          console.log('Specialties loaded for levelId:', levelId, specialties);
          if (level && level.supportsSpecialty) {
            this.programForm.get('specialtyId')?.enable();
          } else {
            this.programForm.get('specialtyId')?.disable();
            this.programForm.get('specialtyId')?.setValue(null);
          }
          // Set specialtyId
          this.programForm.patchValue({
            specialtyId: program.specialtyId || null
          }, { emitEvent: false });
          // Ensure name is preserved (in case updateProgramName runs later)
          this.programForm.patchValue({
            name: program.name
          }, { emitEvent: false });
          this.isLoadingProgram = false; // Clear loading flag
          // Update name to reflect current levelId and specialtyId
          this.updateProgramName();
        },
        error: (err) => {
          console.error('Error loading specialties for program:', err);
          this.showErrorModal('Failed to load specialties: ' + err.message);
          this.isLoadingProgram = false;
        }
      });
    } else {
      this.specialties = [];
      this.programForm.get('specialtyId')?.disable();
      this.programForm.get('specialtyId')?.setValue(null);
      this.programForm.patchValue({
        name: program.name
      }, { emitEvent: false });
      this.isLoadingProgram = false;
    }

    // Load subjects
    this.subjectsArray.clear();
    if (program.programSubjects && program.programSubjects.length > 0) {
      program.programSubjects.forEach((ps: any) => {
        const subjectGroup = this.fb.group({
          subjectId: [ps.subjectId, Validators.required],
          hoursPerWeek: [ps.hoursPerWeek, [Validators.required, Validators.min(1)]],
          isCore: [ps.isCore]
        });
        this.subjectsArray.push(subjectGroup);
      });
    } else {
      this.addSubject();
    }
  }

  private updateProgramName(): void {
    if (this.isUpdatingProgramName) {
      console.log('Skipping updateProgramName due to ongoing update');
      return;
    }
    this.isUpdatingProgramName = true;

    const levelId = this.programForm.get('levelId')?.value;
    const specialtyId = this.programForm.get('specialtyId')?.value;
    console.log('updateProgramName called with:', { levelId, specialtyId, levels: this.levels, specialties: this.specialties });

    if (!levelId || !this.levels.length) {
      console.log('No levelId or levels not loaded, setting name to empty');
      this.programForm.get('name')?.setValue('');
      this.isUpdatingProgramName = false;
      return;
    }

    const level = this.levels.find(l => l.id == levelId);
    if (!level) {
      console.log('Level not found for id:', levelId);
      this.programForm.get('name')?.setValue('');
      this.isUpdatingProgramName = false;
      return;
    }

    let programName = level.name;

    if (specialtyId && level.supportsSpecialty) {
      const specialty = this.specialties.find(s => s.id == specialtyId);
      if (specialty) {
        programName = `${level.name} ${specialty.name}`.trim();
      } else {
        console.log('Specialty not found for id:', specialtyId);
      }
    }

    console.log('Generated programName:', programName);
    this.programForm.get('name')?.setValue(programName, { emitEvent: false });

    if (programName) {
      console.log('Checking program existence for:', programName);
      this.timetablesService.getProgramByName(programName).subscribe({
        next: (program) => {
          console.log('Program found:', program);
          if (!this.isUpdateMode) {
            this.isUpdateMode = true;
            this.existingProgramId = program.id;
            this.showSuccessModal('Program already exists. Loading data for update.');
            this.loadExistingProgram(program);
          }
          this.isUpdatingProgramName = false;
        },
        error: (err) => {
          if (err.status === 404) {
            console.log('Program does not exist, ready for creation');
            this.isUpdateMode = false;
            this.existingProgramId = undefined;
            this.subjectsArray.clear();
            this.addSubject();
          } else {
            console.error('Error checking program:', err);
            this.showErrorModal('Error checking program: ' + err.message);
          }
          this.isUpdatingProgramName = false;
        }
      });
    } else {
      console.log('Skipping program existence check, incomplete name:', programName);
      this.isUpdatingProgramName = false;
    }
  }

  onSubmit(): void {
    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      console.log('Form is invalid:', this.programForm.status, this.programForm.errors, this.programForm.value);
      this.showErrorModal('Please fill all required fields correctly.');
      return;
    }

    const formValue = this.programForm.getRawValue();
    const program: any = {
      id: this.isUpdateMode ? this.existingProgramId : undefined,
      levelId: formValue.levelId,
      specialtyId: formValue.specialtyId || null,
      name: formValue.name,
      programSubjects: formValue.programSubjects.map((s: any) => ({
        subjectId: s.subjectId,
        hoursPerWeek: s.hoursPerWeek,
        isCore: s.isCore
      }))
    };

    console.log('Submitting program:', program);

    const request = this.isUpdateMode
      ? this.timetablesService.updateProgram(program)
      : this.timetablesService.createProgram(program);

    request.subscribe({
      next: (response) => {
        this.showSuccessModal(this.isUpdateMode ? 'Program updated successfully!' : 'Program created successfully!');
        this.programForm.reset();
        this.subjectsArray.clear();
        this.addSubject();
        this.isUpdateMode = false;
        this.existingProgramId = undefined;
      },
      error: (err) => {
        console.error('Error processing program:', err);
        let errorMessage = 'Failed to process program: ';
        if (err.status === 409) {
          errorMessage = 'Program already exists. Please update the existing program.';
        } else if (err.status === 400) {
          errorMessage = 'Invalid program data: ' + (err.error?.message || 'Please check the form.');
        } else {
          errorMessage += err.error?.message || 'Unknown error.';
        }
        this.showErrorModal(errorMessage);
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
}