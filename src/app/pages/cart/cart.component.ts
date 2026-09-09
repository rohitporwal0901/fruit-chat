import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="cart-page">
      <!-- HEADER -->
      <div class="cart-header">
        <button class="back-btn" (click)="router.navigate(['/menu'])">← Menu</button>
        <h2 class="cart-title">My Cart</h2>
        @if (cartService.totalItems() > 0) {
          <button class="clear-btn" (click)="clearCart()">🗑️ Clear</button>
        }
      </div>

      @if (cartService.items().length === 0) {
        <!-- EMPTY CART -->
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some delicious items to your cart!</p>
          <a routerLink="/menu" class="btn-primary">Browse Menu</a>
        </div>
      } @else {
        <!-- CART ITEMS -->
        <div class="container">
          <div class="cart-items-section">
            @for (item of cartService.items(); track item.product.id) {
              <div class="cart-item animate-fadeInUp">
                <img [src]="item.product.image" [alt]="item.product.name" class="item-img">
                <div class="item-info">
                  <h4 class="item-name">{{ item.product.name }}</h4>
                  @if (item.selectedCustomizations.length > 0) {
                    <p class="item-customs">{{ item.selectedCustomizations.join(', ') }}</p>
                  }
                  <span class="item-price">₹{{ item.product.price }}</span>
                </div>
                <div class="item-actions">
                  <button class="del-btn" (click)="remove(item.product.id)">🗑️</button>
                  <div class="mini-stepper">
                    <button class="step-btn" (click)="decrease(item.product.id, item.quantity)">−</button>
                    <span class="step-val">{{ item.quantity }}</span>
                    <button class="step-btn" (click)="increase(item.product.id, item.quantity)">+</button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- COUPON -->
          <div class="coupon-section">
            <div class="coupon-input-wrap">
              <span class="coupon-icon">🎟️</span>
              <input type="text" class="coupon-input" placeholder="Apply Coupon Code" [(ngModel)]="couponCode">
              <button class="apply-btn" (click)="applyCoupon()">Apply</button>
            </div>
            @if (couponApplied()) {
              <p class="coupon-success">✅ Coupon FRESH10 applied! You save ₹10</p>
            }
          </div>

          <!-- BILL SUMMARY -->
          <div class="bill-section">
            <h3 class="bill-title">Bill Summary</h3>
            <div class="bill-rows">
              <div class="bill-row">
                <span>Item Total</span>
                <span>₹{{ cartService.itemTotal() }}</span>
              </div>
              @if (couponApplied()) {
                <div class="bill-row discount">
                  <span>Discount (FRESH10)</span>
                  <span class="discount-val">- ₹10</span>
                </div>
              }
              <div class="bill-row">
                <span>Delivery Charges</span>
                <span class="delivery-charge">₹{{ cartService.deliveryCharge() }}</span>
              </div>
              <div class="divider"></div>
              <div class="bill-row total">
                <span>Grand Total</span>
                <span>₹{{ finalTotal() }}</span>
              </div>
            </div>
          </div>

          <!-- DELIVERY INFO -->
          <div class="delivery-info">
            <span class="delivery-icon">🚴</span>
            <p>Estimated delivery: <strong>25-30 minutes</strong></p>
          </div>
        </div>

        <!-- CTA -->
        <div class="cart-cta">
          <button class="btn-checkout" (click)="router.navigate(['/checkout'])">
            Proceed to Checkout →
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page { background: #F8F9FA; min-height: 100vh; }

    .cart-header {
      background: #fff;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      position: sticky;
      top: 0;
      z-index: 100;
      @media (min-width: 768px) { top: 72px; }
    }

    .back-btn {
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 600;
      color: #2E7D32;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      padding: 0;
    }

    .cart-title {
      flex: 1;
      font-size: 18px;
      font-weight: 800;
      text-align: center;
    }

    .clear-btn {
      background: none;
      border: none;
      font-size: 13px;
      color: #FF6B35;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
    }

    /* EMPTY */
    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      text-align: center;
      gap: 12px;
      .empty-icon { font-size: 72px; }
      h3 { font-size: 20px; font-weight: 700; }
      p { color: #999; font-size: 14px; }
      .btn-primary { margin-top: 8px; padding: 14px 36px; background: #2E7D32; color: #fff; border-radius: 999px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block; }
    }

    /* CART ITEMS */
    .cart-items-section {
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cart-item {
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .item-img {
      width: 72px;
      height: 72px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      min-width: 0;
      .item-name { font-size: 14px; font-weight: 700; margin-bottom: 3px; color: #1A1A1A; }
      .item-customs { font-size: 11px; color: #999; margin-bottom: 5px; }
      .item-price { font-size: 15px; font-weight: 700; color: #2E7D32; }
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .del-btn {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 0.2s;
      &:hover { opacity: 1; }
    }

    .mini-stepper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #F1F8E9;
      border-radius: 8px;
      padding: 4px 8px;
      border: 1.5px solid #4CAF50;
    }

    .step-btn {
      width: 24px; height: 24px;
      border-radius: 6px;
      background: #2E7D32;
      color: #fff;
      border: none;
      font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
      line-height: 1;
      font-family: inherit;
      &:hover { background: #1B5E20; }
    }

    .step-val { font-weight: 700; font-size: 14px; color: #2E7D32; min-width: 16px; text-align: center; }

    /* COUPON */
    .coupon-section {
      margin-top: 16px;
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .coupon-input-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      .coupon-icon { font-size: 20px; }
      .coupon-input {
        flex: 1;
        border: none;
        outline: none;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        color: #1A1A1A;
        &::placeholder { color: #bbb; }
      }
      .apply-btn {
        background: none;
        border: none;
        color: #2E7D32;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        font-family: 'Poppins', sans-serif;
        padding: 0;
      }
    }

    .coupon-success {
      font-size: 12px;
      color: #2E7D32;
      margin-top: 8px;
      font-weight: 500;
    }

    /* BILL */
    .bill-section {
      margin-top: 16px;
      background: #fff;
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .bill-title { font-size: 15px; font-weight: 700; margin-bottom: 14px; }

    .bill-rows { display: flex; flex-direction: column; gap: 10px; }

    .bill-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #555;

      &.total { font-size: 16px; font-weight: 800; color: #1A1A1A; }
      &.discount { color: #2E7D32; }
      .discount-val { color: #2E7D32; font-weight: 600; }
      .delivery-charge { color: #999; }
    }

    .divider { height: 1px; background: #EEE; margin: 2px 0; }

    /* DELIVERY INFO */
    .delivery-info {
      margin-top: 12px;
      background: #F1F8E9;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #555;
      margin-bottom: 100px;
      .delivery-icon { font-size: 20px; }
    }

    /* CTA */
    .cart-cta {
      position: fixed;
      bottom: 80px;
      left: 0; right: 0;
      padding: 12px 20px;
      background: linear-gradient(to top, #F8F9FA 80%, transparent);
      @media (min-width: 768px) { bottom: 0; }
    }

    .btn-checkout {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      display: block;
      background: #2E7D32;
      color: #fff;
      border: none;
      border-radius: 14px;
      padding: 16px;
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 6px 20px rgba(46,125,50,0.35);
      &:hover { background: #1B5E20; transform: translateY(-2px); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeInUp { animation: fadeInUp 0.35s ease both; }
  `]
})
export class CartComponent {
  cartService = inject(CartService);
  router = inject(Router);
  couponCode = '';
  couponApplied = signal(false);

  finalTotal = () => {
    const base = this.cartService.grandTotal();
    return this.couponApplied() ? base - 10 : base;
  };

  increase(id: string, qty: number): void { this.cartService.updateQty(id, qty + 1); }
  decrease(id: string, qty: number): void { this.cartService.updateQty(id, qty - 1); }
  remove(id: string): void { this.cartService.removeFromCart(id); }
  clearCart(): void { this.cartService.clearCart(); }

  applyCoupon(): void {
    if (this.couponCode.trim().toUpperCase() === 'FRESH10') {
      this.couponApplied.set(true);
    }
  }
}
