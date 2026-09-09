import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-card" [class.grid-mode]="mode === 'grid'" [class.list-mode]="mode === 'list'" [class.popular-mode]="mode === 'popular'">
      <!-- Grid Card (Home & Menu Grid) -->
      @if (mode === 'grid') {
        <a [routerLink]="['/product', product.id]" class="card-img-wrap">
          <img [src]="product.image" [alt]="product.name" class="card-img" loading="lazy">
          @if (product.isBestseller) {
            <span class="bestseller-tag">⭐ Bestseller</span>
          }
          @if (product.originalPrice) {
            <span class="discount-tag">{{ getDiscount() }}% OFF</span>
          }
        </a>
        <div class="card-body">
          <div class="card-meta">
            <span class="veg-icon">🌱</span>
            <div class="rating">
              <span class="star">★</span>
              <span class="rating-val">{{ product.rating }}</span>
            </div>
          </div>
          <a [routerLink]="['/product', product.id]" class="card-name">{{ product.name }}</a>
          <div class="card-footer">
            <div class="price-wrap">
              <span class="price">₹{{ product.price }}</span>
              @if (product.originalPrice) {
                <span class="original-price">₹{{ product.originalPrice }}</span>
              }
            </div>
            @if (cartQty === 0) {
              <button class="btn-add" (click)="addToCart($event)">Add</button>
            } @else {
              <div class="mini-stepper">
                <button class="step-btn" (click)="decrease($event)">−</button>
                <span class="step-val">{{ cartQty }}</span>
                <button class="step-btn" (click)="increase($event)">+</button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Popular Card (Home popular section - horizontal compact) -->
      @if (mode === 'popular') {
        <div class="popular-body">
          <div class="popular-meta">
            <span class="veg-icon">🌱</span>
            @if (product.isBestseller) {
              <span class="bestseller-tag-sm">⭐ Bestseller</span>
            }
          </div>
          <a [routerLink]="['/product', product.id]" class="popular-name">{{ product.name }}</a>
          <p class="popular-desc">{{ product.description | slice:0:45 }}...</p>
          <div class="popular-footer">
            <span class="price">₹{{ product.price }}</span>
            @if (cartQty === 0) {
              <button class="btn-add" (click)="addToCart($event)">Add</button>
            } @else {
              <div class="mini-stepper">
                <button class="step-btn" (click)="decrease($event)">−</button>
                <span class="step-val">{{ cartQty }}</span>
                <button class="step-btn" (click)="increase($event)">+</button>
              </div>
            }
          </div>
        </div>
        <a [routerLink]="['/product', product.id]" class="popular-img-wrap">
          <img [src]="product.image" [alt]="product.name" class="popular-img" loading="lazy">
          @if (product.isBestseller) {
            <span class="discount-tag">★ Best</span>
          }
        </a>
      }

      <!-- List Card (Menu page) -->
      @if (mode === 'list') {
        <div class="list-body">
          <div class="list-meta">
            <span class="veg-icon">🌱</span>
            @if (product.isBestseller) {
              <span class="bestseller-tag-sm">⭐ Bestseller</span>
            }
          </div>
          <a [routerLink]="['/product', product.id]" class="list-name">{{ product.name }}</a>
          <p class="list-desc">{{ product.description | slice:0:70 }}...</p>
          <div class="list-price-row">
            <span class="price">₹{{ product.price }}</span>
            @if (product.originalPrice) {
              <span class="original-price">₹{{ product.originalPrice }}</span>
            }
          </div>
        </div>
        <div class="list-right">
          <a [routerLink]="['/product', product.id]">
            <img [src]="product.image" [alt]="product.name" class="list-img" loading="lazy">
          </a>
          @if (cartQty === 0) {
            <button class="btn-add list-add" (click)="addToCart($event)">Add</button>
          } @else {
            <div class="mini-stepper list-stepper">
              <button class="step-btn" (click)="decrease($event)">−</button>
              <span class="step-val">{{ cartQty }}</span>
              <button class="step-btn" (click)="increase($event)">+</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .product-card { background: #fff; border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
    .product-card.grid-mode:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.12); }

    /* GRID MODE */
    .card-img-wrap { position: relative; display: block; overflow: hidden; aspect-ratio: 4/3; }
    .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .card-img-wrap:hover .card-img { transform: scale(1.06); }
    .bestseller-tag { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.65); color: #fff; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 999px; backdrop-filter: blur(4px); }
    .discount-tag { position: absolute; top: 8px; right: 8px; background: #FF6B35; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
    .card-body { padding: 8px 10px 10px; }
    .card-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
    .veg-icon { font-size: 12px; }
    .rating { display: flex; align-items: center; gap: 2px; background: #F1F8E9; padding: 2px 6px; border-radius: 999px; }
    .star { color: #FFC107; font-size: 10px; }
    .rating-val { font-size: 10px; font-weight: 600; color: #2E7D32; }
    .card-name { display: block; font-size: 12px; font-weight: 700; color: #1A1A1A; margin-bottom: 2px; text-decoration: none; line-height: 1.3; }
    .card-desc { font-size: 10px; color: #999; margin-bottom: 6px; line-height: 1.4; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .price-wrap { display: flex; align-items: center; gap: 4px; }
    .price { font-size: 14px; font-weight: 700; color: #1A1A1A; }
    .original-price { font-size: 10px; color: #bbb; text-decoration: line-through; }

    /* POPULAR MODE - horizontal compact card */
    .product-card.popular-mode {
      display: flex;
      align-items: stretch;
      padding: 12px;
      gap: 10px;
      border-radius: 14px;
      min-height: 0;
    }
    .product-card.popular-mode:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.10); }
    .popular-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
    .popular-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
    .popular-name { display: block; font-size: 14px; font-weight: 700; color: #1A1A1A; margin-bottom: 3px; text-decoration: none; line-height: 1.3; }
    .popular-desc { font-size: 11px; color: #999; line-height: 1.4; flex: 1; margin-bottom: 8px; }
    .popular-footer { display: flex; align-items: center; justify-content: space-between; }
    .popular-img-wrap { position: relative; flex-shrink: 0; width: 90px; height: 90px; border-radius: 12px; overflow: hidden; display: block; }
    .popular-img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; transition: transform 0.3s; }
    .popular-img-wrap:hover .popular-img { transform: scale(1.07); }

    /* LIST MODE */
    .product-card.list-mode { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 14px; }
    .list-body { flex: 1; min-width: 0; }
    .list-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .bestseller-tag-sm { font-size: 10px; font-weight: 600; color: #E65100; background: #FFF3E0; padding: 2px 8px; border-radius: 999px; }
    .list-name { display: block; font-size: 15px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px; text-decoration: none; }
    .list-desc { font-size: 12px; color: #999; margin-bottom: 8px; line-height: 1.5; }
    .list-price-row { display: flex; align-items: center; gap: 6px; }
    .list-right { display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0; }
    .list-img { width: 100px; height: 100px; object-fit: cover; border-radius: 12px; }
    .list-add { margin-top: 0 !important; }

    /* ADD BUTTON */
    .btn-add { background: #2E7D32; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; padding: 6px 16px; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: 'Poppins', sans-serif; }
    .btn-add:hover { background: #1B5E20; transform: scale(1.04); }

    /* MINI STEPPER */
    .mini-stepper { display: flex; align-items: center; gap: 6px; background: #F1F8E9; border-radius: 8px; padding: 4px 8px; border: 1.5px solid #4CAF50; }
    .step-btn { width: 22px; height: 22px; border-radius: 6px; background: #2E7D32; color: #fff; border: none; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; line-height: 1; font-family: inherit; }
    .step-btn:hover { background: #1B5E20; }
    .step-val { font-weight: 700; font-size: 13px; color: #2E7D32; min-width: 14px; text-align: center; }
    .list-stepper { margin-top: 0; }

    .getDiscount { display: none; }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() mode: 'grid' | 'list' | 'popular' = 'grid';

  private cartService = inject(CartService);

  get cartQty(): number {
    return this.cartService.getQty(this.product.id);
  }

  addToCart(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.cartService.addToCart(this.product);
  }

  increase(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.cartService.updateQty(this.product.id, this.cartQty + 1);
  }

  decrease(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.cartService.updateQty(this.product.id, this.cartQty - 1);
  }

  getDiscount(): number {
    if (!this.product.originalPrice) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }
}
