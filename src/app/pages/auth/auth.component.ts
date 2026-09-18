import { Component, inject, signal, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type AuthStep = 'phone' | 'pin' | 'forgot-pin' | 'register';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-root">

      <!-- ══════════════════════════════════════════════
           SPLASH — always on top, exits like a SHUTTER
           ══════════════════════════════════════════════ -->
      @if (showSplash()) {
        <div class="splash" [class.splash-shutter-open]="splashExiting()">

          <div class="splash-body animate-pop">
            <!-- Swiggy-style rounded-square app icon -->
            <div class="splash-icon-wrap">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="splash-icon-svg">
                <!-- Rounded square background -->
                <rect x="2" y="2" width="96" height="96" rx="24" ry="24" fill="white"/>
                <!-- Green F letter -->
                <path d="M32 28H64C66.2 28 68 29.8 68 32C68 34.2 66.2 36 64 36H40V50H58C60.2 50 62 51.8 62 54C62 56.2 60.2 58 58 58H40V76C40 78.2 38.2 80 36 80C33.8 80 32 78.2 32 76V28Z"
                      fill="#2E7D32"/>
                <!-- Leaf dot top-right -->
                <circle cx="68" cy="24" r="9" fill="#66BB6A"/>
                <circle cx="68" cy="24" r="5" fill="#C8E6C9"/>
              </svg>
            </div>

            <h1 class="splash-brand">FruitChat</h1>
            <p class="splash-sub">FRESH &bull; HEALTHY &bull; IN MINS</p>
          </div>


        </div>
      }

      <!-- ══════════════════════════════════════════════
           LANDING — renders BEHIND splash as it opens
           ══════════════════════════════════════════════ -->
      @if (showLanding()) {
        <div class="landing">
          <div class="landing-scroll-body">

            <!-- ── Top Header: F-Logo & Location Pill (No arrow) ── -->
            <header class="top-header">
              <div class="brand-logo" aria-label="FruitChat Logo">
                <svg viewBox="0 0 54 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="f-logo-svg">
                  <!-- Stem and bars of F with curved leaf top -->
                  <path d="M10 8C10 6.34315 11.3431 5 13 5H30C31.6569 5 33 6.34315 33 8C33 9.65685 31.6569 11 30 11H17V22H29C30.6569 22 32 23.3431 32 25C32 26.6569 30.6569 28 29 28H17V42C17 43.6569 15.6569 45 14 45C12.3431 45 11 43.6569 11 42V8Z" fill="#1E5E28"/>
                  <!-- Curved leaf flourishing from the top bar -->
                  <path d="M31 7C36 6.5 42 4.5 49 2C48 8 44 14.5 37 15C33.5 15.2 31.5 12 31 7Z" fill="#2E7D32"/>
                  <!-- Delicate leaf center vein -->
                  <path d="M32 8C37 7.5 43 5.5 47.5 3.5" stroke="#A5D6A7" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
              </div>

              <!-- Location Pill: Indore (Single Location, No Arrow) -->
              <div class="location-pill">
                <span class="loc-pin">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#E53935">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                  </svg>
                </span>
                <span class="loc-city">Indore</span>
              </div>
            </header>

            <!-- ── Hero Headings & Tagline Row (Perfect Alignment) ── -->
            <div class="hero-block">
              <div class="hero-meta-row">
                <span class="tagline">FRESH &bull; HEALTHY &bull; DELICIOUS</span>
                <span class="doodle-chip">
                  <span class="doodle-sparkle">~</span>
                  Good Food, Good Mood <span class="doodle-heart">💚</span>
                  <span class="doodle-sparkle">~</span>
                </span>
              </div>

              <h1 class="main-heading">
                One app for fresh fruits,<br>
                juices, bowls &amp; more <span class="mins-wrap">in mins!
                  <svg class="brush-svg" viewBox="0 0 110 12" fill="none">
                    <path d="M2 6C30 2 80 2 108 6" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
                  </svg>
                </span>
              </h1>
            </div>

            <!-- ── 4 Feature Highlight Badges ── -->
            <div class="features-row">
              <div class="feature-item">
                <div class="feature-icon-circle f-green">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                  </svg>
                </div>
                <span class="feature-label">Fresh<br>Ingredients</span>
              </div>

              <div class="feature-item">
                <div class="feature-icon-circle f-pink">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#E53935" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <span class="feature-label">Healthy<br>Choices</span>
              </div>

              <div class="feature-item">
                <div class="feature-icon-circle f-amber">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F57F17" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <span class="feature-label">Quick<br>Delivery</span>
              </div>

              <div class="feature-item">
                <div class="feature-icon-circle f-purple">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#7E57C2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <span class="feature-label">Safe &amp;<br>Hygienic</span>
              </div>
            </div>

            <!-- ── Hero Food Dish Card / Carousel ── -->
            <div class="dish-showcase">
              <div class="carousel">
                <!-- 100% Fresh Angled Sticker Badge -->
                <div class="fresh-sticker">
                  <span class="sticker-text">100% Fresh</span>
                  <span class="sticker-leaf">🌿</span>
                </div>

                <!-- Current slide -->
                <div class="slide slide-current">
                  <img [src]="photos[currentSlide()]" alt="FruitChat Fresh Food" class="slide-img"/>
                </div>

                <!-- Entering slide (Swiggy page-over) -->
                @if (enteringSlide() >= 0) {
                  <div class="slide slide-entering" (animationend)="onSlideEnd()">
                    <img [src]="photos[enteringSlide()]" alt="FruitChat Fresh Food" class="slide-img"/>
                  </div>
                }

                <!-- Dots indicator inside image bottom -->
                <div class="carousel-dots">
                  @for (p of photos; track $index) {
                    <div class="cdot" [class.cdot-active]="$index === currentSlide()"></div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- ── Bottom Action Dock (Sticky & Always Visible on Mini Mobile) ── -->
          <div class="bottom-action-dock" [class.dock-up]="landingCardUp()">
            <button type="button" class="login-pill-btn" id="login-btn" (click)="openActionSheet()">
              <span class="btn-text">Continue</span>
            </button>
          </div>
        </div>
      }

      <!-- ══════════════════════════════════════════════
           BOTTOM ACTION SHEET
           ══════════════════════════════════════════════ -->
      @if (showActionSheet()) {
        <div class="backdrop" (click)="closeActionSheet()" id="auth-backdrop">
          <div class="sheet" (click)="$event.stopPropagation()" id="auth-sheet">

            <div class="sheet-handle"></div>
            <button type="button" class="sheet-x" (click)="closeActionSheet()">✕</button>

            <!-- Banners -->
            @if (errorMessage()) {
              <div class="banner banner-err animate-shake">
                <span>⚠️</span><span>{{ errorMessage() }}</span>
              </div>
            }
            @if (successMessage()) {
              <div class="banner banner-ok">
                <span>✓</span><span>{{ successMessage() }}</span>
              </div>
            }

            <!-- ─── STEP: PHONE ─── -->
            @if (step() === 'phone') {
              <div class="step anim-in" id="step-phone">
                <div class="step-hd">
                  <h3 class="step-title">Login</h3>
                  <p class="step-sub">Enter your phone number to proceed</p>
                </div>

                <div class="phone-wrap">
                  <label class="phone-label">Phone Number</label>
                  <div class="phone-row" [class.phone-row-on]="phoneNumber.length > 0">
                    <div class="ccode">
                      <span class="ccode-flag">🇮🇳</span>
                      <span class="ccode-num">+91</span>
                      <span class="ccode-arr">▾</span>
                    </div>
                    <div class="pdivider"></div>
                    <input
                      type="tel"
                      class="pinput"
                      id="phone-input"
                      placeholder="Enter mobile number"
                      [(ngModel)]="phoneNumber"
                      maxlength="10"
                      inputmode="numeric"
                      (input)="onPhoneInput($event)"
                      autofocus
                    />
                  </div>
                </div>

                <button
                  type="button"
                  class="cta-btn"
                  id="continue-btn"
                  [class.cta-on]="phoneNumber.trim().length === 10 && !isLoading()"
                  [disabled]="phoneNumber.trim().length !== 10 || isLoading()"
                  (click)="checkPhone()"
                >
                  @if (isLoading()) { <div class="spinner"></div> }
                  @else { <span>Continue</span> }
                </button>

                <p class="sheet-terms">
                  By clicking, I accept the
                  <a href="javascript:void(0)">Privacy Policy</a>,
                  <a href="javascript:void(0)">FruitChat Terms of Use</a>
                </p>
              </div>
            }

            <!-- ─── STEP: PIN (existing user) ─── -->
            @if (step() === 'pin') {
              <div class="step anim-in" id="step-pin">
                <div class="pchip">
                  <span class="pchip-num">+91 {{ phoneNumber }}</span>
                  <button type="button" class="pchip-change" (click)="step.set('phone')">Change</button>
                </div>

                <div class="step-hd">
                  <h3 class="step-title">Enter 4-Digit Security PIN</h3>
                  <p class="step-sub">Welcome back, <strong>{{ existingUserName() || 'Fruit Lover' }}</strong>!</p>
                </div>

                <div class="pin-row" id="login-pin-row">
                  @for (digit of loginPinDigits; track $index; let i = $index) {
                    <input
                      #loginPinRef
                      type="password"
                      inputmode="numeric"
                      maxlength="1"
                      class="pbox"
                      [id]="'lpin-' + i"
                      [value]="digit"
                      [class.pbox-on]="digit !== ''"
                      (input)="onPinInput($event, i, 'login')"
                      (keydown)="onPinKeyDown($event, i, 'login')"
                    />
                  }
                </div>

                <button
                  type="button"
                  class="cta-btn cta-on"
                  id="login-btn-pin"
                  [disabled]="getPinStr('login').length !== 4 || isLoading()"
                  (click)="loginUser()"
                >
                  @if (isLoading()) { <div class="spinner"></div> }
                  @else { <span>Login Securely</span> }
                </button>

                <div class="fp-wrap">
                  <button type="button" class="fp-btn" id="forgot-pin-btn" (click)="goToForgotPin()">
                    🔑 Forgot PIN? Reset here
                  </button>
                </div>
              </div>
            }

            <!-- ─── STEP: FORGOT PIN ─── -->
            @if (step() === 'forgot-pin') {
              <div class="step anim-in" id="step-forgot">
                <div class="pchip">
                  <span class="pchip-num">+91 {{ phoneNumber }}</span>
                  <button type="button" class="pchip-change" (click)="step.set('pin')">Back</button>
                </div>

                <div class="step-hd">
                  <h3 class="step-title">Reset Security PIN</h3>
                  <p class="step-sub">Create a new 4-digit PIN for your account</p>
                </div>

                <div class="pin-field">
                  <label class="pin-label">Set New 4-Digit PIN</label>
                  <div class="pin-row" id="new-pin-row">
                    @for (digit of newPinDigits; track $index; let i = $index) {
                      <input
                        #newPinRef
                        type="password"
                        inputmode="numeric"
                        maxlength="1"
                        class="pbox"
                        [id]="'npin-' + i"
                        [value]="digit"
                        [class.pbox-on]="digit !== ''"
                        (input)="onPinInput($event, i, 'new')"
                        (keydown)="onPinKeyDown($event, i, 'new')"
                      />
                    }
                  </div>
                </div>

                <div class="pin-field">
                  <label class="pin-label">Confirm New 4-Digit PIN</label>
                  <div class="pin-row" id="confirm-pin-row">
                    @for (digit of confirmPinDigits; track $index; let i = $index) {
                      <input
                        #confirmPinRef
                        type="password"
                        inputmode="numeric"
                        maxlength="1"
                        class="pbox"
                        [id]="'cpin-' + i"
                        [value]="digit"
                        [class.pbox-on]="digit !== ''"
                        (input)="onPinInput($event, i, 'confirm')"
                        (keydown)="onPinKeyDown($event, i, 'confirm')"
                      />
                    }
                  </div>
                </div>

                <button
                  type="button"
                  class="cta-btn cta-on"
                  id="reset-pin-btn"
                  [disabled]="getPinStr('new').length !== 4 || getPinStr('confirm').length !== 4 || isLoading()"
                  (click)="submitResetPin()"
                >
                  @if (isLoading()) { <div class="spinner"></div> }
                  @else { <span>Reset PIN &amp; Continue</span> }
                </button>
              </div>
            }

            <!-- ─── STEP: REGISTER ─── -->
            @if (step() === 'register') {
              <div class="step reg-step anim-in" id="step-register">
                <div class="pchip">
                  <span class="pchip-num">+91 {{ phoneNumber }}</span>
                  <button type="button" class="pchip-change" (click)="step.set('phone')">Change</button>
                </div>

                <div class="step-hd">
                  <h3 class="step-title">Create Your Account</h3>
                  <p class="step-sub">Set up your profile &amp; security PIN</p>
                </div>

                <div class="reg-fields">
                  <!-- Name -->
                  <div class="rfield">
                    <label class="rlabel">Full Name</label>
                    <input type="text" class="rinput" id="reg-name" placeholder="e.g. Rahul Sharma" [(ngModel)]="registerName"/>
                  </div>

                  <!-- Set PIN boxes -->
                  <div class="rfield">
                    <label class="rlabel">Set 4-Digit Security PIN</label>
                    <div class="pin-row" id="reg-pin-row">
                      @for (digit of registerPinDigits; track $index; let i = $index) {
                        <input
                          #regPinRef
                          type="password"
                          inputmode="numeric"
                          maxlength="1"
                          class="pbox"
                          [id]="'rpin-' + i"
                          [value]="digit"
                          [class.pbox-on]="digit !== ''"
                          (input)="onPinInput($event, i, 'reg')"
                          (keydown)="onPinKeyDown($event, i, 'reg')"
                        />
                      }
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="cta-btn cta-on"
                  id="register-btn"
                  [disabled]="!canRegister() || isLoading()"
                  (click)="registerUser()"
                >
                  @if (isLoading()) { <div class="spinner"></div> }
                  @else { <span>Save Profile &amp; Start Ordering</span> }
                </button>
              </div>
            }

          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════
       ROOT
       ═══════════════════════════════════════════════ */
    .auth-root {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: #FAF8F5;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      color: #111827;
    }

    /* ═══════════════════════════════════════════════
       SPLASH SCREEN
       ═══════════════════════════════════════════════ */
    .splash {
      position: absolute;
      inset: 0;
      z-index: 500;               /* sits on top of landing */
      background: linear-gradient(180deg, #1A5C1F 0%, #2E7D32 50%, #1E6B27 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 0 0 44px;
      /* bottom shadow — gives "shutter casting shadow" feel */
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
    }

    /* ── SHUTTER OPEN: splash slides UP like a rolling shutter ── */
    .splash-shutter-open {
      animation: shutterOpen 0.72s cubic-bezier(0.5, 0, 0.75, 0) forwards;
    }

    @keyframes shutterOpen {
      0%   { transform: translateY(0);     }
      100% { transform: translateY(-100%); }
    }

    /* Logo area — vertically centered */
    .splash-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    /* Swiggy-style square icon on splash */
    .splash-icon-wrap {
      width: 110px;
      height: 110px;
      border-radius: 26px;
      filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.3));
      margin-bottom: 24px;
      /* subtle outer glow */
      box-shadow: 0 0 0 8px rgba(255,255,255,0.08);
    }

    .splash-icon-svg { width: 100%; height: 100%; border-radius: 24px; }

    .splash-brand {
      font-size: 38px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      margin: 0 0 10px;
      text-shadow: 0 2px 12px rgba(0,0,0,0.22);
    }

    .splash-sub {
      font-size: 12.5px;
      font-weight: 700;
      color: #A5D6A7;
      letter-spacing: 3.5px;
      text-transform: uppercase;
      margin: 0;
    }

    /* Pop in for splash logo */
    .animate-pop {
      animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }
    @keyframes popIn {
      from { transform: scale(0.55); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }

    /* ═══════════════════════════════════════════════
       LANDING SCREEN (Modern Fresh Light Aesthetic)
       ═══════════════════════════════════════════════ */
    .landing {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #FAF8F5;
      max-width: 480px;
      margin: 0 auto;
      height: 100%;
      height: 100dvh;
      overflow: hidden;
    }

    .landing-scroll-body {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: clamp(10px, 1.6vh, 16px) clamp(14px, 4vw, 20px) 0;
      display: flex;
      flex-direction: column;
      gap: 0;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    /* ── Top Header ── */
    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: max(4px, env(safe-area-inset-top));
    }

    .brand-logo {
      display: flex;
      align-items: center;
    }

    .f-logo-svg {
      width: 42px;
      height: 44px;
      filter: drop-shadow(0 2px 4px rgba(27, 94, 32, 0.12));
    }

    .location-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      padding: 6px 14px;
      border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.05);
      cursor: pointer;
      user-select: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      &:active { transform: scale(0.97); }
    }

    .loc-pin {
      display: flex;
      align-items: center;
    }

    .loc-city {
      font-size: 13.5px;
      font-weight: 700;
      color: #1F2937;
    }

    /* ── Hero Headings Block ── */
    .hero-block {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin: 4px 0 8px;
    }

    .hero-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .tagline {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 1.8px;
      color: #1E6E28;
      text-transform: uppercase;
      margin: 0;
      text-align: left;
    }

    .doodle-chip {
      font-family: 'Caveat', cursive, sans-serif;
      font-size: 14.5px;
      font-weight: 700;
      color: #2E7D32;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      user-select: none;
    }

    .doodle-sparkle {
      color: #4CAF50;
      font-size: 13px;
      font-weight: 900;
    }

    .doodle-heart {
      font-size: 13px;
      animation: heartbeat 2.2s infinite ease-in-out;
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      14% { transform: scale(1.22); }
      28% { transform: scale(1); }
      42% { transform: scale(1.18); }
    }

    .main-heading {
      font-size: clamp(21px, 5.8vw, 27px);
      font-weight: 900;
      color: #122818;
      line-height: 1.2;
      letter-spacing: -0.4px;
      margin: 0;
      text-align: left;
    }

    .green-highlight {
      color: #1B5E20;
    }

    .mins-wrap {
      position: relative;
      display: inline-block;
      white-space: nowrap;
    }

    .brush-svg {
      position: absolute;
      left: -2px;
      bottom: -3px;
      width: calc(100% + 4px);
      height: 7px;
      pointer-events: none;
    }

    /* ── Features Badges ── */
    .features-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin: 4px 0 8px;
      flex-shrink: 0;
    }

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 5px;
    }

    .feature-icon-circle {
      width: clamp(36px, 9.6vw, 44px);
      height: clamp(36px, 9.6vw, 44px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      transition: transform 0.18s ease;
      &:hover { transform: scale(1.05); }
    }

    .f-green  { background: #E8F5E9; border: 1.2px solid #C8E6C9; }
    .f-pink   { background: #FFEBEE; border: 1.2px solid #FFCDD2; }
    .f-amber  { background: #FFF8E1; border: 1.2px solid #FFE082; }
    .f-purple { background: #EDE7F6; border: 1.2px solid #D1C4E9; }

    .feature-label {
      font-size: clamp(9.5px, 2.6vw, 11px);
      font-weight: 700;
      color: #374151;
      line-height: 1.2;
      letter-spacing: -0.2px;
    }

    /* ── Dish Showcase / Carousel (Fills vertical space right to login) ── */
    .dish-showcase {
      position: relative;
      width: 100%;
      flex: 1;
      min-height: 240px;
      border-radius: 26px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      background: #E5E7EB;
      margin: 0 0 10px 0;
      display: flex;
    }

    .carousel {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .slide {
      position: absolute;
      inset: 0;
    }

    .slide-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }

    .slide-current {
      z-index: 1;
    }

    .slide-entering {
      z-index: 2;
      animation: slidePageOver 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes slidePageOver {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }

    .fresh-sticker {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 5;
      background: #1B5E20;
      color: #FFFFFF;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.2px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
      transform: rotate(-6deg);
      border: 1.5px solid rgba(255, 255, 255, 0.4);
    }

    .sticker-leaf {
      font-size: 12px;
    }

    .carousel-dots {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 6;
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .cdot {
      width: 6.5px;
      height: 6.5px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.65);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cdot-active {
      background: #1B5E20;
      width: 16px;
      border-radius: 9999px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
    }

    /* ── Sticky Bottom Action Dock (Clean, No Extra Gap) ── */
    .bottom-action-dock {
      position: sticky;
      bottom: 0;
      z-index: 20;
      background: linear-gradient(180deg, rgba(250, 248, 245, 0) 0%, rgba(250, 248, 245, 0.95) 20%, #FAF8F5 100%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 6px 18px max(18px, env(safe-area-inset-bottom));
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      flex-shrink: 0;
      animation: dockSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes dockSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .login-pill-btn {
      position: relative;
      overflow: hidden;
      width: 100%;
      max-width: 440px;
      height: 52px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #1B6E2C 0%, #155A22 100%);
      color: #FFFFFF;
      border: none;
      font-family: inherit;
      font-size: 17px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(22, 101, 52, 0.32);
      transition: transform 0.14s ease, box-shadow 0.2s ease;

      &::after {
        content: '';
        position: absolute;
        top: -60%;
        left: -80%;
        width: 50%;
        height: 220%;
        background: linear-gradient(
          60deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.35) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        transform: rotate(25deg);
        animation: btnShimmer 3s infinite ease-in-out;
        pointer-events: none;
      }

      &:active {
        transform: scale(0.98);
        box-shadow: 0 3px 10px rgba(22, 101, 52, 0.3);
      }
    }

    .btn-icon {
      display: inline-flex;
      align-items: center;
    }

    .user-icon {
      margin-right: -2px;
    }

    .arrow-icon {
      margin-left: 2px;
      transition: transform 0.2s ease;
    }

    .login-pill-btn:hover .arrow-icon {
      transform: translateX(3px);
    }

    @keyframes btnShimmer {
      0% {
        left: -80%;
      }
      35% {
        left: 140%;
      }
      100% {
        left: 140%;
      }
    }

    /* ═══════════════════════════════════════════════
       BOTTOM ACTION SHEET
       ═══════════════════════════════════════════════ */
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.62);
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 0.22s ease-out;
    }

    @media (min-width: 600px) {
      .backdrop { align-items: center; padding: 20px; }
    }

    .sheet {
      width: 100%;
      max-width: 440px;
      background: #FFFFFF;
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      padding: 14px 20px 32px;
      position: relative;
      animation: sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.28);
      max-height: 92vh;
      overflow-y: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    @media (min-width: 600px) {
      .sheet { border-radius: 24px; }
    }

    @keyframes sheetUp {
      from { transform: translateY(100%); opacity: 0.8; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .sheet-handle {
      width: 38px;
      height: 4px;
      background: #E5E7EB;
      border-radius: 4px;
      margin: 0 auto 14px;
    }

    .sheet-x {
      position: absolute;
      top: 14px;
      right: 16px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #F3F4F6;
      border: none;
      font-size: 14px;
      font-weight: 700;
      color: #6B7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:active { background: #E5E7EB; }
    }

    /* Step */
    .step { display: flex; flex-direction: column; }
    .reg-step {
      overflow-y: auto;
      max-height: 80vh;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .step-hd { margin-bottom: 18px; }
    .step-title { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 4px; }
    .step-sub   { font-size: 13.5px; color: #6B7280; margin: 0; }

    /* Banners */
    .banner {
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 12px;
    }
    .banner-err { background: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; }
    .banner-ok  { background: #D1FAE5; border: 1px solid #6EE7B7; color: #065F46; }

    /* Phone field */
    .phone-wrap { margin-bottom: 18px; }
    .phone-label {
      font-size: 11.5px;
      font-weight: 700;
      color: #6B7280;
      display: block;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }

    .phone-row {
      display: flex;
      align-items: center;
      background: #F9FAFB;
      border-bottom: 2.5px solid #D1D5DB;
      border-radius: 12px 12px 0 0;
      padding: 10px 12px;
      transition: border-color 0.2s, background 0.2s;
      &.phone-row-on, &:focus-within {
        border-color: #2E7D32;
        background: #F1F8E9;
      }
    }

    .ccode { display: flex; align-items: center; gap: 5px; padding-right: 10px; }
    .ccode-flag { font-size: 18px; }
    .ccode-num  { font-size: 15px; font-weight: 800; color: #111827; }
    .ccode-arr  { font-size: 10px; color: #6B7280; }
    .pdivider   { width: 1.5px; height: 22px; background: #D1D5DB; margin-right: 12px; }

    .pinput {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-family: inherit;
      font-size: 17px;
      font-weight: 800;
      color: #111827;
      letter-spacing: 1.5px;
      &::placeholder { font-size: 14px; font-weight: 500; color: #9CA3AF; letter-spacing: 0; }
    }

    /* CTA Button */
    .cta-btn {
      width: 100%;
      height: 50px;
      background: #D1D5DB;
      color: #9CA3AF;
      border: none;
      border-radius: 14px;
      font-family: inherit;
      font-size: 15.5px;
      font-weight: 800;
      cursor: not-allowed;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      margin-bottom: 14px;

      &.cta-on:not([disabled]) {
        background: #2E7D32;
        color: #FFFFFF;
        cursor: pointer;
        box-shadow: 0 5px 16px rgba(46,125,50,0.38);
        &:active { transform: scale(0.98); background: #1B5E20; }
      }
      &[disabled] { opacity: 0.55; cursor: not-allowed; }
    }

    .sheet-terms {
      font-size: 11px;
      color: #6B7280;
      text-align: center;
      margin: 0;
      line-height: 1.5;
      a { color: #111827; font-weight: 700; text-decoration: underline; }
    }

    /* Phone chip */
    .pchip {
      align-self: flex-start;
      background: #F3F4F6;
      border-radius: 20px;
      padding: 4px 6px 4px 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .pchip-num    { font-size: 12.5px; font-weight: 800; color: #1F2937; }
    .pchip-change {
      border: none;
      background: rgba(46,125,50,0.1);
      color: #2E7D32;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      padding: 3px 8px;
      border-radius: 14px;
      font-family: inherit;
      transition: background 0.15s;
      &:hover { background: rgba(46,125,50,0.18); }
    }

    /* PIN boxes */
    .pin-row {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin: 14px 0 20px;
    }

    .pbox {
      width: 60px;
      height: 64px;
      border-radius: 14px;
      border: 2px solid #E5E7EB;
      background: #F9FAFB;
      font-size: 26px;
      font-weight: 900;
      text-align: center;
      color: #111827;
      outline: none;
      transition: all 0.2s;
      font-family: inherit;
      caret-color: transparent;
      &:focus {
        border-color: #2E7D32;
        background: #FFFFFF;
        box-shadow: 0 0 0 4px rgba(46,125,50,0.14);
        transform: scale(1.06);
      }
      &.pbox-on {
        border-color: #2E7D32;
        background: #F1F8E9;
        box-shadow: 0 2px 8px rgba(46,125,50,0.15);
      }
    }

    .pin-field { margin-bottom: 4px; }
    .pin-label {
      font-size: 12px;
      font-weight: 700;
      color: #4B5563;
      display: block;
      text-align: center;
      margin-bottom: -6px;
    }

    /* Forgot PIN */
    .fp-wrap { display: flex; justify-content: center; margin-top: 2px; }
    .fp-btn {
      border: none;
      background: none;
      font-size: 13px;
      font-weight: 700;
      color: #2E7D32;
      cursor: pointer;
      padding: 7px 14px;
      border-radius: 10px;
      font-family: inherit;
      transition: background 0.15s;
      &:hover { background: #E8F5E9; }
    }

    /* Register fields */
    .reg-fields { display: flex; flex-direction: column; gap: 14px; margin-bottom: 18px; }
    .rfield { display: flex; flex-direction: column; gap: 6px; }
    .rlabel { font-size: 12px; font-weight: 700; color: #374151; }

    .rinput {
      height: 48px;
      border-radius: 12px;
      border: 1.5px solid #E5E7EB;
      background: #F9FAFB;
      padding: 0 14px;
      font-size: 14.5px;
      font-weight: 600;
      color: #111827;
      outline: none;
      font-family: inherit;
      transition: all 0.2s;
      &:focus { border-color: #2E7D32; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(46,125,50,0.12); }
    }

    /* Spinners */
    .spinner {
      width: 20px; height: 20px;
      border: 2.5px solid rgba(255,255,255,0.4);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .anim-in {
      animation: stepIn 0.28s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    @keyframes stepIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .animate-shake {
      animation: shake 0.35s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60%  { transform: translateX(-6px); }
      40%, 80%  { transform: translateX(6px); }
    }
  `]
})
export class AuthComponent implements OnInit, OnDestroy {
  private authService  = inject(AuthService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);

  @ViewChildren('loginPinRef')      loginPinRefs!:      QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('newPinRef')        newPinRefs!:        QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('confirmPinRef')    confirmPinRefs!:    QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('regPinRef')        regPinRefs!:        QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('regConfirmPinRef') regConfirmPinRefs!: QueryList<ElementRef<HTMLInputElement>>;

  /* ── Splash state ─────────────────────────────── */
  readonly showSplash    = signal<boolean>(true);
  readonly splashExiting = signal<boolean>(false);

  /* ── Landing state ────────────────────────────── */
  readonly showLanding    = signal<boolean>(false);
  readonly landingCardUp  = signal<boolean>(false);

  /* ── Carousel ─────────────────────────────────── */
  readonly photos = [
    'assets/images/fruit-bowl-hero.jpg',
    'assets/images/pineapple-chaat.jpg',
    'assets/images/mix-fruit-chaat.jpg',
    'assets/images/watermelon-chaat.jpg'
  ];
  readonly currentSlide  = signal<number>(0);
  readonly enteringSlide = signal<number>(-1);   // -1 = no transition

  /* ── Auth state ───────────────────────────────── */
  readonly showActionSheet = signal<boolean>(false);
  readonly step            = signal<AuthStep>('phone');
  readonly isLoading       = signal<boolean>(false);
  readonly errorMessage    = signal<string>('');
  readonly successMessage  = signal<string>('');
  readonly existingUserName = signal<string>('');

  /* ── Form values ──────────────────────────────── */
  phoneNumber          = '';
  loginPinDigits:      string[] = ['', '', '', ''];
  newPinDigits:        string[] = ['', '', '', ''];
  confirmPinDigits:    string[] = ['', '', '', ''];
  registerPinDigits:   string[] = ['', '', '', ''];
  regConfirmPinDigits: string[] = ['', '', '', ''];
  registerName   = '';

  /* ── Timers ───────────────────────────────────── */
  private splashTimer!:   ReturnType<typeof setTimeout>;
  private carouselTimer!: ReturnType<typeof setInterval>;

  /* ── Lifecycle ────────────────────────────────── */
  ngOnInit(): void {
    // Already logged in — navigate away before any animation
    if (this.authService.isLoggedIn()) {
      this.showSplash.set(false);
      setTimeout(() => this.navigateAfterLogin(), 0);
      return;
    }
    this.runSplashFlow();
  }

  ngOnDestroy(): void {
    clearTimeout(this.splashTimer);
    clearInterval(this.carouselTimer);
  }

  /* ── Splash → Landing flow ────────────────────── */
  private runSplashFlow(): void {
    // Quick brand splash (1.4s), then smooth shutter exit
    this.splashTimer = setTimeout(() => {
      this.splashExiting.set(true);  // shutter starts sliding up
      this.showLanding.set(true);    // landing renders underneath

      setTimeout(() => {
        this.showSplash.set(false);
        this.landingCardUp.set(true);
        setTimeout(() => this.startCarousel(), 400);
      }, 600);
    }, 1400);
  }

  /* ── Carousel ─────────────────────────────────── */
  private startCarousel(): void {
    this.carouselTimer = setInterval(() => {
      if (this.enteringSlide() >= 0) return; // busy — skip
      const next = (this.currentSlide() + 1) % this.photos.length;
      this.enteringSlide.set(next);
    }, 3000);
  }

  /** Called when the entering slide's CSS animation finishes */
  onSlideEnd(): void {
    this.currentSlide.set(this.enteringSlide());
    this.enteringSlide.set(-1);
  }

  /* ── Action sheet ─────────────────────────────── */
  openActionSheet(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showActionSheet.set(true);
  }

  closeActionSheet(): void {
    this.showActionSheet.set(false);
    this.errorMessage.set('');
  }

  /* ── Phone input ──────────────────────────────── */
  onPhoneInput(event: Event): void {
    const inp = event.target as HTMLInputElement;
    inp.value       = inp.value.replace(/\D/g, '').slice(0, 10);
    this.phoneNumber = inp.value;
    this.errorMessage.set('');
    if (this.phoneNumber.length === 10) {
      setTimeout(() => this.checkPhone(), 120);
    }
  }

  async checkPhone(): Promise<void> {
    const phone = this.phoneNumber.trim();
    if (!/^\d{10}$/.test(phone)) {
      this.errorMessage.set('Please enter a valid 10-digit mobile number.');
      return;
    }
    this.errorMessage.set('');
    this.isLoading.set(true);
    try {
      const user = await this.authService.checkUser(phone);
      if (user) {
        this.existingUserName.set(user.name || 'Fruit Lover');
        this.loginPinDigits = ['', '', '', ''];
        this.step.set('pin');
        setTimeout(() => this.focusPin(0, 'login'), 160);
      } else {
        this.step.set('register');
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Network error. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /* ── PIN boxes ────────────────────────────────── */
  onPinInput(event: Event, index: number, type: string): void {
    const inp  = event.target as HTMLInputElement;
    const val  = inp.value.replace(/\D/g, '');
    const arr  = this.pinArr(type);
    arr[index] = val ? val[val.length - 1] : '';
    this.errorMessage.set('');

    if (val && index < 3) this.focusPin(index + 1, type);

    // Auto-submit login
    if (type === 'login' && this.getPinStr('login').length === 4) {
      setTimeout(() => this.loginUser(), 120);
    }
  }

  onPinKeyDown(event: KeyboardEvent, index: number, type: string): void {
    const arr = this.pinArr(type);
    if (event.key === 'Backspace' && !arr[index] && index > 0) {
      arr[index - 1] = '';
      this.focusPin(index - 1, type);
    }
  }

  private focusPin(index: number, type: string): void {
    const map: Record<string, QueryList<ElementRef<HTMLInputElement>>> = {
      'login':       this.loginPinRefs,
      'new':         this.newPinRefs,
      'confirm':     this.confirmPinRefs,
      'reg':         this.regPinRefs,
      'reg-confirm': this.regConfirmPinRefs,
    };
    const el = map[type]?.toArray()[index];
    if (el) el.nativeElement.focus();
  }

  getPinStr(type: string): string {
    return this.pinArr(type).join('');
  }

  private pinArr(type: string): string[] {
    const map: Record<string, string[]> = {
      'login':       this.loginPinDigits,
      'new':         this.newPinDigits,
      'confirm':     this.confirmPinDigits,
      'reg':         this.registerPinDigits,
      'reg-confirm': this.regConfirmPinDigits,
    };
    return map[type] ?? this.loginPinDigits;
  }

  /* ── Login ────────────────────────────────────── */
  async loginUser(): Promise<void> {
    const pin = this.getPinStr('login');
    if (pin.length !== 4) return;
    this.errorMessage.set('');
    this.isLoading.set(true);
    try {
      await this.authService.loginWithPin(this.phoneNumber, pin);
      this.successMessage.set('Logged in successfully!');
      setTimeout(() => this.navigateAfterLogin(), 500);
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Incorrect PIN. Please try again.');
      this.loginPinDigits = ['', '', '', ''];
      setTimeout(() => this.focusPin(0, 'login'), 100);
    } finally {
      this.isLoading.set(false);
    }
  }

  /* ── Forgot PIN ───────────────────────────────── */
  goToForgotPin(): void {
    this.errorMessage.set('');
    this.newPinDigits     = ['', '', '', ''];
    this.confirmPinDigits = ['', '', '', ''];
    this.step.set('forgot-pin');
    setTimeout(() => this.focusPin(0, 'new'), 160);
  }

  async submitResetPin(): Promise<void> {
    const newPin = this.getPinStr('new');
    const conf   = this.getPinStr('confirm');
    if (newPin.length !== 4) { this.errorMessage.set('Please enter a 4-digit PIN.'); return; }
    if (newPin !== conf)      { this.errorMessage.set('PINs do not match. Please re-enter.'); return; }
    this.errorMessage.set('');
    this.isLoading.set(true);
    try {
      await this.authService.setNewPin(this.phoneNumber, newPin);
      this.successMessage.set('PIN reset! Logging you in...');
      setTimeout(() => this.navigateAfterLogin(), 600);
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Unable to reset PIN. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /* ── Register ─────────────────────────────────── */
  canRegister(): boolean {
    const pin = this.getPinStr('reg');
    return !!this.registerName.trim() && pin.length === 4;
  }

  async registerUser(): Promise<void> {
    if (!this.registerName.trim()) { this.errorMessage.set('Please enter your full name.'); return; }
    const pin = this.getPinStr('reg');
    if (pin.length !== 4) { this.errorMessage.set('Please set a 4-digit security PIN.'); return; }

    this.errorMessage.set('');
    this.isLoading.set(true);
    try {
      await this.authService.registerUser({ phone: this.phoneNumber, name: this.registerName, pin });
      this.successMessage.set('Account created successfully!');
      setTimeout(() => this.navigateAfterLogin(), 600);
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Failed to create account. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /* ── Navigate ─────────────────────────────────── */
  private navigateAfterLogin(): void {
    if (this.authService.currentUser()?.role === 'admin') {
      this.router.navigateByUrl('/admin/login');
      return;
    }
    const url = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.router.navigateByUrl(url);
  }
}
