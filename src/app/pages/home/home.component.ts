import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  template: `
    <div class="home-page">
      <!-- HERO SECTION -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-text animate-fadeInUp">
            <p class="hero-sub">Fresh & Healthy</p>
            <h1 class="hero-title">Healthy<br><span class="highlight">Tasty</span><br>Fresh</h1>
            <p class="hero-desc">Fruit Chaat & Sprouts for a better you!</p>
            <a routerLink="/menu" class="hero-btn">Order Now →</a>
          </div>
          <div class="hero-image animate-scaleIn">
            <div class="hero-img-wrap">
              <img src="assets/images/mix-fruit-chaat.jpg" alt="Fresh Fruit Chaat" class="hero-img">
              <div class="hero-img-badge"><span>🌱 100% Fresh</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- SEARCH BAR -->
      <div class="container search-section">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search for fruit chaat, sprouts..." [(ngModel)]="searchQuery" (input)="onSearch()">
        </div>
      </div>

      <!-- CATEGORY CHIPS -->
      <section class="container categories-section">
        <div class="categories-scroll">
          <div class="category-item" routerLink="/menu">
            <div class="cat-img-wrap"><img src="assets/images/mix-fruit-chaat.jpg" alt="Fruit Chaat"></div>
            <span class="cat-label">Fruit Chaat</span>
          </div>
          <div class="category-item" routerLink="/menu">
            <div class="cat-img-wrap"><img src="assets/images/masala-sprouts.jpg" alt="Sprouts"></div>
            <span class="cat-label">Sprouts</span>
          </div>
          <div class="category-item" routerLink="/menu">
            <div class="cat-img-wrap"><img src="assets/images/fresh-juice.jpg" alt="Juices"></div>
            <span class="cat-label">Juices</span>
          </div>
          <div class="category-item" routerLink="/menu">
            <div class="cat-img-wrap" style="background:linear-gradient(135deg,#FFF3E0,#FFE0B2);"><span style="font-size:24px">🥗</span></div>
            <span class="cat-label">Combos</span>
          </div>
        </div>
      </section>

      <!-- POPULAR ITEMS -->
      <section class="container popular-section">
        <div class="section-title">
          <span>Popular Items</span>
          <a routerLink="/menu" class="view-all">View All</a>
        </div>
        <div class="popular-grid">
          @for (product of popularProducts(); track product.id) {
            <app-product-card [product]="product" mode="grid"></app-product-card>
          }
        </div>
      </section>

      <!-- PROMO BANNER -->
      <section class="container promo-section">
        <div class="promo-card">
          <div class="promo-text">
            <span class="promo-tag">Limited Offer</span>
            <h3>Healthy Combo</h3>
            <p>Fruit Chaat + Sprouts</p>
            <span class="promo-price">₹99 <del>₹140</del></span>
            <a routerLink="/product/8" class="promo-btn">Order Now →</a>
          </div>
          <div class="promo-img">
            <img src="assets/images/masala-sprouts.jpg" alt="Healthy Combo">
          </div>
        </div>
      </section>

      <!-- ALL PRODUCTS -->
      <section class="container all-products-section">
        <div class="section-title"><span>All Items</span></div>
        <div class="product-grid">
          @for (product of allProducts(); track product.id) {
            <app-product-card [product]="product" mode="grid"></app-product-card>
          }
        </div>
      </section>

      <!-- FLOATING CART -->
      @if (cartService.totalItems() > 0) {
        <a routerLink="/cart" class="floating-cart">
          <div class="fc-left">
            <span class="fc-count">{{ cartService.totalItems() }} item{{ cartService.totalItems() > 1 ? 's' : '' }}</span>
          </div>
          <span class="fc-label">View Cart</span>
          <span class="fc-price">₹{{ cartService.grandTotal() }}</span>
        </a>
      }
    </div>
  `,
  styles: [`
    .home-page {
      background: #F8F9FA;
      overflow-x: hidden;
      max-width: 100vw;
    }

    /* ===== HERO ===== */
    .hero {
      background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #DCEDC8 100%);
      padding: 20px 18px 26px;
      position: relative;
      overflow: hidden;
      margin: 16px 16px 0;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(46,125,50,0.12);
      &::before {
        content: '';
        position: absolute;
        top: -40px; right: -40px;
        width: 180px; height: 180px;
        background: rgba(255,255,255,0.15);
        border-radius: 50%;
      }
      &::after {
        content: '';
        position: absolute;
        bottom: -20px; left: -20px;
        width: 100px; height: 100px;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
      }
    }

    .hero-content {
      max-width: 480px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      overflow: hidden;
      @media (min-width: 768px) { max-width: 960px; padding: 0 32px; gap: 48px; }
      @media (min-width: 1200px) { max-width: 1280px; padding: 0 48px; }
    }

    .hero-text { flex: 1; min-width: 0; }

    .hero-sub {
      font-size: 11px;
      font-weight: 600;
      color: #4CAF50;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 6px;
    }

    .hero-title {
      font-size: clamp(22px, 7vw, 48px);
      font-weight: 800;
      color: #1A1A1A;
      line-height: 1.1;
      margin-bottom: 8px;
    }

    .highlight { color: #2E7D32; }

    .hero-desc {
      font-size: 12px;
      color: #666;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #2E7D32;
      color: #fff;
      padding: 10px 20px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s;
      box-shadow: 0 4px 14px rgba(46,125,50,0.3);
      &:hover { background: #1B5E20; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46,125,50,0.4); }
    }

    .hero-image { flex-shrink: 0; }

    .hero-img-wrap {
      position: relative;
      width: 140px;
      height: 140px;
      flex-shrink: 0;
    }

    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 10px 32px rgba(0,0,0,0.14);
    }

    .hero-img-badge {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: #fff;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
      color: #2E7D32;
      box-shadow: 0 3px 10px rgba(0,0,0,0.12);
      white-space: nowrap;
    }

    /* ===== SEARCH ===== */
    .search-section { padding-top: 16px; padding-bottom: 4px; }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fff;
      border-radius: 999px;
      padding: 10px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1.5px solid #EEEEEE;
      transition: all 0.25s;
      &:focus-within { border-color: #4CAF50; box-shadow: 0 0 0 3px rgba(76,175,80,0.12); }
      .search-icon { font-size: 16px; }
      input {
        flex: 1;
        border: none;
        outline: none;
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        color: #1A1A1A;
        background: transparent;
        &::placeholder { color: #bbb; }
      }
    }

    /* ===== CATEGORIES ===== */
    .categories-section { padding-top: 20px; }

    .categories-scroll {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.2s;
      &:hover { transform: translateY(-3px); }
    }

    .cat-img-wrap {
      width: 62px;
      height: 62px;
      border-radius: 50%;
      overflow: hidden;
      border: 2.5px solid #E8F5E9;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F1F8E9;
      img { width: 100%; height: 100%; object-fit: cover; }
      @media (min-width: 768px) { width: 80px; height: 80px; }
    }

    .cat-label { font-size: 11px; font-weight: 600; color: #444; }

    /* ===== POPULAR – 2-col grid like image 2 ===== */
    .popular-section { padding-top: 24px; }

    .popular-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    /* ===== PROMO ===== */
    .promo-section { padding-top: 20px; }

    .promo-card {
      background: linear-gradient(135deg, #1B5E20, #2E7D32);
      border-radius: 18px;
      display: flex;
      align-items: center;
      overflow: hidden;
      padding: 18px 18px 18px 20px;
      gap: 14px;
      box-shadow: 0 6px 24px rgba(27,94,32,0.28);
    }

    .promo-text {
      flex: 1;
      color: #fff;
      .promo-tag {
        display: inline-block;
        background: rgba(255,255,255,0.2);
        font-size: 10px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 999px;
        margin-bottom: 6px;
        color: #DCEDC8;
      }
      h3 { font-size: 18px; font-weight: 800; margin-bottom: 2px; }
      p { font-size: 11px; opacity: 0.8; margin-bottom: 6px; }
      .promo-price {
        display: block; font-size: 18px; font-weight: 800; margin-bottom: 12px;
        del { font-size: 12px; font-weight: 400; opacity: 0.6; margin-left: 6px; }
      }
      .promo-btn {
        display: inline-flex; align-items: center; gap: 4px;
        background: #fff; color: #2E7D32; padding: 7px 16px;
        border-radius: 999px; font-size: 12px; font-weight: 700;
        text-decoration: none; transition: all 0.2s;
        &:hover { background: #F1F8E9; transform: translateX(3px); }
      }
    }

    .promo-img {
      width: 100px; height: 100px;
      border-radius: 14px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 6px 16px rgba(0,0,0,0.18);
      img { width: 100%; height: 100%; object-fit: cover; }
      @media (min-width: 768px) { width: 140px; height: 140px; }
    }

    /* ===== ALL PRODUCTS ===== */
    .all-products-section { padding-top: 20px; padding-bottom: 32px; }

    /* ===== FLOATING CART ===== */
    .floating-cart {
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 480px;
      background: #2E7D32;
      color: #fff;
      border-radius: 14px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      box-shadow: 0 8px 32px rgba(46,125,50,0.4);
      z-index: 500;
      animation: slideInBottom 0.3s ease;
      transition: transform 0.2s;
      &:hover { transform: translateX(-50%) translateY(-2px); }
      .fc-count { font-size: 12px; font-weight: 600; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 999px; }
      .fc-label { font-size: 14px; font-weight: 700; }
      .fc-price { font-size: 14px; font-weight: 700; }
      @media (min-width: 768px) { max-width: 400px; bottom: 20px; }
    }

    @keyframes slideInBottom {
      from { transform: translateX(-50%) translateY(100px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }

    @media (min-width: 768px) {
      .hero { padding: 56px 0; }
      .popular-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
      .categories-section, .popular-section, .promo-section, .all-products-section { max-width: 960px; margin: 0 auto; padding-left: 32px; padding-right: 32px; }
    }
    @media (min-width: 1200px) { .hero { padding: 72px 0; } }
  `]
})
export class HomeComponent {
  private productService = inject(ProductService);
  cartService = inject(CartService);
  searchQuery = '';

  popularProducts = signal<Product[]>(this.productService.getPopular());
  allProducts = signal<Product[]>(this.productService.getAll());

  onSearch(): void {
    if (this.searchQuery.trim()) {
      const results = this.productService.search(this.searchQuery);
      this.allProducts.set(results);
    } else {
      this.allProducts.set(this.productService.getAll());
    }
  }
}
