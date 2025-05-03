import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimetableManagerComponent } from './timetable-manager.component';

describe('TimetableManagerComponent', () => {
  let component: TimetableManagerComponent;
  let fixture: ComponentFixture<TimetableManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimetableManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimetableManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
