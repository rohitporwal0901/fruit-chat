import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

interface AddressOption {
  icon: string;
  label: string;
  detail: string;
  fullAddress: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
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

          <button class="location-btn" (click)="openLocationSheet()" type="button">
            <svg class="loc-pin" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="loc-text">
              <strong class="loc-label">{{ currentAddress().label }}</strong>
              <span class="loc-sep">-</span>
              <span class="loc-detail">{{ currentAddress().detail }}</span>
            </span>
            <svg class="loc-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
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
          <a routerLink="/profile" class="header-action-btn profile-btn-bubble" aria-label="User Profile">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </a>
        </div>
      </header>

      <!-- LOCATION SELECTION BOTTOM SHEET -->
      @if (showLocationSheet) {
        <div class="sheet-backdrop" (click)="closeLocationSheet()"></div>
        <div class="sheet-container">
          <div class="sheet-drag-handle"></div>
          <div class="sheet-header">
            <div>
              <h3 class="sheet-title">Select Delivery Location</h3>
              <p class="sheet-subtitle">Fresh fruits & snacks delivered in 15-20 mins</p>
            </div>
            <button class="sheet-close-btn" (click)="closeLocationSheet()">✕</button>
          </div>

          <div class="address-list">
            @for (addr of savedAddresses; track addr.label) {
              <div 
                class="address-card" 
                [class.active]="currentAddress().label === addr.label"
                (click)="selectAddress(addr)"
              >
                <div class="addr-icon-box">
                  <span class="addr-emoji">{{ addr.icon }}</span>
                </div>
                <div class="addr-content">
                  <div class="addr-top">
                    <span class="addr-tag">{{ addr.label }}</span>
                    @if (currentAddress().label === addr.label) {
                      <span class="selected-pill">Delivering here</span>
                    }
                  </div>
                  <p class="addr-desc">{{ addr.fullAddress }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }
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

    .location-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      max-width: 100%;
      &:active {
        opacity: 0.75;
      }
    }

    .loc-pin {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      color: #2E7D32;
    }

    .loc-text {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .loc-label {
      color: #1F2937;
      font-weight: 700;
      font-size: 12px;
      flex-shrink: 0;
    }

    .loc-sep {
      color: #9CA3AF;
      flex-shrink: 0;
      font-size: 11px;
    }

    .loc-detail {
      color: #6B7280;
      font-weight: 500;
      font-size: 12px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 155px;
    }

    .loc-arrow {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
      color: #6B7280;
      margin-left: 1px;
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
      background: #F8F9FA;
      border: 1px solid #E9ECEF;
      color: #495057;
      &:active {
        background: #E9ECEF;
        transform: scale(0.94);
      }
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

    /* ===== LOCATION BOTTOM SHEET ===== */
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(2px);
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    }

    .sheet-container {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      background: #ffffff;
      border-radius: 20px 20px 0 0;
      padding: 12px 18px 28px;
      z-index: 2001;
      box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.15);
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 500px;
      margin: 0 auto;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .sheet-drag-handle {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: #E0E0E0;
      margin: 0 auto 12px;
    }

    .sheet-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .sheet-title {
      font-family: 'Outfit', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .sheet-subtitle {
      font-size: 12px;
      color: #6B7280;
      margin: 3px 0 0;
    }

    .sheet-close-btn {
      background: #F3F4F6;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #6B7280;
      cursor: pointer;
      &:active {
        background: #E5E7EB;
      }
    }

    .address-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .address-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1.5px solid #E5E7EB;
      background: #FAFAFA;
      cursor: pointer;
      transition: all 0.2s ease;
      &:active {
        transform: scale(0.98);
      }
      &.active {
        border-color: #2E7D32;
        background: #F1F8E9;
      }
    }

    .addr-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      flex-shrink: 0;
    }

    .addr-emoji {
      font-size: 18px;
    }

    .addr-content {
      flex: 1;
      min-width: 0;
    }

    .addr-top {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .addr-tag {
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }

    .selected-pill {
      background: #2E7D32;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 999px;
      letter-spacing: 0.2px;
    }

    .addr-desc {
      margin: 3px 0 0;
      font-size: 12px;
      color: #6B7280;
      line-height: 1.4;
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

  showLocationSheet = false;

  savedAddresses: AddressOption[] = [
    {
      icon: '🏠',
      label: 'Home',
      detail: 'Sector 15, City Center',
      fullAddress: 'Flat 402, Green Valley Apartments, Sector 15'
    },
    {
      icon: '🏢',
      label: 'Work',
      detail: 'Tech Park, Phase 2',
      fullAddress: 'Tower B, 4th Floor, Tech Park, Phase 2'
    },
    {
      icon: '📍',
      label: 'Other',
      detail: 'Model Town, Block C',
      fullAddress: 'House 142, Block C, Model Town'
    }
  ];

  currentAddress = signal<AddressOption>(this.savedAddresses[0]);

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  openLocationSheet(): void {
    this.showLocationSheet = true;
  }

  closeLocationSheet(): void {
    this.showLocationSheet = false;
  }

  selectAddress(addr: AddressOption): void {
    this.currentAddress.set(addr);
    this.closeLocationSheet();
  }
}
