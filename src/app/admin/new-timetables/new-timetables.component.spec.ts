import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTimetablesComponent } from './new-timetables.component';

describe('NewTimetablesComponent', () => {
  let component: NewTimetablesComponent;
  let fixture: ComponentFixture<NewTimetablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewTimetablesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTimetablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
