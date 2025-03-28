export interface User {
  id?: number;
  username: string;
  password?: string;
  role: string; // "CENTRAL_ADMIN", "LOCAL_ADMIN", "TEACHER", "STUDENT"
  profileCode?: string; 
  profile?: { 
    code: string;
    designation: string;
  };
  email: string;
  status: string;
  firstName: string;
  lastName: string;
  birthdate?: string; // ISO date string (e.g., "2000-01-01")
  gender?: string;
  address?: string;
  phoneNumber?: string;

  // CentralAdmin-specific fields
  department?: string;
  accessLevel?: string;
  employeeId?: string;
  hireDate?: string;

  // LocalAdmin-specific fields
  schoolName?: string;
  adminCode?: string;

  // Teacher-specific fields
  subjectSpecialization?: string;
  qualification?: string;
  teacherRank?: string;
  schoolNameTeacher?: string; 

  // Student-specific fields
  studentId?: string;
  enrollmentDate?: string;
  gradeLevel?: string;
  schoolClass?: string;
  parentName?: string;
  parentContact?: string;
  previousSchool?: string;
  medicalConditions?: string;
  studentStatus?: string;
  schoolNameStudent?: string; 
}