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
            <span class="veg-badge"><span class="veg-badge-inner"></span></span>
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
              <button class="btn-add" (click)="addToCart($event)">ADD</button>
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
            <span class="veg-badge"><span class="veg-badge-inner"></span></span>
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
            <span class="veg-badge"><span class="veg-badge-inner"></span></span>
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
    .product-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #EFEFEF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
      display: flex;
      flex-direction: column;
    }
    .product-card.grid-mode:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); border-color: #E0E0E0; }

    /* FSSAI VEG BADGE */
    .veg-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 13px;
      height: 13px;
      border: 1.5px solid #24963F;
      border-radius: 3px;
      background: #fff;
      flex-shrink: 0;
    }
    .veg-badge-inner {
      width: 5px;
      height: 5px;
      background: #24963F;
      border-radius: 50%;
    }

    /* GRID MODE (Compact Height) */
    .card-img-wrap {
      position: relative;
      display: block;
      overflow: hidden;
      aspect-ratio: 16/10;
      background: #f5f5f5;
    }
    .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .card-img-wrap:hover .card-img { transform: scale(1.06); }
    .bestseller-tag {
      position: absolute;
      top: 5px;
      left: 5px;
      background: rgba(0,0,0,0.72);
      color: #FFD700;
      font-size: 7px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }
    .discount-tag {
      position: absolute;
      top: 5px;
      right: 5px;
      background: #E53935;
      color: #fff;
      font-size: 7px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(229,57,53,0.3);
    }
    .card-body {
      padding: 6px 8px 8px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: #24963F;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .star { color: #fff; font-size: 8px; }
    .rating-val { font-size: 8px; font-weight: 700; color: #fff; }
    .card-name {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #1A1A1A;
      margin: 2px 0 6px;
      text-decoration: none;
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }
    .price-wrap { display: flex; align-items: baseline; gap: 3px; }
    .price { font-size: 12px; font-weight: 800; color: #1A1A1A; }
    .original-price { font-size: 9px; color: #999; text-decoration: line-through; }

    /* POPULAR MODE - horizontal compact card */
    .product-card.popular-mode {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      padding: 10px 12px;
      gap: 10px;
      border-radius: 12px;
      min-height: 0;
    }
    .product-card.popular-mode:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
    .popular-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
    .popular-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
    .popular-name { display: block; font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 2px; text-decoration: none; line-height: 1.3; }
    .popular-desc { font-size: 10px; color: #888; line-height: 1.4; flex: 1; margin-bottom: 6px; }
    .popular-footer { display: flex; align-items: center; justify-content: space-between; }
    .popular-img-wrap { position: relative; flex-shrink: 0; width: 80px; height: 80px; border-radius: 10px; overflow: hidden; display: block; }
    .popular-img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; transition: transform 0.3s; }
    .popular-img-wrap:hover .popular-img { transform: scale(1.07); }

    /* LIST MODE */
    .product-card.list-mode { display: flex; flex-direction: row; align-items: flex-start; gap: 12px; padding: 14px; border-radius: 12px; }
    .list-body { flex: 1; min-width: 0; }
    .list-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .bestseller-tag-sm { font-size: 9px; font-weight: 700; color: #E65100; background: #FFF3E0; padding: 2px 7px; border-radius: 4px; }
    .list-name { display: block; font-size: 14px; font-weight: 700; color: #1A1A1A; margin-bottom: 3px; text-decoration: none; }
    .list-desc { font-size: 11px; color: #888; margin-bottom: 8px; line-height: 1.4; }
    .list-price-row { display: flex; align-items: baseline; gap: 6px; }
    .list-right { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }
    .list-img { width: 90px; height: 90px; object-fit: cover; border-radius: 10px; }
    .list-add { margin-top: 0 !important; }

    /* ADD BUTTON (Zomato / Swiggy style) */
    .btn-add {
      background: #fff;
      color: #1B7A36;
      border: 1.5px solid #1B7A36;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 13px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      font-family: inherit;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn-add:hover {
      background: #1B7A36;
      color: #fff;
      transform: scale(1.03);
    }

    /* MINI STEPPER */
    .mini-stepper {
      display: flex;
      align-items: center;
      gap: 3px;
      background: #1B7A36;
      border-radius: 6px;
      padding: 2px 4px;
      box-shadow: 0 1px 4px rgba(27,122,54,0.25);
    }
    .step-btn {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      background: transparent;
      color: #fff;
      border: none;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
      line-height: 1;
      font-family: inherit;
    }
    .step-btn:hover { background: rgba(255,255,255,0.2); }
    .step-val { font-weight: 700; font-size: 10px; color: #fff; min-width: 12px; text-align: center; }
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
