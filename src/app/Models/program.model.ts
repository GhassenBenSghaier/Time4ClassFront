export interface ProgramDTO {
    id?: number;
    levelId: number;
    specialtyId?: number | null; // Allow null for levels without specialties
    name: string;
    programSubjects: ProgramSubjectDTO[];
  }
  
  export interface ProgramSubjectDTO {
    subjectId: number;
    hoursPerWeek: number;
    isCore: boolean;
  }
  
  export interface GenerateTimetableRequestDTO {
    programClassCounts: { [key: string]: number };
  }
  
  export interface TimetableVersionDTO {
    id?: number;
    versionNumber: number;
    status: string;
    generatedAt: string;
    createdBy: string;
    schedules: ScheduleDTO[];
  }
  
  export interface ScheduleDTO {
    id?: number;
    classEntity: ClassDTO;
    subject: SubjectDTO;
    teacher: TeacherDTO;
    classroom: ClassroomDTO;
    timeSlot: TimeSlotDTO;
  }
  
  export interface ClassDTO {
    id: number;
    programId: number;
    name: string;
    studentCount: number;
    specialtyName?: string;
  }
  
  export interface SubjectDTO {
    id: number;
    name: string;
    defaultHoursPerWeek: number;
  }
  
  export interface TeacherDTO {
    id: number;
    name: string;
    maxHoursPerWeek: number;
    subject: SubjectDTO; 
    programs: ProgramDTO[]; 
}
  
  export interface ClassroomDTO {
    id: number;
    name: string;
    capacity: number;
    type: string;
  }
  
  export interface TimeSlotDTO {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
  }

  export interface Program {
    id: number;
    levelId: number;
    specialtyId?: number;
    name: string;
    programSubjects: ProgramSubject[];
    status?: string; // Optional, for soft deletion (e.g., 'Active', 'Deleted')
  }
  
  export interface ProgramSubject {
    id?: number;
    subjectId: number;
    hoursPerWeek: number;
    isCore: boolean;
  }