import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, AuthModalComponent],
  template: `
    <!-- MOBILE TOP HEADER — only on Home page -->
    @if (isHomePage()) {
      <header class="mobile-header">
        <div class="header-left">
          <div class="header-top-line">
            <a routerLink="/" class="brand-link">
              <span class="brand-name">Fruit<span class="brand-highlight">Chat</span></span>
            </a>
            <div class="delivery-badge">
              <svg class="bolt-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>15-20 MINS</span>
            </div>
          </div>
        </div>

        <div class="header-right">
          <a routerLink="/cart" class="header-action-btn cart-btn-bubble" aria-label="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            @if (cartService.totalItems() > 0) {
              <span class="action-badge">{{ cartService.totalItems() }}</span>
            }
          </a>

          @if (authService.isLoggedIn()) {
            <a routerLink="/profile" class="header-action-btn profile-btn-bubble" aria-label="User Profile">
              @if (authService.currentUser()?.photoUrl) {
                <img [src]="authService.currentUser()?.photoUrl" class="avatar-photo" alt="Profile" />
              } @else {
                <span class="avatar-letter">{{ getUserInitial() }}</span>
              }
            </a>
          } @else {
            <a routerLink="/auth" class="header-login-btn">
              Login
            </a>
          }
        </div>
      </header>

    }

    <!-- DESKTOP TOP NAV -->
    <header class="top-nav">
      <div class="top-nav__inner container">
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 4 4 8 8 10 4-2 8-6 8-10 0-4-4-8-8-8z" fill="#4CAF50" opacity="0.3"/>
              <path d="M12 4C9 4 7 7 7 10s3 7 5 8c2-1 5-5 5-8S15 4 12 4z" fill="#2E7D32"/>
              <path d="M12 8c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" fill="#fff"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name"><span class="gradient-text">FruitChat</span></span>
            <span class="brand-tagline">Fresh Fruits • Healthy Sprouts</span>
          </div>
        </a>

        <nav class="desktop-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>
          <a routerLink="/menu" routerLinkActive="active" class="nav-link">Menu</a>

          @if (authService.isLoggedIn()) {
            <a routerLink="/profile" routerLinkActive="active" class="nav-link profile-link">
              @if (authService.currentUser()?.photoUrl) {
                <img [src]="authService.currentUser()?.photoUrl" class="nav-avatar-photo" alt="Profile" />
              } @else {
                <span class="nav-avatar">{{ getUserInitial() }}</span>
              }
              <span>{{ getFirstName() }}</span>
            </a>
          } @else {
            <a routerLink="/auth" class="nav-login-btn">
              Login / Signup
            </a>
          }

          <a routerLink="/cart" class="cart-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span class="cart-label">Cart</span>
            @if (cartService.totalItems() > 0) {
              <span class="cart-badge">{{ cartService.totalItems() }}</span>
            }
          </a>
        </nav>
      </div>
    </header>

    <!-- BOTTOM NAV (Mobile) -->
    <nav class="bottom-nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="bnav-item">
        <svg class="bnav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span class="bnav-label">Home</span>
      </a>

      <a routerLink="/menu" routerLinkActive="active" class="bnav-item">
        <svg class="bnav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span class="bnav-label">Menu</span>
      </a>

      <a routerLink="/cart" routerLinkActive="active" class="bnav-item cart-item">
        <div class="bnav-cart-wrap">
          <svg class="bnav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          @if (cartService.totalItems() > 0) {
            <span class="bnav-badge">{{ cartService.totalItems() }}</span>
          }
        </div>
        <span class="bnav-label">Cart</span>
      </a>

      @if (authService.isLoggedIn()) {
        <a routerLink="/profile" routerLinkActive="active" class="bnav-item">
          <svg class="bnav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="bnav-label">Profile</span>
        </a>
      } @else {
        <a routerLink="/auth" class="bnav-item bnav-btn-action">
          <svg class="bnav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
          </svg>
          <span class="bnav-label">Login</span>
        </a>
      }
    </nav>

    <!-- AUTH MODAL -->
    @if (authService.showAuthModal()) {
      <app-auth-modal></app-auth-modal>
    }

  `,
  styles: [`
    /* ===== GRADIENT SHIMMER TEXT ===== */
    .gradient-text {
      background: linear-gradient(
        90deg,
        #2E7D32 0%,
        #4CAF50 20%,
        #8BC34A 38%,
        #C5E1A5 50%,
        #8BC34A 62%,
        #4CAF50 80%,
        #2E7D32 100%
      );
      background-size: 250% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2.2s linear infinite;
      display: inline-block;
    }

    @keyframes shimmer {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }

    /* ===== MOBILE TOP HEADER ===== */
    .mobile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 16px;
      background: #ffffff;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      border-bottom: 1px solid #f0f4f0;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
    }

    .header-top-line {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-link {
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }

    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 19px;
      font-weight: 850;
      letter-spacing: -0.4px;
      color: #1A381C;
      line-height: 1.1;
    }

    .brand-highlight {
      color: #2E7D32;
    }

    .delivery-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: #E8F5E9;
      color: #1B5E20;
      border: 1px solid #C8E6C9;
      border-radius: 6px;
      padding: 2px 7px;
      font-family: 'Outfit', sans-serif;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }

    .bolt-icon {
      width: 12px;
      height: 12px;
      color: #F59E0B;
      flex-shrink: 0;
    }



    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .header-action-btn {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .cart-btn-bubble {
      background: #F1F8E9;
      border: 1px solid #DCEDC8;
      color: #1B5E20;
      &:active {
        background: #DCEDC8;
        transform: scale(0.94);
      }
    }

    .profile-btn-bubble {
      background: #E8F5E9;
      border: 1.5px solid #A5D6A7;
      color: #1B5E20;
      &:active {
        transform: scale(0.94);
      }
    }

    .avatar-letter {
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #1B5E20;
    }

    .avatar-photo {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .nav-avatar-photo {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      object-fit: cover;
    }

    .header-login-btn {
      background: #2E7D32;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 7px 13px;
      font-family: 'Outfit', sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(46, 125, 50, 0.25);
      &:active { transform: scale(0.95); background: #1B5E20; }
    }

    .action-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #FF5722;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-size: 10px;
      font-weight: 800;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      padding: 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(255, 87, 34, 0.35);
    }

    /* ===== DESKTOP TOP NAV ===== */
    .top-nav {
      display: none !important;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 1000;
      border-bottom: 1px solid #EEEEEE;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
    }

    .top-nav__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 68px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .brand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-tagline {
      font-size: 11px;
      color: #777;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-link {
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      text-decoration: none;
      transition: all 0.2s;
      &:hover { background: #F1F8E9; color: #2E7D32; }
      &.active { background: #F1F8E9; color: #2E7D32; font-weight: 600; }
    }

    .profile-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .nav-avatar {
      width: 22px;
      height: 22px;
      background: #2E7D32;
      color: #fff;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
    }

    .nav-login-btn {
      background: #F1F8E9;
      color: #2E7D32;
      border: 1px solid #C8E6C9;
      border-radius: 999px;
      padding: 8px 18px;
      font-family: 'Outfit', sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        background: #2E7D32;
        color: #fff;
      }
    }

    .cart-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      background: #2E7D32;
      color: #fff;
      padding: 9px 20px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      margin-left: 8px;
      &:hover { background: #1B5E20; transform: translateY(-1px); }
      .cart-badge {
        position: absolute;
        top: -6px; right: -6px;
        background: #FF6B35;
        color: #fff;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 700;
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #fff;
      }
    }

    /* ===== BOTTOM NAV ===== */
    .bottom-nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 6px 0 10px;
      box-shadow: 0 -2px 20px rgba(0,0,0,0.08);
      z-index: 1000;
      border-top: 1px solid #EEEEEE;
      height: 62px;
    }

    .bnav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      text-decoration: none;
      color: #aaa;
      position: relative;
      padding: 2px 12px;
      border-radius: 12px;
      transition: all 0.2s;
      min-width: 56px;
      flex: 1;
      border: none;
      background: transparent;
      font-family: inherit;
      cursor: pointer;
      &.active {
        color: #2E7D32;
        .bnav-icon { transform: translateY(-1px); }
      }
    }

    .bnav-icon {
      width: 22px;
      height: 22px;
      transition: transform 0.2s;
      stroke: currentColor;
    }

    .bnav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.2px; }

    .bnav-cart-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bnav-badge {
      position: absolute;
      top: -8px; right: -10px;
      background: #FF6B35;
      color: #fff;
      border-radius: 50%;
      font-size: 9px;
      font-weight: 700;
      width: 16px; height: 16px;
      display: flex; align-items: center; justify-content: center;
      border: 1.5px solid #fff;
    }

    @media (min-width: 768px) {
      .mobile-header { display: none !important; }
      .top-nav { display: block !important; }
      .bottom-nav { display: none !important; }
    }
  `]
})
export class NavbarComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  getUserInitial(): string {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  }

  getFirstName(): string {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'User';
    return user.name.split(' ')[0];
  }
}
