 
import { Component, OnInit } from '@angular/core';
import { TimetablesService } from '../../timetables.service';
import { AuthService } from '../../auth.service'; // Import AuthService
import { CapacityRequest, CapacityResponse, GenerateTimetableRequest, TimetableDTO, School, Program, Subject, ClassDTO, ScheduleDTO } from '../../Models/timetable.model';

@Component({
  selector: 'app-timetable-manager',
  templateUrl: './timetable-manager.component.html',
  styleUrls: ['./timetable-manager.component.css']
})
export class TimetableManagerComponent implements OnInit {
  activeTab: 'capacity' | 'generate' | 'view' = 'capacity';


  schools: School[] = [];
  programs: Program[] = [];
  subjects: Subject[] = [];

  // Capacity Check
  capacityRequest: CapacityRequest = { schoolId: 0, desiredClasses: {} };
  capacityProgramEntries: { program: Program | null; count: number }[] = [{ program: null, count: 1 }];
  capacityResponse: CapacityResponse | null = null;
  capacityError: string | null = null;
  showInfeasibleTabSwitchModal: boolean = false;

  // Timetable Generation
  generateRequest: GenerateTimetableRequest = { schoolId: 0, programClassCounts: {} };
  generateProgramEntries: { program: Program | null; count: number }[] = [{ program: null, count: 1 }];
  timetable: TimetableDTO | null = null;
  generateError: string | null = null;
  showInfeasibleModal: boolean = false;
  isGenerating: boolean = false;

  // Timetable Viewing
  viewSchoolId: number | null = null;
  viewStatus: string = 'Draft';
  timetableView: TimetableDTO | null = null;
  viewError: string | null = null;
  isDeleting: boolean = false; // New property to track deletion state
  deleteError: string | null = null; // New property for deletion errors
  deleteSuccess: string | null = null; // New property for deletion success message
  showDeleteConfirmModal: boolean = false; // New flag for confirmation modal
  showDeleteSuccessModal: boolean = false; // New flag for success modal
  showDeleteErrorModal: boolean = false;   // New flag for error modal
  showNoTimetableModal: boolean = false; // New flag for no timetable modal

  // Timetable Grid
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  morningTimeslots: string[] = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'];
  afternoonTimeslots: string[] = ['14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'];

  // Local Admin properties
  isLocalAdmin: boolean = false;
  adminSchool: School | null = null;

  constructor(
    private timetablesService: TimetablesService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit() {
    this.isLocalAdmin = this.authService.isLocalAdmin();
    this.loadSchools();
    this.loadSubjects();
  }

  loadSchools() {
    console.log('Loading schools...');
    this.timetablesService.getSchools().subscribe({
      next: (schools) => {
        console.log('Raw schools from API:', schools);
        this.schools = schools.map((school: any) => ({
          id: Number(school.id),
          name: school.name,
          region: school.region,
          type: school.type
        }));
        console.log('Normalized schools:', this.schools);
        if (this.schools.length > 0) {
          if (this.isLocalAdmin) {
            // For LOCAL_ADMIN, fetch their school
            this.authService.getCurrentUserSchool().subscribe({
              next: (schoolName: string | null) => {
                if (schoolName) {
                  const matchedSchool = this.schools.find(school => school.name === schoolName);
                  if (matchedSchool) {
                    this.adminSchool = matchedSchool;
                    this.capacityRequest.schoolId = matchedSchool.id;
                    this.generateRequest.schoolId = matchedSchool.id;
                    this.viewSchoolId = matchedSchool.id;
                    console.log('Set school for LOCAL_ADMIN:', matchedSchool);
                    this.loadPrograms(matchedSchool.id);
                  } else {
                    this.capacityError = `No school found matching '${schoolName}'. Please contact support.`;
                    this.viewError = this.capacityError;
                    console.warn('No matching school found for LOCAL_ADMIN:', schoolName);
                  }
                } else {
                  this.capacityError = 'No school assigned to this Local Admin. Please contact support.';
                  this.viewError = this.capacityError;
                  console.warn('No school assigned to LOCAL_ADMIN');
                }
              },
              error: (err) => {
                this.capacityError = 'Failed to load admin school: ' + err.message;
                this.viewError = this.capacityError;
                console.error('Failed to load admin school:', err);
              }
            });
          } else {
            // For non-LOCAL_ADMIN (e.g., CENTRAL_ADMIN), use the first school as default
            const defaultSchoolId = this.schools[0].id;
            this.capacityRequest.schoolId = defaultSchoolId;
            this.generateRequest.schoolId = defaultSchoolId;
            this.viewSchoolId = defaultSchoolId;
            console.log('Set viewSchoolId for non-LOCAL_ADMIN:', this.viewSchoolId, 'type:', typeof this.viewSchoolId);
            this.loadPrograms(defaultSchoolId);
          }
        } else {
          this.viewError = 'No schools available.';
          this.capacityError = 'No schools available.';
          console.warn('No schools returned from API');
        }
      },
      error: (err) => {
        console.error('Failed to load schools:', err);
        this.capacityError = 'Failed to load schools: ' + err.message;
        this.viewError = this.capacityError;
      }
    });
  }

  loadPrograms(schoolId: number) {
    console.log('Loading programs for schoolId:', schoolId);
    this.timetablesService.getPrograms(schoolId).subscribe({
      next: (programs) => {
        console.log('Programs loaded:', programs);
        this.programs = programs;
        if (this.capacityProgramEntries.length === 0 || this.capacityProgramEntries.every(entry => !entry.program)) {
          this.capacityProgramEntries = [{ program: programs[0] || null, count: 1 }];
        }
        if (this.generateProgramEntries.length === 0 || this.generateProgramEntries.every(entry => !entry.program)) {
          this.generateProgramEntries = [{ program: programs[0] || null, count: 1 }];
        }
      },
      error: (err) => {
        console.error('Failed to load programs:', err);
        this.capacityError = 'Failed to load programs: ' + err.message;
        this.viewError = this.capacityError;
      }
    });
  }

  loadSubjects() {
    console.log('Loading subjects...');
    this.timetablesService.getSubjects().subscribe({
      next: (subjects) => {
        console.log('Subjects loaded:', subjects);
        this.subjects = subjects;
      },
      error: (err) => {
        console.error('Failed to load subjects:', err);
        this.capacityError = 'Failed to load subjects: ' + err.message;
        this.viewError = this.capacityError;
      }
    });
  }

  setActiveTab(tab: 'capacity' | 'generate' | 'view') {
    if (tab === 'generate' && this.capacityResponse && !this.capacityResponse.feasible) {
      console.log('Infeasible configuration: Showing modal instead of switching to Generate Timetables');
      this.showInfeasibleTabSwitchModal = true;
      return;
    }
    this.activeTab = tab;
    if (tab === 'generate' && this.capacityResponse) {
      console.log('Syncing generate tab with capacity data');
      this.generateRequest.schoolId = this.capacityRequest.schoolId;
      this.generateProgramEntries = this.capacityProgramEntries.map(entry => ({
        program: entry.program,
        count: entry.count
      }));
    }
    if (tab === 'view' && this.schools.length > 0 && (this.viewSchoolId === null || !this.schools.some(s => s.id === this.viewSchoolId))) {
      console.warn('viewSchoolId is invalid, resetting to default:', this.viewSchoolId);
      this.viewSchoolId = this.isLocalAdmin && this.adminSchool ? this.adminSchool.id : this.schools[0].id;
    }
  }

  closeInfeasibleTabSwitchModal() {
    console.log('Closing infeasible tab switch modal');
    this.showInfeasibleTabSwitchModal = false;
  }

  onSchoolChange(section: 'capacity' | 'generate' | 'view') {
    if (this.isLocalAdmin) {
      // For LOCAL_ADMIN, school is fixed, so skip school change logic
      console.log(`School change ignored for ${section} as user is LOCAL_ADMIN`);
      return;
    }
    let schoolId: number | null = section === 'capacity' ? this.capacityRequest.schoolId :
                               section === 'generate' ? this.generateRequest.schoolId : this.viewSchoolId;
    // Ensure schoolId is a number
    schoolId = schoolId !== null ? Number(schoolId) : null;
    console.log(`School changed for ${section}: schoolId=`, schoolId, 'viewSchoolId=', this.viewSchoolId, 'type:', typeof schoolId);
    if (section === 'view' && schoolId !== null) {
      this.viewSchoolId = schoolId;
    }
    if (schoolId !== null) {
      this.loadPrograms(schoolId);
    }
  }

  getSchoolName(schoolId: number): string {
    console.log('getSchoolName: schoolId=', schoolId, 'type:', typeof schoolId, 'schools=', this.schools);
    const school = this.schools.find(s => {
      console.log('Comparing: s.id=', s.id, 'type:', typeof s.id, 'schoolId=', schoolId, 'type:', typeof schoolId);
      return s.id === schoolId;
    });
    console.log('Found school:', school);
    return school ? school.name : 'Unknown';
  }

  getProgramName(programId: number): string {
    return this.programs.find(p => p.id === programId)?.name || 'Unknown';
  }

  // Capacity Check Methods
  addCapacityProgram() {
    this.capacityProgramEntries.push({ program: null, count: 0 });
  }

  removeCapacityProgram(index: number) {
    this.capacityProgramEntries.splice(index, 1);
  }

  checkCapacity() {
    if (this.isLocalAdmin && !this.adminSchool) {
      this.capacityError = 'No school assigned to this Local Admin.';
      return;
    }
    this.capacityRequest.desiredClasses = {};
    this.capacityProgramEntries.forEach(entry => {
      if (entry.program && entry.count >= 0) {
        this.capacityRequest.desiredClasses[entry.program.id] = entry.count;
      }
    });
    this.capacityError = null;
    this.capacityResponse = null;
    console.log('Checking capacity with request:', this.capacityRequest);
    this.timetablesService.checkCapacity(this.capacityRequest).subscribe({
      next: (res) => {
        console.log('Capacity check response:', res);
        this.capacityResponse = res;
        if (res.feasible) {
          this.generateRequest.schoolId = res.schoolId;
          this.generateProgramEntries = Object.entries(res.maxClasses).map(([programId, count]) => {
            const program = this.programs.find(p => p.id === +programId) || null;
            return { program, count: count as number };
          });
        }
      },
      error: (err) => {
        console.error('Capacity check error:', err.message);
        this.capacityError = err.message;
      }
    });
  }

  get maxClassesEntries() {
    return this.capacityResponse ? Object.entries(this.capacityResponse.maxClasses).map(([key, value]) => ({
      program: this.getProgramName(+key),
      count: value
    })) : [];
  }

  get requestedClassesEntries() {
    return this.capacityProgramEntries
      .filter(entry => entry.program && entry.count >= 0)
      .map(entry => ({
        program: entry.program ? this.getProgramName(entry.program.id) : 'Unknown',
        count: entry.count
      }));
  }

  get teacherConstraintsEntries() {
    return this.capacityResponse ? Object.entries(this.capacityResponse.teacherConstraints).map(([key, value]) => ({
      subject: this.subjects.find(s => s.id === +key)?.name || key,
      needed: value.required,
      available: value.available,
      enough: value.satisfied
    })) : [];
  }

  get roomConstraintsEntries() {
    return this.capacityResponse ? Object.entries(this.capacityResponse.roomConstraints).map(([key, value]) => ({
      roomType: key.replace('_', ' '),
      needed: value.required,
      available: value.available,
      enough: value.satisfied
    })) : [];
  }

  // Timetable Generation Methods
  addGenerateProgram() {
    this.generateProgramEntries.push({ program: null, count: 0 });
  }

  removeGenerateProgram(index: number) {
    this.generateProgramEntries.splice(index, 1);
  }

  generateTimetable() {
    if (this.isLocalAdmin && !this.adminSchool) {
      this.generateError = 'No school assigned to this Local Admin.';
      return;
    }
    this.generateRequest.programClassCounts = {};
    this.generateProgramEntries.forEach(entry => {
      if (entry.program && entry.count >= 0) {
        this.generateRequest.programClassCounts[entry.program.id] = entry.count;
      }
    });
    this.generateError = null;
    this.timetable = null;
    this.showInfeasibleModal = false;
    this.isGenerating = true;

    console.log('Starting timetable generation with request:', this.generateRequest);

    const tempCapacityRequest: CapacityRequest = {
      schoolId: this.generateRequest.schoolId,
      desiredClasses: { ...this.generateRequest.programClassCounts }
    };

    this.timetablesService.checkCapacity(tempCapacityRequest).subscribe({
      next: (res) => {
        console.log('Capacity check for generation:', res);
        this.capacityResponse = res;
        if (res.feasible) {
          console.log('Configuration is feasible, proceeding with generation');
          this.timetablesService.generateTimetable(this.generateRequest).subscribe({
            next: (timetableRes) => {
              console.log('Timetable generated successfully:', timetableRes);
              this.timetable = timetableRes;
              this.isGenerating = false;
            },
            error: (err) => {
              console.error('Timetable generation error:', err.message);
              this.generateError = err.message;
              this.isGenerating = false;
            }
          });
        } else {
          console.log('Configuration is infeasible, showing modal');
          this.showInfeasibleModal = true;
          this.isGenerating = false;
        }
      },
      error: (err) => {
        console.error('Capacity check error during generation:', err.message);
        this.generateError = err.message;
        this.isGenerating = false;
      }
    });
  }

  closeInfeasibleModal() {
    console.log('Closing infeasible modal');
    this.showInfeasibleModal = false;
  }

  // Timetable Viewing Methods


  // Timetable Grid Methods
  getClasses(timetable: TimetableDTO): ClassDTO[] {
    return [...new Set(timetable.schedules.map(s => s.classEntity.id))]
      .map(id => timetable.schedules.find(s => s.classEntity.id === id)!.classEntity)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getSpecialty(programId: number): string {
    const program = this.programs.find(p => p.id === programId);
    if (!program) return 'General';
    const name = program.name.toLowerCase();
    if (name.includes('tech') || name.includes('computer')) return 'Technology';
    if (name.includes('math')) return 'Math';
    if (name.includes('letter') || name.includes('econ')) return 'Letters';
    return 'General';
  }

  deleteTimetableData() {
    if (this.isLocalAdmin && !this.adminSchool) {
      this.deleteError = 'No school assigned to this Local Admin.';
      return;
    }
    if (this.viewSchoolId === null || this.viewSchoolId === 0) {
      this.deleteError = 'Please select a valid school.';
      return;
    }
    if (!confirm('Are you sure you want to delete all timetables, schedules, and classes for this school? This action cannot be undone.')) {
      return;
    }

    this.deleteError = null;
    this.deleteSuccess = null;
    this.isDeleting = true;
    this.timetableView = null;

    console.log('Deleting timetable data for schoolId:', this.viewSchoolId);
    this.timetablesService.deleteTimetableData(this.viewSchoolId).subscribe({
      next: (response) => {
        console.log('Timetable data deleted:', response);
        this.deleteSuccess = response;
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('Failed to delete timetable data:', err);
        this.deleteError = err.message;
        this.isDeleting = false;
      }
    });
  }

loadTimetable() {
    if (this.viewSchoolId === null || this.viewSchoolId === 0) {
      this.viewError = 'Please select a valid school.';
      return;
    }
    this.viewError = null;
    this.timetableView = null;

    console.log('Loading timetable for schoolId:', this.viewSchoolId, 'with status:', this.viewStatus);
    this.timetablesService.getTimetableBySchool(this.viewSchoolId, this.viewStatus).subscribe({
      next: (response) => {
        console.log('Timetable loaded:', response);
        if (response) {
          this.timetableView = response;
        }
      },
      error: (err) => {
        console.error('Failed to load timetable:', err);
        if (err.message === 'NO_TIMETABLE_FOUND') {
          this.showNoTimetableModal = true;
        } else {
          this.viewError = err.message;
        }
      }
    });
  }

  openDeleteConfirmModal() {
    if (this.isLocalAdmin && !this.adminSchool) {
      this.deleteError = 'No school assigned to this Local Admin.';
      this.showDeleteErrorModal = true;
      return;
    }
    if (this.viewSchoolId === null || this.viewSchoolId === 0) {
      this.deleteError = 'Please select a valid school.';
      this.showDeleteErrorModal = true;
      return;
    }
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    this.showDeleteConfirmModal = false;
    this.deleteError = null;
    this.deleteSuccess = null;
    this.isDeleting = true;
    this.timetableView = null;

    console.log('Deleting timetable data for schoolId:', this.viewSchoolId);
    this.timetablesService.deleteTimetableData(this.viewSchoolId!).subscribe({
      next: (response) => {
        console.log('Timetable data deleted:', response);
        this.deleteSuccess = response;
        this.showDeleteSuccessModal = true;
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('Failed to delete timetable data:', err);
        this.deleteError = err.message;
        this.showDeleteErrorModal = true;
        this.isDeleting = false;
      }
    });
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
  }

  closeDeleteSuccessModal() {
    this.showDeleteSuccessModal = false;
    this.deleteSuccess = null;
  }

  closeDeleteErrorModal() {
    this.showDeleteErrorModal = false;
    this.deleteError = null;
  }

closeNoTimetableModal() {
    this.showNoTimetableModal = false;
  }

  getScheduleForCell(timetable: TimetableDTO, classId: number, day: string, timeslot: string): ScheduleDTO | null {
    const [startTime, endTime] = timeslot.split('-');
    return timetable.schedules.find(s =>
      s.classEntity.id === classId &&
      s.timeSlot.day.toLowerCase() === day.toLowerCase() &&
      s.timeSlot.startTime === startTime &&
      s.timeSlot.endTime === endTime
    ) || null;
  }
}