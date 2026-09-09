import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="success-page">
      <!-- CONFETTI CIRCLES -->
      <div class="confetti" aria-hidden="true">
        @for (i of confettiItems; track i) {
          <div class="confetti-piece" [style]="getConfettiStyle(i)"></div>
        }
      </div>

      <!-- SUCCESS CARD -->
      <div class="success-card animate-scaleIn">
        <!-- CHECK ICON -->
        <div class="check-circle">
          <div class="check-ring"></div>
          <div class="check-mark">✓</div>
        </div>

        <h1 class="success-title">Order Placed<br>Successfully!</h1>
        <p class="success-sub">Thank you for choosing FruitChat!<br>Your order <strong>#{{ orderId() }}</strong> has been placed.</p>

        <div class="success-info">
          <p>We'll notify you once it's out for delivery.</p>
        </div>

        <!-- ETA -->
        <div class="eta-box">
          <span class="eta-icon">🕐</span>
          <div>
            <p class="eta-label">Estimated Delivery</p>
            <p class="eta-val">25–30 minutes</p>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="success-actions">
          <a [routerLink]="['/track-order', orderId()]" class="btn-track">
            📍 Track Order
          </a>
          <a routerLink="/" class="btn-home">
            🏠 Back to Home
          </a>
        </div>
      </div>

      <!-- ITEMS PREVIEW -->
      <div class="order-preview">
        <div class="preview-item">
          <img src="assets/images/mix-fruit-chaat.jpg" alt="Mix Fruit Chaat">
          <span>Mix Fruit Chaat</span>
        </div>
        <div class="preview-item">
          <img src="assets/images/masala-sprouts.jpg" alt="Masala Sprouts">
          <span>Masala Sprouts</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-page {
      min-height: 100vh;
      background: linear-gradient(160deg, #F1F8E9 0%, #E8F5E9 40%, #DCEDC8 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 20px 100px;
      position: relative;
      overflow: hidden;
    }

    /* CONFETTI */
    .confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      animation: confettiFall linear infinite;
    }
    @keyframes confettiFall {
      0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }

    /* SUCCESS CARD */
    .success-card {
      background: #fff;
      border-radius: 28px;
      padding: 36px 28px 28px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
      max-width: 380px;
      width: 100%;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    /* CHECK CIRCLE */
    .check-circle {
      width: 88px;
      height: 88px;
      margin: 0 auto 20px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .check-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 4px solid #4CAF50;
      animation: ringPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }

    .check-mark {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      color: #fff;
      font-size: 36px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: bounceIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both;
      box-shadow: 0 8px 24px rgba(46,125,50,0.35);
    }

    @keyframes ringPop {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes bounceIn {
      from { transform: scale(0); }
      60% { transform: scale(1.2); }
      to { transform: scale(1); }
    }

    .success-title { font-size: 24px; font-weight: 800; color: #1A1A1A; line-height: 1.2; margin-bottom: 12px; }
    .success-sub { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; }
    .success-info { background: #F1F8E9; border-radius: 12px; padding: 10px 16px; margin-bottom: 16px; font-size: 13px; color: #2E7D32; font-weight: 500; }

    .eta-box {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #FFF8E1;
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 24px;
      text-align: left;
      .eta-icon { font-size: 28px; }
      .eta-label { font-size: 11px; color: #999; font-weight: 500; }
      .eta-val { font-size: 16px; font-weight: 800; color: #F57F17; }
    }

    .success-actions { display: flex; flex-direction: column; gap: 10px; }

    .btn-track, .btn-home {
      display: block;
      border-radius: 14px;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .btn-track {
      background: #2E7D32;
      color: #fff;
      box-shadow: 0 6px 20px rgba(46,125,50,0.3);
      &:hover { background: #1B5E20; transform: translateY(-2px); }
    }

    .btn-home {
      background: #F8F9FA;
      color: #1A1A1A;
      border: 1.5px solid #EEE;
      &:hover { background: #F1F8E9; border-color: #4CAF50; color: #2E7D32; }
    }

    /* ORDER PREVIEW */
    .order-preview {
      display: flex;
      gap: 12px;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    .preview-item {
      background: #fff;
      border-radius: 14px;
      padding: 10px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      width: 100px;

      img {
        width: 70px;
        height: 70px;
        border-radius: 10px;
        object-fit: cover;
        margin-bottom: 6px;
      }

      span {
        font-size: 11px;
        font-weight: 600;
        color: #555;
        display: block;
      }
    }

    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    .animate-scaleIn { animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
  `]
})
export class OrderSuccessComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  orderId = signal('FC12345');

  confettiItems = Array.from({ length: 20 }, (_, i) => i);

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('orderId');
    if (id) this.orderId.set(id);
  }

  getConfettiStyle(i: number): string {
    const colors = ['#2E7D32', '#4CAF50', '#FFC107', '#FF6B35', '#9C27B0', '#2196F3'];
    const color = colors[i % colors.length];
    const left = (i * 5 + Math.random() * 10) % 100;
    const delay = (i * 0.3) % 5;
    const duration = 3 + (i % 4);
    return `left:${left}%;background:${color};animation-delay:${delay}s;animation-duration:${duration}s;top:-20px;`;
  }
}
