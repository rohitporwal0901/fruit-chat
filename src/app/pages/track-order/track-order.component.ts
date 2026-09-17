import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';

interface TrackStep {
  id: string;
  label: string;
  time: string;
  desc: string;
  icon: string;
  done: boolean;
}

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="track-page">
      <!-- HEADER -->
      <div class="track-header">
        <button class="back-btn" (click)="router.navigate(['/'])" aria-label="Back to Home">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Home</span>
        </button>
        <h2 class="track-title">Track Order</h2>
        <div class="header-spacer"></div>
      </div>

      <!-- MAP PLACEHOLDER -->
      <div class="map-section">
        <div class="map-placeholder">
          <div class="map-overlay">
            <div class="delivery-pin">{{ getVehicleEmoji() }}</div>
            <div class="delivery-wave"></div>
          </div>
          <div class="eta-card">
            <span class="eta-label">{{ etaLabel() }}</span>
            <span class="eta-time">{{ estimatedDeliveryTime() }}</span>
          </div>
        </div>
      </div>

      <!-- ORDER INFO -->
      <div class="container">
        <div class="order-info-card">
          <div class="order-id-row">
            <span class="order-id-label">Order #{{ displayOrderId() }}</span>
            <span class="order-status-badge" [ngClass]="currentStatusBadgeClass()">{{ currentStatusLabel() }}</span>
          </div>
          <div class="order-items-preview">
            <span class="items-text">🌱 {{ getItemsSummary() }}</span>
          </div>
          <div class="order-meta-info">
            <span class="meta-addr">📍 {{ getAddressSummary() }}</span>
            <span class="meta-price">₹{{ getOrderTotal() }}</span>
          </div>
        </div>

        <!-- TIMELINE -->
        <div class="timeline-section">
          <h3 class="timeline-title">Order Timeline</h3>
          <div class="timeline">
            @for (step of trackSteps(); track step.id; let last = $last) {
              <div class="timeline-item" [class.done]="step.done" [class.current]="isCurrentStep(step)">
                <div class="timeline-left">
                  <div class="timeline-dot" [class.done]="step.done" [class.current]="isCurrentStep(step)">
                    @if (step.done) { <span>✓</span> } @else { <span class="dot-inner"></span> }
                  </div>
                  @if (!last) { <div class="timeline-line" [class.done]="step.done"></div> }
                </div>
                <div class="timeline-content">
                  <div class="tl-icon">{{ step.icon }}</div>
                  <div class="tl-text">
                    <p class="tl-label">{{ step.label }}</p>
                    <p class="tl-desc">{{ step.desc }}</p>
                  </div>
                  <span class="tl-time">{{ step.time }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- HELP -->
        <div class="help-section">
          <a
            [href]="'https://wa.me/919876543210?text=Hi%20FruitChat,%20I%20need%20help%20with%20Order%20%23' + displayOrderId()"
            target="_blank"
            class="help-btn"
          >
            💬 Need help with your order?
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .track-page { background: #F8F9FA; min-height: 100vh; }

    .track-header {
      background: #fff;
      padding: 12px 16px;
      display: grid;
      grid-template-columns: 75px 1fr 75px;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      position: sticky;
      top: 0;
      z-index: 100;
      @media (min-width: 768px) { top: 72px; }
    }

    .track-title {
      font-size: 18px;
      font-weight: 800;
      text-align: center;
      color: #1A1A1A;
      margin: 0;
      letter-spacing: -0.3px;
    }

    .back-btn {
      background: #F4F4F5;
      border: none;
      font-size: 12px;
      font-weight: 700;
      color: #1A1A1A;
      cursor: pointer;
      font-family: inherit;
      padding: 6px 12px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      justify-self: start;
      transition: all 0.2s;
      &:active { background: #E4E4E7; transform: scale(0.95); }
    }

    .header-spacer {
      width: 75px;
      justify-self: end;
    }

    .map-section { height: 200px; background: linear-gradient(135deg, #E8F5E9, #C8E6C9, #A5D6A7); position: relative; overflow: hidden; }
    .map-placeholder { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
    .map-overlay { display: flex; flex-direction: column; align-items: center; }
    .delivery-pin { font-size: 48px; animation: bounce 1.2s infinite alternate; }
    .delivery-wave { width: 80px; height: 16px; background: rgba(0,0,0,0.08); border-radius: 50%; margin-top: 4px; }
    @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-12px); } }

    .eta-card { position: absolute; bottom: 16px; right: 16px; background: #fff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; min-width: 130px; }
    .eta-label { font-size: 10px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
    .eta-time { font-size: 18px; font-weight: 800; color: #1A1A1A; }

    .order-info-card { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-top: 16px; margin-bottom: 16px; }
    .order-id-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .order-id-label { font-size: 15px; font-weight: 700; color: #1A1A1A; }

    .order-status-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      transition: all 0.3s ease;
    }
    .badge-pending   { background: #FFF8E1; color: #E65100; border: 1px solid #FFE082; }
    .badge-confirmed { background: #E3F2FD; color: #1565C0; border: 1px solid #BBDEFB; }
    .badge-preparing { background: #FFF3E0; color: #E65100; border: 1px solid #FFCC80; }
    .badge-delivery  { background: #EDE7F6; color: #512DA8; border: 1px solid #D1C4E9; }
    .badge-delivered { background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
    .badge-cancelled { background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2; }

    .items-text { font-size: 13px; color: #555; font-weight: 500; }

    .order-meta-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed #EEE;
    }
    .meta-addr { font-size: 12px; color: #666; max-width: 70%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta-price { font-size: 14px; font-weight: 800; color: #2E7D32; }

    /* TIMELINE */
    .timeline-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .timeline-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
    .timeline { display: flex; flex-direction: column; }
    .timeline-item { display: flex; gap: 12px; }
    .timeline-left { display: flex; flex-direction: column; align-items: center; width: 32px; flex-shrink: 0; }
    .timeline-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #EEE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #999;
      border: 3px solid #EEE;
      transition: all 0.3s;
      flex-shrink: 0;
      &.done { background: #2E7D32; color: #fff; border-color: #2E7D32; }
      &.current { background: #fff; border-color: #2E7D32; color: #2E7D32; animation: pulse 1.5s infinite; }
    }
    @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(46,125,50,0.3); } 50% { box-shadow: 0 0 0 8px rgba(46,125,50,0); } }
    .dot-inner { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .timeline-line { flex: 1; width: 3px; background: #EEE; margin: 4px 0; min-height: 32px; transition: background 0.3s; &.done { background: #2E7D32; } }
    .timeline-content { flex: 1; display: flex; align-items: flex-start; gap: 10px; padding-bottom: 20px; }
    .timeline-item:last-child .timeline-content { padding-bottom: 4px; }
    .tl-icon { font-size: 22px; }
    .tl-text { flex: 1; }
    .tl-label { font-size: 14px; font-weight: 700; color: #1A1A1A; margin-bottom: 2px; }
    .tl-desc { font-size: 12px; color: #999; }
    .tl-time { font-size: 12px; font-weight: 600; color: #666; white-space: nowrap; }
    .timeline-item:not(.done):not(.current) .tl-label { color: #bbb; }

    /* HELP */
    .help-section { margin-bottom: 100px; }
    .help-btn {
      width: 100%;
      background: #fff;
      border: 1.5px solid #EEE;
      border-radius: 14px;
      padding: 14px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      color: #555;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 0.2s;
      &:hover { border-color: #4CAF50; color: #2E7D32; background: #F1F8E9; }
    }
  `]
})
export class TrackOrderComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  authService = inject(AuthService);

  orderId = signal('FC12345');

  currentOrder = computed(() => {
    const id = this.orderId();
    const orders = this.dataService.orders();
    if (!orders || orders.length === 0) return null;

    // 1. Direct full ID match
    let found = orders.find(o => o.id === id);
    if (found) return found;

    // 2. Suffix match (e.g. last 6 uppercase chars)
    found = orders.find(o => o.id.slice(-6).toUpperCase() === id.toUpperCase());
    if (found) return found;

    // 3. Current logged in user's matching orders
    const user = this.authService.currentUser();
    if (user) {
      const userOrder = orders.find(o =>
        (o.userId && o.userId === user.uid) ||
        (user.phone && o.customerPhone && o.customerPhone.includes(user.phone))
      );
      if (userOrder) return userOrder;
    }

    // 4. Fallback if id is placeholder 'FC12345' or not found: latest placed order
    return orders[0];
  });

  displayOrderId = computed(() => {
    const o = this.currentOrder();
    if (o) {
      return o.id.length > 8 ? o.id.slice(-6).toUpperCase() : o.id;
    }
    return this.orderId();
  });

  // Base timestamp of the order (exact placedAt or 10 mins ago fallback)
  orderDate = computed<Date>(() => {
    const o = this.currentOrder();
    if (o?.placedAt) {
      const d = new Date(o.placedAt);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(Date.now() - 10 * 60 * 1000);
  });

  private formatTime(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  // Exactly 30 minutes after order placement time
  estimatedDeliveryTime = computed(() => {
    const base = this.orderDate();
    const deliveryDate = new Date(base.getTime() + 30 * 60 * 1000);
    return this.formatTime(deliveryDate);
  });

  etaLabel = computed(() => 'Estimated Delivery');

  currentStatusLabel = computed(() => {
    const o = this.currentOrder();
    const st = o?.status || 'confirmed';
    switch (st) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Kitchen Preparing';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered Fresh';
      case 'cancelled': return 'Cancelled';
      default: return 'Order Confirmed';
    }
  });

  currentStatusBadgeClass = computed(() => {
    const o = this.currentOrder();
    const st = o?.status || 'confirmed';
    switch (st) {
      case 'pending': return 'badge-pending';
      case 'confirmed': return 'badge-confirmed';
      case 'preparing': return 'badge-preparing';
      case 'out-for-delivery': return 'badge-delivery';
      case 'delivered': return 'badge-delivered';
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-confirmed';
    }
  });

  getVehicleEmoji = computed(() => {
    const o = this.currentOrder();
    const st = o?.status || 'confirmed';
    if (st === 'delivered') return '🛵';
    if (st === 'cancelled') return '❌';
    if (st === 'out-for-delivery') return '🛵';
    if (st === 'preparing') return '👨‍🍳';
    return '🛵';
  });

  trackSteps = computed<TrackStep[]>(() => {
    const o = this.currentOrder();
    const st = o?.status || 'confirmed';
    const base = this.orderDate();

    const placedTime = this.formatTime(base);
    const prepTime = this.formatTime(new Date(base.getTime() + 8 * 60 * 1000));
    const outTime = this.formatTime(new Date(base.getTime() + 18 * 60 * 1000));
    // Step 4 is exactly 30 minutes after order date
    const delTime = this.formatTime(new Date(base.getTime() + 30 * 60 * 1000));

    return [
      {
        id: 'placed',
        label: 'Order Confirmed',
        time: placedTime,
        desc: st === 'pending' ? 'Waiting for restaurant confirmation' : 'Your healthy order is confirmed',
        icon: '📋',
        done: st !== 'pending' && st !== 'cancelled'
      },
      {
        id: 'preparing',
        label: 'Kitchen Preparing',
        time: st === 'pending' ? 'Upcoming' :
              st === 'confirmed' ? 'Starting soon' :
              st === 'preparing' ? 'Just now' : prepTime,
        desc: 'Fresh fruits and herbs being prepped',
        icon: '👨‍🍳',
        done: st === 'out-for-delivery' || st === 'delivered'
      },
      {
        id: 'out',
        label: 'Out for Delivery',
        time: (st === 'pending' || st === 'confirmed') ? 'Upcoming' :
              st === 'preparing' ? 'Est. 15 mins' :
              st === 'out-for-delivery' ? 'On the way' : outTime,
        desc: 'Delivery hero is on the way to your door',
        icon: '🛵',
        done: st === 'delivered'
      },
      {
        id: 'delivered',
        label: 'Delivered Fresh',
        time: st === 'delivered' ? 'Delivered' : `Est. ${delTime}`,
        desc: st === 'delivered' ? 'Enjoy your delicious fruit meal!' : 'Your fresh fruit meal arrives soon',
        icon: '✅',
        done: st === 'delivered'
      }
    ];
  });

  getItemsSummary(): string {
    const o = this.currentOrder();
    if (o?.items && o.items.length > 0) {
      return o.items.map(i => `${i.productName} × ${i.quantity}`).join(' • ');
    }
    return 'Mix Fruit Chaat • Masala Sprouts';
  }

  getAddressSummary(): string {
    const o = this.currentOrder();
    const addr = o?.deliveryAddress;
    if (addr?.addressLine1) {
      return addr.addressLine2 ? `${addr.addressLine1}, ${addr.addressLine2}` : addr.addressLine1;
    }
    return 'Flat 402, Green Valley Apartments, Sector 15';
  }

  getOrderTotal(): number {
    const o = this.currentOrder();
    return o?.grandTotal ?? 180;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.orderId.set(id);
    });
    this.route.queryParamMap.subscribe(params => {
      const qId = params.get('orderId');
      if (qId && !this.route.snapshot.paramMap.get('id')) {
        this.orderId.set(qId);
      }
    });
  }

  isCurrentStep(step: TrackStep): boolean {
    const o = this.currentOrder();
    const st = o?.status || 'confirmed';
    if (st === 'cancelled') return false;
    if (st === 'delivered') return step.id === 'delivered';
    if (st === 'out-for-delivery') return step.id === 'out';
    if (st === 'preparing') return step.id === 'preparing';
    if (st === 'pending') return step.id === 'placed';
    if (st === 'confirmed') return step.id === 'preparing';
    return false;
  }
}
