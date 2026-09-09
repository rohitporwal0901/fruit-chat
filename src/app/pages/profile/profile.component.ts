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
      <div class="profile-header">
        <div class="ph-bg-circle c1"></div>
        <div class="ph-bg-circle c2"></div>
        <div class="avatar-wrap">
          <div class="avatar">RP</div>
          <button class="edit-avatar">&#128247;</button>
        </div>
        <h2 class="profile-name">Rohit Porwal</h2>
        <p class="profile-phone">+91 98765 43210</p>
        <div class="profile-stats">
          <div class="stat">
            <span class="stat-val">24</span>
            <span class="stat-label">Orders</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-val">4.9&#9733;</span>
            <span class="stat-label">Rating</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-val">&#8377;1,840</span>
            <span class="stat-label">Saved</span>
          </div>
        </div>
      </div>

      <div class="container profile-content">
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

        <button class="logout-btn">🚪 Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { background: #F8F9FA; min-height: 100vh; padding-bottom: 100px; }

    .profile-header {
      background: linear-gradient(160deg, #1B5E20 0%, #2E7D32 45%, #43A047 100%);
      padding: 52px 24px 36px;
      text-align: center;
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    .ph-bg-circle {
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.07);
      pointer-events: none;
    }
    .ph-bg-circle.c1 { width: 200px; height: 200px; top: -60px; right: -60px; }
    .ph-bg-circle.c2 { width: 130px; height: 130px; bottom: -30px; left: -30px; }

    .avatar-wrap {
      position: relative;
      width: 90px; height: 90px;
      margin: 0 auto 14px;
    }
    .avatar {
      width: 90px; height: 90px;
      border-radius: 50%;
      background: rgba(255,255,255,0.22);
      display: flex; align-items: center; justify-content: center;
      font-size: 30px; font-weight: 800; color: #fff;
      border: 3px solid rgba(255,255,255,0.5);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      backdrop-filter: blur(4px);
    }
    .edit-avatar {
      position: absolute; bottom: 0; right: 0;
      background: #fff; border: none; border-radius: 50%;
      width: 28px; height: 28px; font-size: 13px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .profile-name { font-size: 22px; font-weight: 800; margin-bottom: 4px; letter-spacing: 0.2px; }
    .profile-phone { font-size: 13px; opacity: 0.8; margin-bottom: 22px; }

    .profile-stats {
      display: flex; align-items: center; justify-content: center; gap: 0;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 18px; padding: 16px 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
    .stat-val { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .stat-label { font-size: 11px; opacity: 0.78; font-weight: 500; }
    .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.28); }
    .profile-content { padding-top: 20px; }
    .profile-section { margin-bottom: 20px; }
    .section-label { font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    .menu-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .menu-item { display: flex; align-items: center; gap: 14px; padding: 15px 16px; border-bottom: 1px solid #F5F5F5; cursor: pointer; text-decoration: none; color: #1A1A1A; transition: background 0.2s; &:last-child { border-bottom: none; } &:hover { background: #F8F9FA; } }
    .mi-icon { font-size: 22px; width: 30px; text-align: center; }
    .mi-label { flex: 1; font-size: 14px; font-weight: 500; }
    .mi-arrow { color: #bbb; font-size: 20px; }
    .toggle { width: 44px; height: 24px; background: #DDD; border-radius: 12px; cursor: pointer; transition: background 0.2s; position: relative; &.on { background: #4CAF50; } }
    .toggle-thumb { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); transition: transform 0.2s; }
    .toggle.on .toggle-thumb { transform: translateX(20px); }
    .order-card { background: #fff; border-radius: 14px; padding: 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 10px; }
    .order-left { display: flex; align-items: center; gap: 12px; }
    .order-img { width: 52px; height: 52px; border-radius: 10px; object-fit: cover; }
    .order-name { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
    .order-meta { font-size: 11px; color: #999; }
    .order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .order-status { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; &.delivered { background: #E8F5E9; color: #2E7D32; } }
    .reorder-btn { font-size: 12px; font-weight: 700; color: #2E7D32; text-decoration: none; border: 1.5px solid #4CAF50; padding: 4px 12px; border-radius: 999px; transition: all 0.2s; &:hover { background: #2E7D32; color: #fff; } }
    .logout-btn { width: 100%; background: #fff; border: 1.5px solid #FFCDD2; border-radius: 14px; padding: 14px; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600; color: #F44336; cursor: pointer; transition: all 0.2s; &:hover { background: #FFEBEE; } }
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
