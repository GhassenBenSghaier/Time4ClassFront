import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AboutUSComponent } from './components/about-us/about-us.component';
import { WhyUsComponent } from './components/why-us/why-us.component';
import { StatsComponent } from './components/stats/stats.component';
import { CtaComponent } from './components/cta/cta.component';
import { ServicesComponent } from './components/services/services.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { ContactComponent } from './components/contact/contact.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { TeamComponent } from './components/team/team.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './auth.service';
import { MatCardModule } from '@angular/material/card';
import { matSnackBarAnimations } from '@angular/material/snack-bar';
import { NewLoginComponent } from './new-login/new-login.component';
import { StudentSpaceComponent } from './student-space/student-space.component';
import { TeacherSpaceComponent } from './teacher-space/teacher-space.component';
import { TimetablesComponent } from './admin/timetables/timetables.component';

import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    WelcomeComponent,
    AboutUSComponent,
    WhyUsComponent,
    StatsComponent,
    CtaComponent,
    ServicesComponent,
    TestimonialsComponent,
    ContactComponent,
    PortfolioComponent,
    TeamComponent,
    CalendarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    NewLoginComponent,
    StudentSpaceComponent,
    TeacherSpaceComponent,
    
    AccessDeniedComponent
    

    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FullCalendarModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
