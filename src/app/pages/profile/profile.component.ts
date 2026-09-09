import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  toggle?: boolean;
  on?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page">
      <!-- PREMIUM HEALTH PROFILE HEADER -->
      <div class="profile-header">
        <div class="ph-bg-circle c1"></div>
        <div class="ph-bg-circle c2"></div>

        <!-- AVATAR -->
        <div class="avatar-wrap">
          <div class="avatar">RP</div>
          <span class="sprout-dot" title="Health Member">&#127793;</span>
          <button class="edit-avatar" title="Change Photo">&#128247;</button>
        </div>

        <!-- USER NAME & INFO -->
        <h2 class="profile-name">Rohit Porwal</h2>
        <p class="profile-phone">+91 98765 43210</p>
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
        <!-- ORIGINAL 4 ACTIVITY ITEMS -->
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

        <!-- RECENT ORDERS -->
        <div class="profile-section">
          <h3 class="section-label">Recent Orders</h3>
          @for (order of recentOrders; track order.id) {
            <div class="order-card">
              <div class="order-left">
                <img [src]="order.image" [alt]="order.name" class="order-img">
                <div class="order-info">
                  <p class="order-name">{{ order.name }}</p>
                  <p class="order-meta">{{ order.date }} • ₹{{ order.price }}</p>
                </div>
              </div>
              <div class="order-right">
                <span class="order-status delivered">{{ order.statusLabel }}</span>
                <a routerLink="/menu" class="reorder-btn">Reorder</a>
              </div>
            </div>
          }
        </div>

        <button class="logout-btn">&#128682; Logout</button>
      </div>
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
    .edit-avatar {
      position: absolute;
      bottom: -1px;
      right: -1px;
      background: #fff;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    /* NAME & PHONE */
    .profile-name {
      font-size: 19px;
      font-weight: 800;
      margin-bottom: 2px;
      letter-spacing: 0.2px;
      color: #fff;
    }
    .profile-phone {
      font-size: 12px;
      opacity: 0.85;
      margin-bottom: 8px;
      font-weight: 500;
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
      -webkit-backdrop-filter: blur(10px);
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
    }
    .profile-section {
      margin-bottom: 20px;
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .menu-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #F0F0F0;
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

    /* RECENT ORDERS */
    .order-card {
      background: #fff;
      border-radius: 14px;
      padding: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #F0F0F0;
      margin-bottom: 10px;
    }
    .order-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .order-img {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      object-fit: cover;
    }
    .order-name {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 2px;
      color: #1A1A1A;
    }
    .order-meta {
      font-size: 11px;
      color: #888;
    }
    .order-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 7px;
    }
    .order-status {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 999px;
      &.delivered { background: #E8F5E9; color: #2E7D32; }
    }
    .reorder-btn {
      font-size: 11.5px;
      font-weight: 700;
      color: #2E7D32;
      text-decoration: none;
      border: 1.5px solid #4CAF50;
      padding: 3px 11px;
      border-radius: 999px;
      transition: all 0.2s;
      &:hover { background: #2E7D32; color: #fff; }
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
      &:hover { background: #FFEBEE; }
    }
  `]
})
export class ProfileComponent {
  activityItems: MenuItem[] = [
    { icon: '📦', label: 'My Orders', route: '/track-order/FC12345' },
    { icon: '❤️', label: 'Favourites', route: '/menu' },
    { icon: '📍', label: 'Saved Addresses', route: '/checkout' },
    { icon: '🎟️', label: 'Coupons & Offers', route: '/' },
  ];

  settingsItems: MenuItem[] = [
    { icon: '🔔', label: 'Notifications', toggle: true, on: true },
    { icon: '🌙', label: 'Dark Mode', toggle: true, on: false },
    { icon: '📞', label: 'Help & Support', toggle: false },
    { icon: 'ℹ️', label: 'About FruitChat', toggle: false },
  ];

  recentOrders = [
    { id: 'FC12345', name: 'Mix Fruit Chaat', date: '08 Sep', price: 80, image: 'assets/images/mix-fruit-chaat.jpg', statusLabel: 'Delivered' },
    { id: 'FC12344', name: 'Masala Sprouts', date: '06 Sep', price: 60, image: 'assets/images/masala-sprouts.jpg', statusLabel: 'Delivered' },
  ];
}

