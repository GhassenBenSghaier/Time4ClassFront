import { TestBed } from '@angular/core/testing';

import { TimetableProgramService } from './timetable-program.service';

describe('TimetableProgramService', () => {
  let service: TimetableProgramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimetableProgramService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
