import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  action?: () => void;
  toggle?: boolean;
  on?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page">
      
      @if (authService.isLoggedIn()) {
        <!-- LOGGED-IN PROFILE HEADER -->
        <div class="profile-header">
          <div class="ph-bg-circle c1"></div>
          <div class="ph-bg-circle c2"></div>

          <!-- AVATAR -->
          <div class="avatar-wrap">
            <div class="avatar">{{ getUserInitials() }}</div>
            <span class="sprout-dot" title="Health Member">&#127793;</span>
          </div>

          <!-- USER NAME & INFO -->
          <h2 class="profile-name">{{ authService.currentUser()?.name }}</h2>
          <p class="profile-phone">+91 {{ authService.currentUser()?.phone }}</p>
          <div class="health-member-badge">
            <span>🥑 Fruit Club • <b>Gold Member</b></span>
          </div>

          <!-- STATS CARD -->
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-val">24</span>
              <span class="stat-label">&#129367; Orders</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-val">14d</span>
              <span class="stat-label">&#128293; Streak</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-val">&#8377;1,840</span>
              <span class="stat-label">&#10024; Saved</span>
            </div>
          </div>
        </div>

        <div class="container profile-content">
          <!-- SAVED ADDRESSES SECTION -->
          <div class="profile-section">
            <div class="section-top">
              <h3 class="section-label">My Saved Addresses</h3>
              <button class="add-addr-link" (click)="authService.openMapPicker()">+ Add on Map</button>
            </div>
            
            <div class="menu-card">
              @for (addr of authService.currentUser()?.addresses; track addr.id || addr.fullAddress) {
                <div 
                  class="address-row" 
                  [class.active]="authService.activeAddress().fullAddress === addr.fullAddress"
                  (click)="authService.setActiveAddress(addr)"
                >
                  <span class="ar-icon">{{ addr.icon || '📍' }}</span>
                  <div class="ar-info">
                    <div class="ar-title">
                      <strong>{{ addr.label }}</strong>
                      @if (authService.activeAddress().fullAddress === addr.fullAddress) {
                        <span class="ar-badge">Active</span>
                      }
                    </div>
                    <span class="ar-text">{{ addr.fullAddress }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- ACTIVITY ITEMS -->
          <div class="profile-section">
            <h3 class="section-label">My Activity</h3>
            <div class="menu-card">
              @for (item of activityItems; track item.label) {
                <a [routerLink]="item.route || '/'" class="menu-item">
                  <span class="mi-icon">{{ item.icon }}</span>
                  <span class="mi-label">{{ item.label }}</span>
                  <span class="mi-arrow">›</span>
                </a>
              }
            </div>
          </div>

          <!-- SETTINGS -->
          <div class="profile-section">
            <h3 class="section-label">Settings</h3>
            <div class="menu-card">
              @for (item of settingsItems; track item.label) {
                <div class="menu-item">
                  <span class="mi-icon">{{ item.icon }}</span>
                  <span class="mi-label">{{ item.label }}</span>
                  @if (item.toggle) {
                    <div class="toggle" [class.on]="item.on" (click)="item.on = !item.on">
                      <div class="toggle-thumb"></div>
                    </div>
                  } @else {
                    <span class="mi-arrow">›</span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- LOGOUT BUTTON -->
          <button class="logout-btn" (click)="authService.logout()">
            &#128682; Logout of Account
          </button>
        </div>

      } @else {
        <!-- LOGGED-OUT CARD (SWIGGY/ZOMATO STYLE) -->
        <div class="logged-out-container">
          <div class="guest-card">
            <div class="guest-icon">🥑</div>
            <h2 class="guest-title">Account & Preferences</h2>
            <p class="guest-sub">Log in to view your orders, saved addresses, exclusive fruit club offers, and healthy streaks.</p>
            
            <button class="guest-login-btn" (click)="authService.openAuthModal()">
              Login / Sign Up
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .profile-page {
      background: #F8F9FA;
      min-height: 100vh;
      padding-bottom: 90px;
    }

    /* PREMIUM HEALTH PROFILE HEADER */
    .profile-header {
      background: linear-gradient(155deg, #155523 0%, #237632 45%, #2e7d32 100%);
      padding: 30px 20px 22px;
      text-align: center;
      color: #fff;
      position: relative;
      overflow: hidden;
      border-radius: 0 0 24px 24px;
      box-shadow: 0 6px 20px rgba(21, 85, 35, 0.18);
    }

    .ph-bg-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      pointer-events: none;
    }
    .ph-bg-circle.c1 { width: 170px; height: 170px; top: -50px; right: -50px; }
    .ph-bg-circle.c2 { width: 120px; height: 120px; bottom: -30px; left: -30px; }

    /* AVATAR */
    .avatar-wrap {
      position: relative;
      width: 78px;
      height: 78px;
      margin: 0 auto 10px;
    }
    .avatar {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 800;
      color: #fff;
      border: 3px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(4px);
    }
    .sprout-dot {
      position: absolute;
      top: -2px;
      right: 2px;
      background: #fff;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
    }

    /* NAME & PHONE */
    .profile-name {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 2px;
      letter-spacing: 0.2px;
      color: #fff;
    }
    .profile-phone {
      font-size: 12.5px;
      opacity: 0.88;
      margin-bottom: 8px;
      font-weight: 600;
    }

    /* HEALTH MEMBER BADGE */
    .health-member-badge {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 11.5px;
      color: #E8F5E9;
      margin-bottom: 14px;
    }
    .health-member-badge b {
      color: #FFD54F;
      font-weight: 700;
    }

    /* STATS CARD */
    .profile-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 12px 6px;
      max-width: 420px;
      margin: 0 auto;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      flex: 1;
    }
    .stat-val {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #fff;
    }
    .stat-label {
      font-size: 11px;
      opacity: 0.85;
      font-weight: 500;
      color: #E8F5E9;
    }
    .stat-divider {
      width: 1px;
      height: 30px;
      background: rgba(255, 255, 255, 0.25);
    }

    /* PROFILE CONTENT */
    .profile-content {
      padding-top: 18px;
      max-width: 480px;
      margin: 0 auto;
      padding-left: 16px;
      padding-right: 16px;
    }
    .profile-section {
      margin-bottom: 20px;
    }
    .section-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .add-addr-link {
      background: transparent;
      border: none;
      color: #2E7D32;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      &:hover { text-decoration: underline; }
    }

    .menu-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #F0F0F0;
    }

    /* ADDRESS ROW */
    .address-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 13px 16px;
      border-bottom: 1px solid #F6F6F6;
      cursor: pointer;
      transition: background 0.2s;
      &:last-child { border-bottom: none; }
      &:hover { background: #F8F9FA; }
      &.active {
        background: #F1F8E9;
      }
    }
    .ar-icon {
      font-size: 18px;
      margin-top: 1px;
    }
    .ar-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .ar-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13.5px;
      color: #111827;
    }
    .ar-badge {
      background: #2E7D32;
      color: #fff;
      font-size: 9.5px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 999px;
    }
    .ar-text {
      font-size: 11.5px;
      color: #6B7280;
      line-height: 1.4;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-bottom: 1px solid #F6F6F6;
      cursor: pointer;
      text-decoration: none;
      color: #1A1A1A;
      transition: background 0.2s;
      &:last-child { border-bottom: none; }
      &:hover { background: #F8F9FA; }
    }
    .mi-icon {
      font-size: 21px;
      width: 28px;
      text-align: center;
    }
    .mi-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #222;
    }
    .mi-arrow {
      color: #ccc;
      font-size: 20px;
    }

    /* TOGGLE */
    .toggle {
      width: 44px;
      height: 24px;
      background: #DDD;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
      &.on { background: #4CAF50; }
    }
    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s;
    }
    .toggle.on .toggle-thumb {
      transform: translateX(20px);
    }

    .logout-btn {
      width: 100%;
      background: #fff;
      border: 1.5px solid #FFCDD2;
      border-radius: 14px;
      padding: 13px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #F44336;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 10px;
      &:hover { background: #FFEBEE; }
    }

    /* GUEST / LOGGED-OUT CARD */
    .logged-out-container {
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }

    .guest-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 32px 24px;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
    }

    .guest-icon {
      font-size: 48px;
      margin-bottom: 14px;
    }

    .guest-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 8px;
    }

    .guest-sub {
      font-size: 13.5px;
      color: #6B7280;
      line-height: 1.5;
      margin: 0 0 24px;
    }

    .guest-login-btn {
      width: 100%;
      background: #2E7D32;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      padding: 14px;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(46, 125, 50, 0.35);
      transition: all 0.2s;
      &:active { transform: scale(0.98); background: #1B5E20; }
    }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'FC';
    const parts = user.name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }

  activityItems: MenuItem[] = [
    { icon: '📦', label: 'My Orders', route: '/track-order/FC12345' },
    { icon: '❤️', label: 'Favourites', route: '/menu' },
    { icon: '🎟️', label: 'Coupons & Offers', route: '/' },
  ];

  settingsItems: MenuItem[] = [
    { icon: '🔔', label: 'Notifications', toggle: true, on: true },
    { icon: '🌙', label: 'Dark Mode', toggle: true, on: false },
    { icon: '📞', label: 'Help & Support', toggle: false },
    { icon: 'ℹ️', label: 'About FruitChat', toggle: false },
  ];
}
