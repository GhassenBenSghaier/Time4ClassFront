import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';
import { UsersListComponent } from './users-list/users-list.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { TimetablesComponent } from './timetables/timetables.component';
import { MatTableModule } from '@angular/material/table';
import { LoginComponent } from './login/login.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { ProfilesListComponent } from './profiles-list/profiles-list.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { CentralAdminGuard } from '../CentralAdminGuard';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UsersListComponent },
  { path: 'users/add', component: AddUserComponent },
  { path: 'users/edit/:id', component: EditUserComponent },
  { path: 'users/details/:id', component: UserDetailsComponent },
  { path: 'timetables', component: TimetablesComponent },
  { path: 'profiles', component: ProfilesComponent, canActivate: [CentralAdminGuard] },
  { path: 'profiles-list', component: ProfilesListComponent, canActivate: [CentralAdminGuard] },
  { path: 'profiles/edit/:id', component: ProfileEditComponent, canActivate: [CentralAdminGuard] },
  { path: 'profiles/details/:id', component: ProfileDetailsComponent, canActivate: [CentralAdminGuard] },
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
    TimetablesComponent,
    LoginComponent,
    ProfilesComponent,
    ProfilesListComponent,
    ProfileEditComponent,
    ProfileDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatTableModule
  ],
})
export class AdminModule {}