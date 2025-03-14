import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';
import { UsersListComponent } from './users-list/users-list.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AdminGuard } from '../admin.guard';
import { TimetablesComponent } from './timetables/timetables.component';
import { MatTableModule } from '@angular/material/table';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UsersListComponent },
  { path: 'users/add', component: AddUserComponent },
  { path: 'users/edit/:id', component: EditUserComponent },
  { path: 'timetables', component: TimetablesComponent },

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
    TimetablesComponent
    
  ],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule, MatTableModule],
})
export class AdminModule {}