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

          <!-- ── Green showcase area ── -->
          <div class="showcase">

            <!-- Swiggy-style rounded-square badge icon -->
            <div class="showcase-badge">
              <svg viewBox="0 0 100 100" fill="none" class="badge-svg">
                <rect x="2" y="2" width="96" height="96" rx="24" ry="24" fill="white"/>
                <path d="M32 28H64C66.2 28 68 29.8 68 32C68 34.2 66.2 36 64 36H40V50H58C60.2 50 62 51.8 62 54C62 56.2 60.2 58 58 58H40V76C40 78.2 38.2 80 36 80C33.8 80 32 78.2 32 76V28Z"
                      fill="#2E7D32"/>
                <circle cx="68" cy="24" r="9" fill="#66BB6A"/>
                <circle cx="68" cy="24" r="5" fill="#C8E6C9"/>
              </svg>
            </div>

            <!-- Heading -->
            <h2 class="showcase-heading">
              One app for fresh fruits,<br>juices, bowls and more in mins!
            </h2>

            <!-- ── PHOTO CAROUSEL (Swiggy page-over style) ── -->
            <div class="carousel">
              <!-- Current slide (stationary) -->
              <div class="slide slide-current">
                <img [src]="photos[currentSlide()]" alt="FruitChat food" class="slide-img"/>
              </div>

              <!-- Entering slide (slides OVER current from right) -->
              @if (enteringSlide() >= 0) {
                <div class="slide slide-entering" (animationend)="onSlideEnd()">
                  <img [src]="photos[enteringSlide()]" alt="FruitChat food" class="slide-img"/>
                </div>
              }

              <!-- 100% Fresh badge overlay on photo -->
              <div class="slide-badge">
                <span>🌿</span>
                <span class="slide-badge-text">100% Farm Fresh &amp; Pure</span>
              </div>

              <!-- Dot indicators -->
              <div class="carousel-dots">
                @for (p of photos; track $index) {
                  <div class="cdot" [class.cdot-active]="$index === currentSlide()"></div>
                }
              </div>
            </div>
          </div>

          <!-- ── Bottom white card — slides up like Swiggy ── -->
          <div class="lcard" [class.lcard-up]="landingCardUp()">
            <button type="button" class="login-btn" id="login-btn" (click)="openActionSheet()">
              Login
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

                  <!-- Confirm PIN boxes -->
                  <div class="rfield">
                    <label class="rlabel">Confirm 4-Digit PIN</label>
                    <div class="pin-row" id="reg-confirm-row">
                      @for (digit of regConfirmPinDigits; track $index; let i = $index) {
                        <input
                          #regConfirmPinRef
                          type="password"
                          inputmode="numeric"
                          maxlength="1"
                          class="pbox"
                          [id]="'rcpin-' + i"
                          [value]="digit"
                          [class.pbox-on]="digit !== ''"
                          (input)="onPinInput($event, i, 'reg-confirm')"
                          (keydown)="onPinKeyDown($event, i, 'reg-confirm')"
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
      background: #1B5E20;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
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
       LANDING SCREEN
       ═══════════════════════════════════════════════ */
    .landing {
      position: absolute;
      inset: 0;
      z-index: 1;                 /* behind splash */
      display: flex;
      flex-direction: column;
      background: #2E7D32;
    }

    /* ── Green showcase area — flex:1 fills remaining space above lcard ── */
    .showcase {
      flex: 1;
      background: linear-gradient(175deg, #1B5E20 0%, #2E7D32 55%, #388E3C 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 36px 16px 0;
      overflow: hidden;
      position: relative;
    }

    /* Swiggy-style square badge */
    .showcase-badge {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.22));
      margin-bottom: 10px;
      flex-shrink: 0;
    }

    .badge-svg { width: 100%; height: 100%; border-radius: 12px; }

    .showcase-heading {
      font-size: 21px;          /* slightly smaller */
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.28;
      text-align: center;
      margin: 0 0 10px;         /* tighter margin */
      max-width: 300px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.15);
      flex-shrink: 0;
    }

    /* ── CAROUSEL — Swiggy "page over" style ── */
    .carousel {
      width: 100%;
      max-width: 100%;
      flex: 1;               /* fill remaining height in showcase */
      position: relative;
      overflow: hidden;
      border-radius: 18px 18px 0 0;
    }

    /* Each slide is position absolute, fills the carousel */
    .slide {
      position: absolute;
      inset: 0;
    }

    .slide-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Current slide — stays still, lower z-index */
    .slide-current {
      z-index: 1;
    }

    /* Entering slide — slides FROM RIGHT, OVER current (higher z-index) */
    .slide-entering {
      z-index: 2;
      animation: slidePageOver 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes slidePageOver {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }

    /* 100% Fresh badge over photo */
    .slide-badge {
      position: absolute;
      bottom: 36px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
      background: rgba(255,255,255,0.93);
      backdrop-filter: blur(8px);
      border-radius: 30px;
      padding: 6px 16px;
      display: flex;
      align-items: center;
      gap: 7px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .slide-badge-text {
      font-size: 11.5px;
      font-weight: 800;
      color: #1B5E20;
    }

    /* Dot indicators at bottom of carousel */
    .carousel-dots {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 4;
      display: flex;
      gap: 5px;
    }

    .cdot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255,255,255,0.45);
      transition: all 0.3s ease;
    }

    .cdot-active {
      width: 18px;
      border-radius: 4px;
      background: #FFFFFF;
    }

    /* ── Bottom white card ── */
    .lcard {
      background: #FFFFFF;
      border-top-left-radius: 26px;
      border-top-right-radius: 26px;
      padding: 20px 20px 24px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;

      /* Start off-screen at bottom, slide up */
      transform: translateY(100%);
      transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .lcard.lcard-up {
      transform: translateY(0);
    }

    .login-btn {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 52px;
      background: #2E7D32;
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      font-family: inherit;
      font-size: 17px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(46,125,50,0.38);
      transition: transform 0.14s ease, background 0.2s;

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
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        transform: rotate(25deg);
        animation: btnShimmer 2.8s infinite ease-in-out;
        pointer-events: none;
      }

      &:active { transform: scale(0.98); background: #1B5E20; }
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
    'assets/images/mix-fruit-chaat.jpg',
    'assets/images/fresh-juice.jpg',
    'assets/images/watermelon-chaat.jpg',
    'assets/images/pineapple-chaat.jpg',
    'assets/images/masala-sprouts.jpg',
    'assets/images/boiled-sprouts.jpg'
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
    // After 2.4s: start shutter exit AND render landing behind it
    this.splashTimer = setTimeout(() => {
      this.splashExiting.set(true);  // shutter starts sliding up
      this.showLanding.set(true);    // landing renders underneath

      // After shutter animation (720ms): remove splash from DOM
      setTimeout(() => {
        this.showSplash.set(false);

        // 100ms later: landing card slides up from bottom
        setTimeout(() => {
          this.landingCardUp.set(true);
          // 400ms later: start carousel cycling
          setTimeout(() => this.startCarousel(), 400);
        }, 100);
      }, 720);
    }, 2400);
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
    const pin  = this.getPinStr('reg');
    const conf = this.getPinStr('reg-confirm');
    return !!this.registerName.trim() && pin.length === 4 && pin === conf;
  }

  async registerUser(): Promise<void> {
    if (!this.registerName.trim()) { this.errorMessage.set('Please enter your full name.'); return; }
    const pin  = this.getPinStr('reg');
    const conf = this.getPinStr('reg-confirm');
    if (pin.length !== 4)  { this.errorMessage.set('Please set a 4-digit security PIN.'); return; }
    if (pin !== conf)       { this.errorMessage.set('PINs do not match. Please try again.'); return; }

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
    const url = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.router.navigateByUrl(url);
  }
}
