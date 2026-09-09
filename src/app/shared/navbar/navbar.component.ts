import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- MOBILE TOP HEADER — only on Home page -->
    @if (isHomePage()) {
      <header class="mobile-header">
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 4 4 8 8 10 4-2 8-6 8-10 0-4-4-8-8-8z" fill="#4CAF50" opacity="0.35"/>
              <path d="M12 4C9 4 7 7 7 10s3 7 5 8c2-1 5-5 5-8S15 4 12 4z" fill="#2E7D32"/>
              <path d="M12 8c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" fill="#fff"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name"><span class="gradient-text">FruitChat</span></span>
            <span class="brand-tagline">Fresh Fruits + Healthy Sprouts</span>
          </div>
        </a>
        <a routerLink="/cart" class="mobile-cart-btn">
          <div class="mobile-cart-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            @if (cartService.totalItems() > 0) {
              <span class="mobile-cart-badge">{{ cartService.totalItems() }}</span>
            }
          </div>
        </a>
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
          <a routerLink="/profile" routerLinkActive="active" class="nav-link">Profile</a>
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
      <a routerLink="/profile" routerLinkActive="active" class="bnav-item">
        <svg class="bnav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="bnav-label">Profile</span>
      </a>
    </nav>
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
      padding: 12px 16px;
      background: #fff;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 17px;
      font-weight: 800;
      line-height: 1.1;
    }

    .brand-tagline {
      font-size: 10px;
      color: #888;
      font-weight: 400;
    }

    .mobile-cart-btn {
      text-decoration: none;
      position: relative;
    }

    .mobile-cart-icon-wrap {
      position: relative;
      width: 40px;
      height: 40px;
      background: #F1F8E9;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      &:active { background: #DCEDC8; transform: scale(0.95); }
    }

    .mobile-cart-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #FF6B35;
      color: #fff;
      border-radius: 50%;
      font-size: 9px;
      font-weight: 700;
      width: 17px;
      height: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
    }

    /* ===== DESKTOP TOP NAV ===== */
    .top-nav {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #fff;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      z-index: 1000;
      height: 72px;
    }

    .top-nav__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
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
      .mobile-header { display: none; }
      .top-nav { display: block; }
      .bottom-nav { display: none; }
    }
  `]
})
export class NavbarComponent {
  cartService = inject(CartService);
  private router = inject(Router);

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }
}
