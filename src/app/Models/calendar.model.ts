

export interface SchoolCalendar {
  schoolYear: string;
  startDate: string;
  endDate: string;
  divisionType: 'semesters' | 'trimesters';
  divisions?: { startDate: string; endDate: string }[];
  holidays?: Holiday[];
  examPeriods?: ExamPeriod[];
  events?: Event[];
  milestones?: Milestone[];
}

export interface Holiday {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface ExamPeriod {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Event {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Milestone {
  id?: number;
  name: string;
  date: string;
  description?: string;
}