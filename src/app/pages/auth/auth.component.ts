import { Component, inject, signal, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type AuthStep = 'splash' | 'onboarding' | 'login' | 'signup' | 'verify';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  private authService  = inject(AuthService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);

  @ViewChildren('pinRef') pinRefs!: QueryList<ElementRef<HTMLInputElement>>;

  readonly step = signal<AuthStep>('splash');
  readonly authMode = signal<'login' | 'signup'>('login');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  /* -- Carousel -- */
  readonly photos = [
    'assets/images/auth-slide-fruit-bowl.jpg',
    'assets/images/fresh-juice.jpg',
    'assets/images/auth-slide-sprouts.jpg'
  ];
  readonly carouselTitles = [
    'Fresh Fruits, Naturally Good',
    'Healthy Juices for a Better You',
    'Bowls, Sprouts & More'
  ];
  readonly carouselDesc = [
    'Farm fresh fruits, handpicked for your health & happiness.',
    'Packed with nutrients, made fresh daily.',
    'Wholesome meals to keep you energized all day.'
  ];
  readonly currentSlide = signal<number>(0);
  private carouselTimer!: ReturnType<typeof setInterval>;
  private splashTimer!: ReturnType<typeof setTimeout>;

  /* -- Form -- */
  phoneNumber = '';
  fullName = '';
  pinDigits = ['', '', '', ''];

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      setTimeout(() => this.navigateAfterLogin(), 0);
      return;
    }
    this.splashTimer = setTimeout(() => {
      this.step.set('onboarding');
      this.startCarousel();
    }, 2000);
  }

  ngOnDestroy() {
    clearTimeout(this.splashTimer);
    clearInterval(this.carouselTimer);
  }

  private startCarousel() {
    this.carouselTimer = setInterval(() => {
      if (this.step() !== 'onboarding') {
        clearInterval(this.carouselTimer);
        return;
      }
      this.currentSlide.set((this.currentSlide() + 1) % this.photos.length);
    }, 3000);
  }

  nextSlide() {
    if (this.currentSlide() < this.photos.length - 1) {
      this.currentSlide.set(this.currentSlide() + 1);
    } else {
      this.skipOnboarding();
    }
  }

  skipOnboarding() {
    clearInterval(this.carouselTimer);
    this.step.set('login');
  }

  goToSignup() {
    this.errorMessage.set('');
    this.authMode.set('signup');
    this.step.set('signup');
  }

  goToLogin() {
    this.errorMessage.set('');
    this.authMode.set('login');
    this.step.set('login');
  }

  async submitPhoneForm() {
    const phone = this.phoneNumber.trim();
    if (phone.length !== 10) {
      this.errorMessage.set('Enter a valid 10-digit mobile number.');
      return;
    }
    if (this.authMode() === 'signup' && !this.fullName.trim()) {
      this.errorMessage.set('Enter your full name.');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);
    try {
      const user = await this.authService.checkUser(phone);
      if (this.authMode() === 'login') {
        if (!user) {
          this.errorMessage.set('Account not found. Please sign up.');
        } else {
          this.step.set('verify');
          window.scrollTo(0, 0);
          setTimeout(() => this.focusPin(0), 100);
        }
      } else {
        if (user) {
          this.errorMessage.set('Account already exists. Please login.');
        } else {
          this.step.set('verify');
          window.scrollTo(0, 0);
          setTimeout(() => this.focusPin(0), 100);
        }
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Error checking account.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onPinInput(event: Event, index: number) {
    const inp = event.target as HTMLInputElement;
    const val = inp.value.replace(/\D/g, '');
    this.pinDigits[index] = val ? val[val.length - 1] : '';
    this.errorMessage.set('');

    if (val && index < 3) this.focusPin(index + 1);

    if (this.getPinStr().length === 4) {
      setTimeout(() => this.verifyPin(), 100);
    }
  }

  onPinKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.pinDigits[index] && index > 0) {
      this.pinDigits[index - 1] = '';
      this.focusPin(index - 1);
    }
  }

  private focusPin(index: number) {
    const el = this.pinRefs.toArray()[index];
    if (el) el.nativeElement.focus();
  }

  getPinStr() {
    return this.pinDigits.join('');
  }

  async verifyPin() {
    const pin = this.getPinStr();
    if (pin.length !== 4) return;

    this.errorMessage.set('');
    this.isLoading.set(true);
    try {
      if (this.authMode() === 'login') {
        await this.authService.loginWithPin(this.phoneNumber, pin);
        this.successMessage.set('Logged in successfully!');
      } else {
        await this.authService.registerUser({
          phone: this.phoneNumber,
          name: this.fullName,
          pin
        });
        this.successMessage.set('Account created successfully!');
      }
      setTimeout(() => this.navigateAfterLogin(), 600);
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Verification failed.');
      this.pinDigits = ['', '', '', ''];
      setTimeout(() => this.focusPin(0), 100);
    } finally {
      this.isLoading.set(false);
    }
  }

  private navigateAfterLogin() {
    if (this.authService.currentUser()?.role === 'admin') {
      this.router.navigateByUrl('/admin/login');
      return;
    }
    const url = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.router.navigateByUrl(url);
  }
}
