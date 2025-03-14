import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TimetablesService } from 'src/app/timetables.service';
import { ChangeDetectorRef } from '@angular/core';
import { TimetablesComponent } from './timetables.component';

describe('TimetablesComponent', () => {
  let fixture: ComponentFixture<TimetablesComponent>;
  let component: TimetablesComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatTableModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
      declarations: [TimetablesComponent],
      providers: [
        TimetablesService,
        { provide: ChangeDetectorRef, useValue: { detectChanges: jasmine.createSpy('detectChanges') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimetablesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty timetables', () => {
    expect(component.dataSources.length).toBe(0);
  });

  it('should fetch and display multiple timetables when generateSchedules is called', () => {
    const mockTimetables = [
      [
        {
          id: null,
          teacher: { name: 'Teacher 1' },
          classroom: { id: 1, name: 'Room A' },
          subject: { name: 'Math' },
          day: 'Monday',
          timeSlot: '08:00 - 10:00',
          schoolClass: null,
        },
      ],
      [
        {
          id: null,
          teacher: { name: 'Teacher 2' },
          classroom: { id: 2, name: 'Room B' },
          subject: { name: 'Science' },
          day: 'Tuesday',
          timeSlot: '10:00 - 12:00',
          schoolClass: null,
        },
      ],
    ];

    component.generateSchedules();

    const req = httpMock.expectOne('http://localhost:8081/api/schedule/generate?numClasses=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockTimetables);

    expect(component.dataSources.length).toBe(2); // Two timetables
    expect(component.dataSources[0].data.length).toBe(5); // 5 days per timetable
    expect(component.dataSources[0].data[0]['08:00 - 10:00']).toContain('Math');
    expect(component.dataSources[1].data[1]['10:00 - 12:00']).toContain('Science');
  });

  it('should render table headers for the selected timetable', () => {
    const mockTimetables = [
      [
        {
          id: null,
          teacher: { name: 'Teacher 1' },
          classroom: { id: 1, name: 'Room A' },
          subject: { name: 'Math' },
          day: 'Monday',
          timeSlot: '08:00 - 10:00',
          schoolClass: null,
        },
      ],
    ];

    component.generateSchedules();
    const req = httpMock.expectOne('http://localhost:8081/api/schedule/generate?numClasses=10');
    req.flush(mockTimetables);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const headers = compiled.querySelectorAll('th');
    expect(headers.length).toBe(5); // day + 4 time slots
    expect(headers[0].textContent).toContain('Day');
    expect(headers[1].textContent).toContain('08:00 - 10:00');
    expect(headers[2].textContent).toContain('10:00 - 12:00');
    expect(headers[3].textContent).toContain('14:00 - 16:00');
    expect(headers[4].textContent).toContain('16:00 - 18:00');
  });
});