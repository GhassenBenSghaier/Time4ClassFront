import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CentralAdminGuard } from '../CentralAdminGuard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';
import { UsersListComponent } from './users-list/users-list.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { LoginComponent } from './login/login.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { ProfilesListComponent } from './profiles-list/profiles-list.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ViewCalendarComponent } from './view-calendar/view-calendar.component';
import { NewTimetablesComponent } from './new-timetables/new-timetables.component';
import { ProgramCreationComponent } from './program-creation/program-creation.component';
import { ProgramsListComponent } from './programs-list/programs-list.component';
import { ProgramDetailsComponent } from './program-details/program-details.component';
import { TimetableManagerComponent } from './timetable-manager/timetable-manager.component';
import { SchoolListComponent } from './school-list/school-list.component';
import { SchoolDetailsComponent } from './school-details/school-details.component';
import { ClassroomListComponent } from './classroom-list/classroom-list.component';
import { ClassroomDetailsComponent } from './classroom-details/classroom-details.component';
import { SubjectListComponent } from './subject-list/subject-list.component';
import { SubjectDetailsComponent } from './subject-details/subject-details.component';
import { SpecialtyListComponent } from './specialty-list/specialty-list.component';
import { SpecialtyDetailsComponent } from './specialty-details/specialty-details.component';
import { LevelListComponent } from './level-list/level-list.component';
import { LevelDetailsComponent } from './level-details/level-details.component';
import { ClassListComponent } from './class-list/class-list.component';
import { ClassDetailsComponent } from './class-details/class-details.component';
import { TimeSlotListComponent } from './time-slot-list/time-slot-list.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UsersListComponent },
  { path: 'users/add', component: AddUserComponent },
  { path: 'users/edit/:id', component: EditUserComponent },
  { path: 'users/details/:id', component: UserDetailsComponent },
  { path: 'new_timetables', component: NewTimetablesComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'view-calendar', component: ViewCalendarComponent },
  { path: 'profiles', component: ProfilesComponent, canActivate: [CentralAdminGuard] },
  { path: 'profiles-list', component: ProfilesListComponent, canActivate: [CentralAdminGuard] },
  { path: 'profiles/edit/:id', component: ProfileEditComponent, canActivate: [CentralAdminGuard] },
  { path: 'profiles/details/:id', component: ProfileDetailsComponent, canActivate: [CentralAdminGuard] },
  { path: 'programs', component: ProgramsListComponent },
  { path: 'programs/add', component: ProgramCreationComponent },
  { path: 'programs/edit/:id', component: ProgramCreationComponent },
  { path: 'programs/details/:id', component: ProgramDetailsComponent },
  { path: 'timetable_manager', component: TimetableManagerComponent },
  { path: 'schools-list', component: SchoolListComponent },
  { path: 'schools/details/:id', component: SchoolDetailsComponent },
  { path: 'classrooms-list', component: ClassroomListComponent },
  { path: 'classrooms/details/:id', component: ClassroomDetailsComponent },
  { path: 'subjects-list', component: SubjectListComponent },
  { path: 'subjects/details/:id', component: SubjectDetailsComponent },
  { path: 'specialties-list', component: SpecialtyListComponent },
  { path: 'specialties/details/:id', component: SpecialtyDetailsComponent },
  { path: 'levels-list', component: LevelListComponent },
  { path: 'levels/details/:id', component: LevelDetailsComponent },
  { path: 'classes-list', component: ClassListComponent },
  { path: 'classes/details/:id', component: ClassDetailsComponent },
  { path: 'timeslot-list', component: TimeSlotListComponent },

];

@NgModule({
  declarations: [
    DashboardComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminFooterComponent,
    UsersListComponent,
    AddUserComponent,
    EditUserComponent,
    UserDetailsComponent,
    LoginComponent,
    ProfilesComponent,
    ProfilesListComponent,
    ProfileEditComponent,
    ProfileDetailsComponent,
    CalendarComponent,
    ViewCalendarComponent,
    NewTimetablesComponent,
    ProgramCreationComponent,
    ProgramsListComponent,
    ProgramDetailsComponent,
    TimetableManagerComponent,
    SchoolListComponent,
    SchoolDetailsComponent,
    ClassroomListComponent,
    ClassroomDetailsComponent,
    SubjectListComponent,
    SubjectDetailsComponent,
    SpecialtyListComponent,
    SpecialtyDetailsComponent,
    LevelListComponent,
    LevelDetailsComponent,
    ClassListComponent,
    ClassDetailsComponent,
    TimeSlotListComponent

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    FullCalendarModule
  ]
})
export class AdminModule {}