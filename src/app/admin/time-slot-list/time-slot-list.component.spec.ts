import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSlotListComponent } from './time-slot-list.component';

describe('TimeSlotListComponent', () => {
  let component: TimeSlotListComponent;
  let fixture: ComponentFixture<TimeSlotListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeSlotListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSlotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
