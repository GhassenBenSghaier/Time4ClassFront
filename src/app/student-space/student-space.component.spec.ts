import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSpaceComponent } from './student-space.component';

describe('StudentSpaceComponent', () => {
  let component: StudentSpaceComponent;
  let fixture: ComponentFixture<StudentSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentSpaceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
