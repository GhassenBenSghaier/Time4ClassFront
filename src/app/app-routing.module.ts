// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { HomeComponent } from './components/home/home.component'; // New component
// import { RegisterComponent } from './register/register.component';
// import { LoginComponent } from './login/login.component';

// const routes: Routes = [
//   { path: '', component: HomeComponent }, // Default to HomeComponent
//   { path: 'register', component: RegisterComponent },
//   { path: 'login', component: LoginComponent },
//   { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './register/register.component';
import { NewLoginComponent } from './new-login/new-login.component'; 
import { AuthGuard } from './auth.guard';
import { StudentSpaceComponent } from './student-space/student-space.component';
import { TeacherSpaceComponent } from './teacher-space/teacher-space.component';
import { StudentGuard } from './student.guard';
import { TeacherGuard } from './teacher.guard';
import { AccessDeniedComponent } from './access-denied/access-denied.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: NewLoginComponent }, 
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard] },
  { path: 'student-space',canActivate: [StudentGuard],  component: StudentSpaceComponent }, 
  { path: 'teacher-space',canActivate: [TeacherGuard], component: TeacherSpaceComponent },  
  { path: 'access-denied', component: AccessDeniedComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}