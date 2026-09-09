import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
        <button class="back-btn" (click)="router.navigate(['/'])">← Home</button>
        <h2>Track Order</h2>
        <span></span>
      </div>

      <!-- MAP PLACEHOLDER -->
      <div class="map-section">
        <div class="map-placeholder">
          <div class="map-overlay">
            <div class="delivery-pin">🛵</div>
            <div class="delivery-wave"></div>
          </div>
          <div class="eta-card">
            <span class="eta-label">Estimated Delivery</span>
            <span class="eta-time">10:50 AM</span>
          </div>
        </div>
      </div>

      <!-- ORDER INFO -->
      <div class="container">
        <div class="order-info-card">
          <div class="order-id-row">
            <span class="order-id-label">Order #{{ orderId() }}</span>
            <span class="order-status-badge">{{ currentStatusLabel() }}</span>
          </div>
          <div class="order-items-preview">
            <span class="items-text">🌱 Mix Fruit Chaat • Masala Sprouts</span>
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
          <button class="help-btn">💬 Need help with your order?</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .track-page { background: #F8F9FA; min-height: 100vh; }

    .track-header { background: #fff; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: sticky; top: 0; z-index: 100; h2 { font-size: 18px; font-weight: 800; } @media (min-width: 768px) { top: 72px; } }
    .back-btn { background: none; border: none; font-size: 14px; font-weight: 600; color: #2E7D32; cursor: pointer; font-family: 'Poppins', sans-serif; }

    .map-section { height: 200px; background: linear-gradient(135deg, #E8F5E9, #C8E6C9, #A5D6A7); position: relative; overflow: hidden; }
    .map-placeholder { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
    .map-overlay { display: flex; flex-direction: column; align-items: center; }
    .delivery-pin { font-size: 48px; animation: bounce 1.2s infinite alternate; }
    .delivery-wave { width: 80px; height: 16px; background: rgba(0,0,0,0.08); border-radius: 50%; margin-top: 4px; }
    @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-12px); } }
    .eta-card { position: absolute; bottom: 16px; right: 16px; background: #fff; border-radius: 12px; padding: 10px 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; }
    .eta-label { font-size: 10px; color: #999; font-weight: 500; }
    .eta-time { font-size: 18px; font-weight: 800; color: #1A1A1A; }

    .order-info-card { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-top: 16px; margin-bottom: 16px; }
    .order-id-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .order-id-label { font-size: 15px; font-weight: 700; }
    .order-status-badge { background: #E8F5E9; color: #2E7D32; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px; }
    .items-text { font-size: 13px; color: #666; }

    /* TIMELINE */
    .timeline-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .timeline-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
    .timeline { display: flex; flex-direction: column; }
    .timeline-item { display: flex; gap: 12px; }
    .timeline-left { display: flex; flex-direction: column; align-items: center; width: 32px; flex-shrink: 0; }
    .timeline-dot { width: 28px; height: 28px; border-radius: 50%; background: #EEE; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #999; border: 3px solid #EEE; transition: all 0.3s; flex-shrink: 0; &.done { background: #2E7D32; color: #fff; border-color: #2E7D32; } &.current { background: #fff; border-color: #2E7D32; color: #2E7D32; animation: pulse 1.5s infinite; } }
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
    .help-btn { width: 100%; background: #fff; border: 1.5px solid #EEE; border-radius: 14px; padding: 14px; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; color: #555; transition: all 0.2s; &:hover { border-color: #4CAF50; color: #2E7D32; background: #F1F8E9; } }
  `]
})
export class TrackOrderComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);

  orderId = signal('FC12345');

  trackSteps = signal<TrackStep[]>([
    { id: 'placed', label: 'Order Placed', time: '10:32 AM', desc: 'Your order has been received', icon: '📋', done: true },
    { id: 'preparing', label: 'Preparing', time: '10:35 AM', desc: 'We are preparing your order', icon: '👨‍🍳', done: true },
    { id: 'out', label: 'Out for Delivery', time: '10:42 AM', desc: 'Your order is on the way', icon: '🛵', done: false },
    { id: 'delivered', label: 'Delivered', time: 'Est. 10:50 AM', desc: 'Estimated delivery time', icon: '✅', done: false }
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.orderId.set(id);
  }

  isCurrentStep(step: TrackStep): boolean {
    const steps = this.trackSteps();
    const idx = steps.findIndex(s => s.id === step.id);
    return idx > 0 && steps[idx - 1].done && !step.done;
  }

  currentStatusLabel(): string {
    const steps = this.trackSteps();
    const current = steps.find(s => !s.done);
    return current ? current.label : 'Delivered';
  }
}
