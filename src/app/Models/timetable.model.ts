export interface School {
  id: number;
  name: string;
  region: string; 
  type: string; 
}

export interface Program {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface CapacityRequest {
  schoolId: number;
  desiredClasses: { [programId: number]: number };
}

export interface ConstraintCheck {
  required: number;
  available: number;
  satisfied: boolean;
}

export interface CapacityResponse {
  schoolId: number;
  feasible: boolean;
  maxClasses: { [programId: number]: number };
  teacherConstraints: { [subjectId: number]: ConstraintCheck };
  roomConstraints: { [roomType: string]: ConstraintCheck };
  slotConstraint: ConstraintCheck;
  classCountConstraint: ConstraintCheck;
  message: string;
}

export interface GenerateTimetableRequest {
  schoolId: number;
  programClassCounts: { [programId: number]: number };
}

export interface ClassDTO {
  id: number;
  schoolId: number;
  programId: number;
  name: string;
  studentCount: number;
  actualStudentCount?: number;
}

export interface SubjectDTO {
  id: number;
  name: string;
  defaultHoursPerWeek?: number;
  roomType?: string; 
}

export interface ProgramDTO {
  id: number;
  name: string;
  levelId?: number | null;
  specialtyId?: number | null;
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
  schoolId: number;
  name: string;
  capacity: number;
  type: string;
}

export interface TimeSlotDTO {
  id: number;
  schoolId: number;
  day: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleDTO {
  id: number;
  classEntity: ClassDTO;
  subject: SubjectDTO;
  teacher: TeacherDTO;
  classroom: ClassroomDTO;
  timeSlot: TimeSlotDTO;
}

export interface TimetableDTO {
  id: number;
  schoolId: number;
  status: string;
  generatedAt: string;
  schedules: ScheduleDTO[];
}

export interface Level {
  id?: number;
  name: string;
  supportsSpecialty: boolean;
}

export interface Specialty {
  id?: number;
  name: string;
  levelId: number;
}

