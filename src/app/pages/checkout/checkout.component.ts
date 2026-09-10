import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout-page">
      <!-- HEADER -->
      <div class="checkout-header">
        <button class="back-btn" (click)="router.navigate(['/cart'])" aria-label="Back to Cart">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Cart</span>
        </button>
        <h2 class="checkout-title">Checkout</h2>
        <div class="header-spacer"></div>
      </div>

      <!-- STEPPER -->
      <div class="stepper-wrap">
        <div class="stepper">
          @for (step of steps; track step.num) {
            <div class="step-item" [class.active]="currentStep() >= step.num" [class.current]="currentStep() === step.num">
              <div class="step-circle">
                @if (currentStep() > step.num) {
                  <span>✓</span>
                } @else {
                  <span>{{ step.num }}</span>
                }
              </div>
              <span class="step-label">{{ step.label }}</span>
            </div>
            @if (step.num < steps.length) {
              <div class="step-line" [class.active]="currentStep() > step.num"></div>
            }
          }
        </div>
      </div>

      <!-- STEP CONTENT -->
      <div class="container step-content">

        <!-- STEP 1: ADDRESS -->
        @if (currentStep() === 1) {
          <div class="step-pane animate-fadeInUp">
            <h3 class="step-heading">Delivery Address</h3>
            <div class="saved-address">
              <div class="addr-icon">📍</div>
              <div class="addr-info">
                <p class="addr-name">{{ address.name || 'Add your name' }}</p>
                <p class="addr-text">{{ address.addressLine1 || '123, Green Park, Indore' }}</p>
                <p class="addr-city">{{ address.city || 'Madhya Pradesh - 452001' }}</p>
              </div>
              <button class="edit-btn" (click)="editingAddress.set(!editingAddress())">
                {{ editingAddress() ? 'Done' : 'Edit' }}
              </button>
            </div>

            @if (editingAddress()) {
              <div class="address-form">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" [(ngModel)]="address.name" placeholder="Your full name">
                </div>
                <div class="form-group">
                  <label>Phone *</label>
                  <input type="tel" [(ngModel)]="address.phone" placeholder="10-digit mobile number">
                </div>
                <div class="form-group">
                  <label>Address Line 1 *</label>
                  <input type="text" [(ngModel)]="address.addressLine1" placeholder="House/Flat No., Street">
                </div>
                <div class="form-group">
                  <label>Address Line 2</label>
                  <input type="text" [(ngModel)]="address.addressLine2" placeholder="Landmark (optional)">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>City *</label>
                    <input type="text" [(ngModel)]="address.city" placeholder="City">
                  </div>
                  <div class="form-group">
                    <label>Pincode *</label>
                    <input type="text" [(ngModel)]="address.pincode" placeholder="6-digit pincode">
                  </div>
                </div>
              </div>
            }

            <button class="add-address-btn">+ Add New Address</button>
          </div>
        }

        <!-- STEP 2: PAYMENT -->
        @if (currentStep() === 2) {
          <div class="step-pane animate-fadeInUp">
            <h3 class="step-heading">Payment Method</h3>
            <div class="payment-options">
              @for (method of paymentMethods; track method.id) {
                <label class="payment-option" [class.selected]="selectedPayment() === method.id">
                  <input type="radio" name="payment" [value]="method.id" [(ngModel)]="paymentVal" (change)="selectedPayment.set(method.id)">
                  <div class="payment-radio">
                    <div class="radio-circle" [class.selected]="selectedPayment() === method.id"></div>
                    <div class="payment-info">
                      <span class="method-icon">{{ method.icon }}</span>
                      <div>
                        <p class="method-name">{{ method.name }}</p>
                        <p class="method-sub">{{ method.sub }}</p>
                      </div>
                    </div>
                  </div>
                </label>
              }
            </div>

            <!-- ORDER SUMMARY -->
            <div class="order-summary">
              <h4>Order Summary</h4>
              @for (item of cartService.items(); track item.product.id) {
                <div class="summary-item">
                  <div class="summary-item-left">
                    <img [src]="item.product.image" [alt]="item.product.name" class="summary-img">
                    <div>
                      <p class="summary-name">{{ item.product.name }}</p>
                      <p class="summary-qty">Qty: {{ item.quantity }}</p>
                    </div>
                  </div>
                  <span class="summary-price">₹{{ item.totalPrice }}</span>
                </div>
              }
              <div class="summary-totals">
                <div class="total-row"><span>Item Total</span><span>₹{{ cartService.itemTotal() }}</span></div>
                <div class="total-row"><span>Delivery</span><span>₹{{ cartService.deliveryCharge() }}</span></div>
                <div class="divider"></div>
                <div class="total-row grand"><span>Grand Total</span><span>₹{{ cartService.grandTotal() }}</span></div>
              </div>
            </div>
          </div>
        }

        <!-- STEP 3: CONFIRM -->
        @if (currentStep() === 3) {
          <div class="step-pane animate-fadeInUp">
            <h3 class="step-heading">Confirm Order</h3>
            <div class="confirm-section">
              <div class="confirm-row">
                <span class="confirm-label">📍 Deliver to</span>
                <span class="confirm-val">{{ address.addressLine1 || 'Green Park, Indore' }}</span>
              </div>
              <div class="confirm-row">
                <span class="confirm-label">💳 Payment</span>
                <span class="confirm-val">{{ getPaymentName() }}</span>
              </div>
              <div class="confirm-row">
                <span class="confirm-label">🛒 Items</span>
                <span class="confirm-val">{{ cartService.totalItems() }} items</span>
              </div>
              <div class="confirm-row grand-row">
                <span class="confirm-label">💰 Total</span>
                <span class="confirm-total">₹{{ cartService.grandTotal() }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- CTA BUTTON -->
      <div class="checkout-cta">
        @if (currentStep() < 3) {
          <button class="btn-next" (click)="nextStep()">
            {{ currentStep() === 2 ? 'Review Order' : 'Continue' }} →
          </button>
        } @else {
          <button class="btn-place" (click)="placeOrder()">
            {{ loading() ? 'Placing...' : 'Place Order 🎉' }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .checkout-page { background: #F8F9FA; min-height: 100vh; }

    .checkout-header {
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

    .checkout-title {
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

    /* STEPPER */
    .stepper-wrap { background: #fff; padding: 16px 20px; border-bottom: 1px solid #EEE; }
    .stepper { display: flex; align-items: center; justify-content: center; gap: 0; }
    .step-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-circle { width: 28px; height: 28px; border-radius: 50%; background: #EEE; color: #999; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
    .step-item.active .step-circle { background: #2E7D32; color: #fff; }
    .step-label { font-size: 10px; font-weight: 500; color: #999; white-space: nowrap; }
    .step-item.active .step-label { color: #2E7D32; font-weight: 600; }
    .step-line { height: 2px; width: 60px; background: #EEE; margin: 0 4px; margin-bottom: 20px; transition: background 0.3s; }
    .step-line.active { background: #2E7D32; }

    /* STEP CONTENT */
    .step-content { padding-top: 20px; padding-bottom: 120px; }
    .step-pane { }
    .step-heading { font-size: 17px; font-weight: 800; margin-bottom: 16px; }

    /* ADDRESS */
    .saved-address { background: #fff; border-radius: 14px; padding: 16px; display: flex; align-items: flex-start; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 12px; }
    .addr-icon { font-size: 24px; }
    .addr-info { flex: 1; .addr-name { font-size: 14px; font-weight: 700; margin-bottom: 3px; } .addr-text { font-size: 13px; color: #555; } .addr-city { font-size: 12px; color: #999; } }
    .edit-btn { background: none; border: none; color: #2E7D32; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }

    .address-form { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 12px; }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; } input { width: 100%; border: 1.5px solid #EEE; border-radius: 10px; padding: 10px 14px; font-family: 'Poppins', sans-serif; font-size: 14px; color: #1A1A1A; outline: none; transition: border-color 0.2s; &:focus { border-color: #4CAF50; } &::placeholder { color: #bbb; } } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .add-address-btn { width: 100%; background: none; border: 2px dashed #C8E6C9; border-radius: 12px; padding: 14px; color: #2E7D32; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; &:hover { background: #F1F8E9; } }

    /* PAYMENT */
    .payment-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .payment-option { cursor: pointer; input { display: none; } }
    .payment-radio { background: #fff; border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 2px solid transparent; transition: all 0.2s; }
    .payment-option.selected .payment-radio { border-color: #4CAF50; background: #F1F8E9; }
    .radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #DDD; transition: all 0.2s; flex-shrink: 0; &.selected { border-color: #2E7D32; border-width: 6px; } }
    .payment-info { display: flex; align-items: center; gap: 12px; }
    .method-icon { font-size: 24px; }
    .method-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .method-sub { font-size: 11px; color: #999; }

    /* ORDER SUMMARY */
    .order-summary { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); h4 { font-size: 15px; font-weight: 700; margin-bottom: 14px; } }
    .summary-item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .summary-item-left { display: flex; align-items: center; gap: 10px; }
    .summary-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
    .summary-name { font-size: 13px; font-weight: 600; }
    .summary-qty { font-size: 11px; color: #999; }
    .summary-price { font-size: 14px; font-weight: 700; }
    .summary-totals { margin-top: 12px; }
    .total-row { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 8px; &.grand { font-size: 16px; font-weight: 800; color: #1A1A1A; } }
    .divider { height: 1px; background: #EEE; margin: 8px 0; }

    /* CONFIRM */
    .confirm-section { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .confirm-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F5F5F5; &:last-child { border-bottom: none; } }
    .confirm-label { font-size: 13px; color: #999; }
    .confirm-val { font-size: 14px; font-weight: 600; color: #1A1A1A; }
    .grand-row { }
    .confirm-total { font-size: 20px; font-weight: 800; color: #2E7D32; }

    /* CTA */
    .checkout-cta { position: fixed; bottom: 80px; left: 0; right: 0; padding: 12px 20px; background: linear-gradient(to top, #F8F9FA 80%, transparent); @media (min-width: 768px) { bottom: 0; } }
    .btn-next, .btn-place { width: 100%; max-width: 480px; margin: 0 auto; display: block; border: none; border-radius: 14px; padding: 16px; font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 20px rgba(46,125,50,0.35); }
    .btn-next { background: #2E7D32; color: #fff; &:hover { background: #1B5E20; transform: translateY(-2px); } }
    .btn-place { background: linear-gradient(135deg, #2E7D32, #4CAF50); color: #fff; &:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(46,125,50,0.45); } }

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadeInUp { animation: fadeInUp 0.35s ease both; }
  `]
})
export class CheckoutComponent {
  router = inject(Router);
  cartService = inject(CartService);

  currentStep = signal(1);
  loading = signal(false);
  editingAddress = signal(false);
  selectedPayment = signal('upi');
  paymentVal = 'upi';

  address = { name: 'Rohit Porwal', phone: '9876543210', addressLine1: '123, Green Park, Indore', addressLine2: '', city: 'Indore', pincode: '452001' };

  steps = [
    { num: 1, label: 'Address' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Confirm' }
  ];

  paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱', sub: 'Google Pay, PhonePe, Paytm, etc.' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', sub: 'Pay when order arrives' },
    { id: 'card', name: 'Card / Wallet', icon: '💳', sub: 'Debit / Credit Card' }
  ];

  nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.update(v => v + 1);
    }
  }

  placeOrder(): void {
    this.loading.set(true);
    const orderId = 'FC' + Math.floor(10000 + Math.random() * 90000);
    setTimeout(() => {
      this.cartService.clearCart();
      this.loading.set(false);
      this.router.navigate(['/order-success'], { queryParams: { orderId } });
    }, 1500);
  }

  getPaymentName(): string {
    return this.paymentMethods.find(m => m.id === this.selectedPayment())?.name ?? 'UPI';
  }
}
