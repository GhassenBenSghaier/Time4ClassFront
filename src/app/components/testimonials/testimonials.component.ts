import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent {
  testimonials = [
    { name: 'Mr. Karim Jlassi', role: 'School Administrator', quote: 'Managing staff and rooms is a breeze now.', img: '/assets/images/img/testimonials/testimonials-4.jpg' },
    { name: 'Ms. Amina Ben Salem', role: 'Math Teacher', quote: 'Time4Class makes scheduling classes so easy!', img: '/assets/images/img/testimonials/testimonials-2.jpg' },
    { name: 'Sara Trabelsi', role: 'High School Student', quote: 'I love seeing my timetable clearly!', img: '/assets/images/img/testimonials/testimonials-3.jpg' },
    { name: 'Dr. Hedi Gharbi', role: 'Principal', quote: 'A game-changer for school organization.', img: '/assets/images/img/testimonials/testimonials-1.jpg' },
    { name: 'Ali Zouaoui', role: 'Parent', quote: 'Helps me track my child’s schedule.', img: '/assets/images/img/testimonials/testimonials-5.jpg' }
  ];

  currentIndex = 0;
  autoSlideInterval: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  nextTestimonial() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => this.nextTestimonial(), 5000); // 5s like Swiper
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  @HostListener('swiperight')
  onSwipeRight() {
    this.prevTestimonial();
    this.resetAutoSlide();
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.nextTestimonial();
    this.resetAutoSlide();
  }

  resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  goToTestimonial(index: number) {
    this.currentIndex = index;
    this.resetAutoSlide();
  }
}