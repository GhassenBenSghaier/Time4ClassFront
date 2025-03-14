import { TestBed } from '@angular/core/testing';

import { TimetablesService } from './timetables.service';

describe('TimetablesService', () => {
  let service: TimetablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimetablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
