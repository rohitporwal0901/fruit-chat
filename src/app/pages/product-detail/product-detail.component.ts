import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (product()) {
    <div class="detail-page">
      <button class="back-btn" (click)="goBack()">← Back</button>
      <div class="detail-hero">
        <img [src]="product()!.image" [alt]="product()!.name" class="detail-img">
        <button class="wishlist-btn">♡</button>
      </div>
      <div class="detail-content">
        <div class="detail-top">
          <div class="detail-meta-row">
            <span class="veg-badge">🌱 Veg</span>
            @if (product()!.isBestseller) {
              <span class="bestseller-badge">⭐ Bestseller</span>
            }
            <div class="rating-pill">★ {{ product()!.rating }} ({{ product()!.ratingCount }})</div>
          </div>
          <h1 class="detail-name">{{ product()!.name }}</h1>
          <div class="detail-price-row">
            <span class="detail-price">₹{{ product()!.price }}</span>
            @if (product()!.originalPrice) {
              <span class="detail-orig-price">₹{{ product()!.originalPrice }}</span>
              <span class="discount-chip">{{ getDiscount() }}% OFF</span>
            }
          </div>
        </div>
        <p class="detail-desc">{{ product()!.description }}</p>
        <div class="info-pills">
          @if (product()!.preparationTime) {
            <div class="info-pill"><span>⏱️</span> {{ product()!.preparationTime }} min prep</div>
          }
          @if (product()!.calories) {
            <div class="info-pill"><span>🔥</span> {{ product()!.calories }} kcal</div>
          }
        </div>
        <div class="divider"></div>
        @if (product()!.ingredients?.length) {
          <div class="detail-section">
            <h3 class="section-heading">Ingredients</h3>
            <p class="ingredients-text">{{ product()!.ingredients!.join(', ') }}</p>
          </div>
          <div class="divider"></div>
        }
        @if (product()!.customizations?.length) {
          <div class="detail-section">
            <h3 class="section-heading">Customize Your Order</h3>
            <div class="customization-list">
              @for (custom of product()!.customizations!; track custom.id) {
                <label class="custom-item" [for]="custom.id">
                  <div class="custom-check-wrap">
                    <input type="checkbox" [id]="custom.id" [checked]="selectedCustoms().includes(custom.id)" (change)="toggleCustom(custom.id)">
                    <div class="custom-checkmark">@if(selectedCustoms().includes(custom.id)){<span>✓</span>}</div>
                  </div>
                  <span class="custom-name">{{ custom.name }}</span>
                  @if (custom.extraPrice > 0) {
                    <span class="custom-price">+ ₹{{ custom.extraPrice }}</span>
                  }
                </label>
              }
            </div>
          </div>
          <div class="divider"></div>
        }
        <div class="qty-section">
          <h3 class="section-heading">Quantity</h3>
          <div class="qty-stepper">
            <button class="qty-btn" (click)="decrement()" [disabled]="qty() === 1">−</button>
            <span class="qty-val">{{ qty() }}</span>
            <button class="qty-btn" (click)="increment()">+</button>
          </div>
        </div>
      </div>
      <div class="detail-cta">
        <button class="btn-add-cart" (click)="addToCart()">
          Add to Cart • ₹{{ computeTotal() }}
        </button>
      </div>
      @if (showToast()) {
        <div class="toast">✅ Added to cart!</div>
      }
    </div>
    } @else {
      <div class="not-found">
        <p>Product not found</p>
        <a routerLink="/menu">← Back to Menu</a>
      </div>
    }
  `,
  styles: [`
    .detail-page { background: #fff; min-height: 100vh; position: relative; max-width: 600px; margin: 0 auto; }
    .back-btn { position: absolute; top: 16px; left: 16px; z-index: 10; background: rgba(255,255,255,0.92); border: none; border-radius: 999px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; backdrop-filter: blur(8px); box-shadow: 0 2px 8px rgba(0,0,0,0.12); font-family: 'Poppins', sans-serif; transition: all 0.2s; &:hover { background: #fff; transform: translateX(-2px); } }
    .detail-hero { position: relative; aspect-ratio: 4/3; overflow: hidden; }
    .detail-img { width: 100%; height: 100%; object-fit: cover; }
    .wishlist-btn { position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.92); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: all 0.2s; &:hover { transform: scale(1.1); } }
    .detail-content { padding: 20px 20px 100px; }
    .detail-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .veg-badge { font-size: 11px; font-weight: 600; color: #2E7D32; background: #F1F8E9; padding: 3px 10px; border-radius: 999px; border: 1px solid #C8E6C9; }
    .bestseller-badge { font-size: 11px; font-weight: 600; color: #E65100; background: #FFF3E0; padding: 3px 10px; border-radius: 999px; }
    .rating-pill { font-size: 11px; font-weight: 600; color: #F57F17; background: #FFFDE7; padding: 3px 10px; border-radius: 999px; }
    .detail-name { font-size: 22px; font-weight: 800; color: #1A1A1A; margin-bottom: 8px; line-height: 1.2; }
    .detail-price-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .detail-price { font-size: 24px; font-weight: 800; color: #1A1A1A; }
    .detail-orig-price { font-size: 15px; color: #bbb; text-decoration: line-through; }
    .discount-chip { background: #FF6B35; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
    .detail-desc { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; }
    .info-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
    .info-pill { display: flex; align-items: center; gap: 5px; background: #F8F9FA; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; color: #555; border: 1px solid #EEE; }
    .divider { height: 1px; background: #EEE; margin: 16px 0; }
    .detail-section { margin-bottom: 4px; }
    .section-heading { font-size: 15px; font-weight: 700; color: #1A1A1A; margin-bottom: 12px; }
    .ingredients-text { font-size: 13px; color: #666; line-height: 1.6; }
    .customization-list { display: flex; flex-direction: column; gap: 10px; }
    .custom-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #F8F9FA; border-radius: 12px; cursor: pointer; transition: all 0.2s; border: 1.5px solid transparent; &:hover { border-color: #C8E6C9; background: #F1F8E9; } input[type="checkbox"] { display: none; } }
    .custom-check-wrap { position: relative; }
    .custom-checkmark { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #C8E6C9; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #2E7D32; transition: all 0.2s; }
    .custom-name { flex: 1; font-size: 14px; font-weight: 500; color: #1A1A1A; }
    .custom-price { font-size: 13px; font-weight: 600; color: #2E7D32; }
    .qty-section { display: flex; align-items: center; justify-content: space-between; }
    .qty-stepper { display: flex; align-items: center; gap: 20px; background: #F8F9FA; border-radius: 999px; padding: 8px 20px; border: 1.5px solid #EEE; }
    .qty-btn { width: 32px; height: 32px; border-radius: 50%; background: #2E7D32; color: #fff; border: none; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; line-height: 1; font-family: inherit; &:hover { background: #1B5E20; transform: scale(1.1); } &:disabled { background: #CCC; cursor: not-allowed; transform: none; } }
    .qty-val { font-size: 18px; font-weight: 700; min-width: 24px; text-align: center; }
    .detail-cta { position: fixed; bottom: 80px; left: 0; right: 0; padding: 12px 20px; background: linear-gradient(to top, #fff 80%, transparent); @media (min-width: 768px) { bottom: 0; max-width: 600px; margin: 0 auto; left: 50%; transform: translateX(-50%); } }
    .btn-add-cart { width: 100%; background: #2E7D32; color: #fff; border: none; border-radius: 14px; padding: 16px; font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 20px rgba(46,125,50,0.35); &:hover { background: #1B5E20; transform: translateY(-2px); } &:active { transform: translateY(0); } }
    .toast { position: fixed; bottom: 150px; left: 50%; transform: translateX(-50%); background: #1A1A1A; color: #fff; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 600; z-index: 9999; white-space: nowrap; animation: fadeToast 0.3s ease; }
    .not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
    @keyframes fadeToast { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product = signal<Product | undefined>(undefined);
  qty = signal(1);
  selectedCustoms = signal<string[]>([]);
  showToast = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product.set(this.productService.getById(id));
    }
  }

  computeTotal(): number {
    const p = this.product();
    if (!p) return 0;
    const base = p.price * this.qty();
    const extras = p.customizations
      ?.filter(c => this.selectedCustoms().includes(c.id))
      .reduce((sum, c) => sum + c.extraPrice, 0) ?? 0;
    return base + extras;
  }

  getDiscount(): number {
    const p = this.product();
    if (!p?.originalPrice) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }

  increment(): void { this.qty.update(v => v + 1); }
  decrement(): void { if (this.qty() > 1) this.qty.update(v => v - 1); }

  toggleCustom(id: string): void {
    const current = this.selectedCustoms();
    if (current.includes(id)) {
      this.selectedCustoms.set(current.filter(c => c !== id));
    } else {
      this.selectedCustoms.set([...current, id]);
    }
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addToCart(p, this.qty(), this.selectedCustoms());
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
      this.router.navigate(['/cart']);
    }, 1200);
  }

  goBack(): void {
    this.router.navigate(['/menu']);
  }
}
