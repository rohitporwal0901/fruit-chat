import { Component, inject, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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

      <!-- HERO BANNER SLIDER (5 slides, tall, reference-style) -->
      <section class="banner-section">
        <div class="banner-track" [style.transform]="'translateX(-' + activeHero() * 100 + '%)'">
          @for (slide of heroSlides; track slide.id) {
            <div class="banner-slide" [style.background]="slide.bg">
              <div class="banner-content">
                <div class="banner-text">
                  <span class="banner-tag" [style.color]="slide.tagColor" [style.background]="slide.tagBg">{{ slide.tag }}</span>
                  <h1 class="banner-title" [style.color]="slide.titleColor" [innerHTML]="slide.titleHtml"></h1>
                  <p class="banner-sub" [style.color]="slide.subColor">{{ slide.sub }}</p>
                  @if (slide.price) {
                    <span class="banner-price" [style.color]="slide.titleColor">
                      &#8377;{{ slide.price }}
                      @if (slide.originalPrice) { <del>&#8377;{{ slide.originalPrice }}</del> }
                    </span>
                  }
                  <a [routerLink]="slide.link" class="banner-btn" [class.light-btn]="slide.lightBtn">Order Now &#8594;</a>
                </div>
                <div class="banner-img-wrap">
                  <img [src]="slide.image" [alt]="slide.title" class="banner-img">
                  <div class="banner-img-badge" [style.color]="slide.badgeColor">&#127807; 100% Fresh</div>
                </div>
              </div>
            </div>
          }
        </div>
        <div class="banner-dots">
          @for (slide of heroSlides; track slide.id; let i = $index) {
            <span class="bdot" [class.active]="activeHero() === i" (click)="goToHero(i)"></span>
          }
        </div>
      </section>

      <!-- SEARCH BAR -->
      <div class="container search-section">
        <div class="search-bar">
          <span class="search-icon">&#128269;</span>
          <input type="text" placeholder="Search for fruit chaat, sprouts..." [(ngModel)]="searchQuery" (input)="onSearch()">
        </div>
      </div>

      <!-- CATEGORY CHIPS (Full-width 4-column layout like Swiggy) -->
      <section class="container categories-section">
        <div class="categories-grid">
          <a class="category-item" [routerLink]="['/menu']" [queryParams]="{ category: 'fruit-chaat' }">
            <div class="cat-img-wrap">
              <img src="assets/images/mix-fruit-chaat.jpg" alt="Fruit Chaat">
            </div>
            <span class="cat-label">Fruit Chaat</span>
          </a>
          <a class="category-item" [routerLink]="['/menu']" [queryParams]="{ category: 'sprouts' }">
            <div class="cat-img-wrap">
              <img src="assets/images/masala-sprouts.jpg" alt="Sprouts">
            </div>
            <span class="cat-label">Sprouts</span>
          </a>
          <a class="category-item" [routerLink]="['/menu']" [queryParams]="{ category: 'juices' }">
            <div class="cat-img-wrap">
              <img src="assets/images/fresh-juice.jpg" alt="Juices">
            </div>
            <span class="cat-label">Juices</span>
          </a>
          <a class="category-item" [routerLink]="['/menu']" [queryParams]="{ category: 'combo' }">
            <div class="cat-img-wrap cat-combo-img">
              <img src="assets/images/masala-sprouts.jpg" alt="Combos">
              <span class="cat-combo-badge">Combo</span>
            </div>
            <span class="cat-label">Combos</span>
          </a>
        </div>
      </section>

      <!-- POPULAR ITEMS - Compact height slider -->
      <section class="container popular-section">
        <div class="section-title">
          <span>Popular Items</span>
          <a routerLink="/menu" class="view-all">View All</a>
        </div>
        <div class="pop-slider" #popularSlider (scroll)="onPopularScroll()">
          @for (product of popularProducts(); track product.id) {
            <div class="pop-card">
              <a [routerLink]="['/product', product.id]" class="pop-img-wrap">
                <img [src]="product.image" [alt]="product.name" class="pop-img" loading="lazy">
                @if (product.isBestseller) { <span class="pop-badge-best">⭐ Best</span> }
                @if (product.originalPrice) { <span class="pop-badge-off">{{ getDiscount(product) }}% OFF</span> }
              </a>
              <div class="pop-body">
                <div class="pop-meta">
                  <span class="veg-badge"><span class="veg-badge-inner"></span></span>
                  <div class="pop-rating"><span class="si">★</span><span class="sv">{{ product.rating }}</span></div>
                </div>
                <a [routerLink]="['/product', product.id]" class="pop-name">{{ product.name }}</a>
                <div class="pop-footer">
                  <span class="pop-price">&#8377;{{ product.price }}</span>
                  @if (getCartQty(product.id) === 0) {
                    <button class="btn-add-sm" (click)="addToCart($event, product)">Add</button>
                  } @else {
                    <div class="mini-stepper-sm">
                      <button class="step-btn-sm" (click)="decrease($event, product)">−</button>
                      <span class="step-val-sm">{{ getCartQty(product.id) }}</span>
                      <button class="step-btn-sm" (click)="increase($event, product)">+</button>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
        <div class="slider-dots">
          @for (d of popularDots(); track $index; let i = $index) {
            <span class="dot" [class.active]="activePopular() === i" (click)="goToPopular(i)"></span>
          }
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

      <!-- BOTTOM COMBO BANNER SLIDER - Full width, 4 slides, auto-scroll -->
      <section class="combo-banner-section">
        <div class="combo-banner-track" [style.transform]="'translateX(-' + activeCombo() * 100 + '%)'">
          @for (slide of comboSlides; track slide.id) {
            <div class="combo-banner-slide" [style.background]="slide.bg">
              <div class="combo-banner-content">
                <div class="combo-banner-text">
                  <span class="combo-banner-tag" [style.color]="slide.tagColor" [style.background]="slide.tagBg">{{ slide.tag }}</span>
                  <h3 class="combo-banner-title" [style.color]="slide.titleColor">{{ slide.title }}</h3>
                  <p class="combo-banner-sub" [style.color]="slide.subColor">{{ slide.sub }}</p>
                  <div class="combo-banner-bottom">
                    <span class="combo-banner-price" [style.color]="slide.titleColor">
                      &#8377;{{ slide.price }}
                      @if (slide.originalPrice) { <del>&#8377;{{ slide.originalPrice }}</del> }
                    </span>
                    <a [routerLink]="slide.link" class="combo-banner-btn" [class.light-btn]="slide.lightBtn">Order Now</a>
                  </div>
                </div>
                <div class="combo-banner-img-wrap">
                  <img [src]="slide.image" [alt]="slide.title" class="combo-banner-img">
                </div>
              </div>
            </div>
          }
        </div>
        <div class="combo-banner-dots">
          @for (slide of comboSlides; track slide.id; let i = $index) {
            <span class="bdot" [class.active]="activeCombo() === i" (click)="goToCombo(i)"></span>
          }
        </div>
      </section>

      <!-- FLOATING CART -->
      @if (cartService.totalItems() > 0) {
        <a routerLink="/cart" class="floating-cart">
          <span class="fc-count">{{ cartService.totalItems() }} item{{ cartService.totalItems() > 1 ? 's' : '' }}</span>
          <span class="fc-label">View Cart</span>
          <span class="fc-price">&#8377;{{ cartService.grandTotal() }}</span>
        </a>
      }
    </div>
  `,
  styles: [`
    .home-page { background: #F8F9FA; overflow-x: hidden; max-width: 100vw; }
    .container { padding-left: 14px; padding-right: 14px; }
    .section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .section-title span { font-size: 15px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.2px; }
    .view-all { font-size: 11px; font-weight: 700; color: #2E7D32; text-decoration: none; }

    /* ===== HERO BANNER SLIDER ===== */
    .banner-section {
      position: relative; margin: 14px 14px 0;
      border-radius: 20px; overflow: hidden; height: 210px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    .banner-track {
      display: flex; height: 100%;
      transition: transform 0.45s cubic-bezier(0.4,0,0.2,1);
      will-change: transform;
    }
    .banner-slide {
      flex-shrink: 0; width: 100%; height: 210px;
      position: relative; overflow: hidden;
    }
    .banner-slide::before {
      content: ''; position: absolute;
      top: -40px; right: -40px; width: 150px; height: 150px;
      background: rgba(255,255,255,0.1); border-radius: 50%;
    }
    .banner-slide::after {
      content: ''; position: absolute;
      bottom: -20px; left: -20px; width: 90px; height: 90px;
      background: rgba(255,255,255,0.07); border-radius: 50%;
    }
    .banner-content {
      display: flex; align-items: center; justify-content: space-between;
      height: 100%; padding: 18px 16px 28px 20px; gap: 10px;
    }
    .banner-text { flex: 1; min-width: 0; }
    .banner-tag {
      display: inline-block; font-size: 9px; font-weight: 700;
      padding: 3px 9px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;
    }
    .banner-title {
      font-size: 26px; font-weight: 900;
      line-height: 1.1; margin-bottom: 6px;
    }
    .banner-title .hl { color: #2E7D32; }
    .banner-sub { font-size: 10px; margin-bottom: 10px; line-height: 1.5; }
    .banner-price { display: block; font-size: 14px; font-weight: 800; margin-bottom: 10px; }
    .banner-price del { font-size: 10px; font-weight: 400; opacity: 0.55; margin-left: 4px; }
    .banner-btn {
      display: inline-flex; align-items: center; gap: 4px;
      background: #2E7D32; color: #fff; padding: 8px 16px;
      border-radius: 999px; font-size: 11px; font-weight: 700;
      text-decoration: none; box-shadow: 0 4px 14px rgba(46,125,50,0.35);
      transition: all 0.2s;
    }
    .banner-btn.light-btn { background: #fff; color: #2E7D32; box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
    .banner-btn:hover { transform: translateY(-1px); }
    .banner-img-wrap { flex-shrink: 0; width: 120px; height: 120px; position: relative; }
    .banner-img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; box-shadow: 0 10px 28px rgba(0,0,0,0.18); }
    .banner-img-badge {
      position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
      background: #fff; padding: 3px 10px; border-radius: 999px;
      font-size: 8px; font-weight: 700; box-shadow: 0 3px 10px rgba(0,0,0,0.12); white-space: nowrap;
    }
    .banner-dots {
      position: absolute; bottom: 9px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 5px; z-index: 10;
    }
    .bdot { width: 6px; height: 6px; border-radius: 50%; background: rgba(0,0,0,0.2); cursor: pointer; transition: all 0.25s; }
    .bdot.active { background: #2E7D32; width: 18px; border-radius: 3px; }

    /* ===== SEARCH ===== */
    .search-section { padding-top: 14px; padding-bottom: 2px; }
    .search-bar {
      display: flex; align-items: center; gap: 8px;
      background: #fff; border-radius: 999px; padding: 10px 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06); border: 1.5px solid #EEE; transition: all 0.25s;
    }
    .search-bar:focus-within { border-color: #4CAF50; box-shadow: 0 0 0 3px rgba(76,175,80,0.12); }
    .search-icon { font-size: 14px; }
    .search-bar input { flex: 1; border: none; outline: none; font-size: 12px; color: #1A1A1A; background: transparent; }
    .search-bar input::placeholder { color: #bbb; }

    /* ===== CATEGORIES (Full-width 4-column layout like Swiggy / Zomato) ===== */
    .categories-section { padding-top: 18px; padding-bottom: 4px; }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      width: 100%;
    }
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .category-item:hover { transform: translateY(-2px); }
    .cat-img-wrap {
      width: 62px;
      height: 62px;
      border-radius: 50%;
      overflow: hidden;
      border: 2.5px solid #E8F5E9;
      box-shadow: 0 3px 10px rgba(0,0,0,0.07);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F1F8E9;
      position: relative;
      transition: all 0.2s;
    }
    .category-item:hover .cat-img-wrap {
      border-color: #4CAF50;
      box-shadow: 0 4px 14px rgba(46,125,50,0.2);
    }
    .cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .cat-combo-img { position: relative; }
    .cat-combo-badge {
      position: absolute;
      bottom: 2px;
      background: #FF6B35;
      color: #fff;
      font-size: 7px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .cat-label {
      font-size: 11px;
      font-weight: 600;
      color: #2D3748;
      margin-top: 6px;
      text-align: center;
      line-height: 1.2;
    }

    /* ===== POPULAR SLIDER (Compact Height) ===== */
    .popular-section { padding-top: 20px; }
    .pop-slider {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    }
    .pop-slider::-webkit-scrollbar { display: none; }
    .pop-card {
      flex-shrink: 0;
      width: 148px;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #EFEFEF;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      scroll-snap-align: start;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .pop-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); border-color: #E0E0E0; }
    .pop-img-wrap {
      position: relative;
      display: block;
      aspect-ratio: 16/10;
      overflow: hidden;
      background: #f5f5f5;
    }
    .pop-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .pop-img-wrap:hover .pop-img { transform: scale(1.06); }
    .pop-badge-best {
      position: absolute;
      top: 5px;
      left: 5px;
      background: rgba(0,0,0,0.72);
      color: #FFD700;
      font-size: 7px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }
    .pop-badge-off {
      position: absolute;
      top: 5px;
      right: 5px;
      background: #E53935;
      color: #fff;
      font-size: 7px;
      font-weight: 800;
      padding: 2px 5px;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(229,57,53,0.3);
    }
    .pop-body { padding: 6px 8px 8px; }
    .pop-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .veg-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
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
    .pop-rating {
      display: flex;
      align-items: center;
      gap: 2px;
      background: #24963F;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .si { color: #fff; font-size: 8px; }
    .sv { font-size: 8px; font-weight: 700; color: #fff; }
    .pop-name {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #1A1A1A;
      text-decoration: none;
      line-height: 1.25;
      margin: 2px 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pop-footer { display: flex; align-items: center; justify-content: space-between; }
    .pop-price { font-size: 12px; font-weight: 800; color: #1A1A1A; }

    /* SHARED DOTS */
    .slider-dots { display: flex; justify-content: center; gap: 4px; margin-top: 8px; }
    .dot { width: 5px; height: 5px; border-radius: 50%; background: #D0D0D0; cursor: pointer; transition: all 0.25s; }
    .dot.active { background: #2E7D32; width: 16px; border-radius: 3px; }

    /* SMALL ADD / STEPPER (Zomato / Swiggy style) */
    .btn-add-sm {
      background: #fff;
      color: #1B7A36;
      border: 1.5px solid #1B7A36;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 11px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .btn-add-sm:hover {
      background: #1B7A36;
      color: #fff;
      transform: scale(1.03);
    }
    .mini-stepper-sm {
      display: flex;
      align-items: center;
      gap: 3px;
      background: #1B7A36;
      border-radius: 6px;
      padding: 2px 4px;
      box-shadow: 0 1px 4px rgba(27,122,54,0.25);
    }
    .step-btn-sm {
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
      font-family: inherit;
    }
    .step-btn-sm:hover { background: rgba(255,255,255,0.2); }
    .step-val-sm { font-weight: 700; font-size: 10px; color: #fff; min-width: 12px; text-align: center; }

    /* ===== ALL PRODUCTS ===== */
    .all-products-section { padding-top: 18px; padding-bottom: 4px; }
    .product-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }

    /* ===== BOTTOM COMBO BANNER SLIDER (full-width, 4 slides) ===== */
    .combo-banner-section {
      position: relative; margin: 20px 14px 30px;
      border-radius: 18px; overflow: hidden; height: 130px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    .combo-banner-track {
      display: flex; height: 100%;
      transition: transform 0.45s cubic-bezier(0.4,0,0.2,1);
      will-change: transform;
    }
    .combo-banner-slide {
      flex-shrink: 0; width: 100%; height: 130px;
      position: relative; overflow: hidden;
    }
    .combo-banner-slide::before {
      content: ''; position: absolute;
      top: -25px; right: -25px; width: 100px; height: 100px;
      background: rgba(255,255,255,0.1); border-radius: 50%;
    }
    .combo-banner-content {
      display: flex; align-items: center; justify-content: space-between;
      height: 100%; padding: 14px 14px 22px 18px; gap: 10px;
    }
    .combo-banner-text { flex: 1; min-width: 0; }
    .combo-banner-tag {
      display: inline-block; font-size: 8px; font-weight: 700;
      padding: 2px 8px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 4px;
    }
    .combo-banner-title { font-size: 17px; font-weight: 900; line-height: 1.15; margin-bottom: 3px; }
    .combo-banner-sub { font-size: 9px; line-height: 1.4; margin-bottom: 6px; }
    .combo-banner-bottom { display: flex; align-items: center; gap: 10px; }
    .combo-banner-price { font-size: 13px; font-weight: 800; }
    .combo-banner-price del { font-size: 9px; font-weight: 400; opacity: 0.55; margin-left: 3px; }
    .combo-banner-btn {
      display: inline-flex; align-items: center;
      background: #2E7D32; color: #fff; padding: 5px 12px;
      border-radius: 999px; font-size: 9px; font-weight: 700;
      text-decoration: none; transition: all 0.2s;
      box-shadow: 0 3px 10px rgba(46,125,50,0.3);
    }
    .combo-banner-btn.light-btn { background: #fff; color: #2E7D32; box-shadow: 0 3px 10px rgba(0,0,0,0.12); }
    .combo-banner-btn:hover { transform: translateY(-1px); }
    .combo-banner-img-wrap { flex-shrink: 0; width: 88px; height: 88px; }
    .combo-banner-img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
    .combo-banner-dots {
      position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 4px; z-index: 10;
    }

    /* FLOATING CART */
    .floating-cart { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 480px; background: #2E7D32; color: #fff; border-radius: 14px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; text-decoration: none; box-shadow: 0 8px 32px rgba(46,125,50,0.4); z-index: 500; animation: slideUp 0.3s ease; transition: transform 0.2s; }
    .floating-cart:hover { transform: translateX(-50%) translateY(-2px); }
    .fc-count { font-size: 12px; font-weight: 600; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 999px; }
    .fc-label { font-size: 14px; font-weight: 700; }
    .fc-price { font-size: 14px; font-weight: 700; }
    @keyframes slideUp { from { transform: translateX(-50%) translateY(80px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

    @media (min-width: 768px) {
      .banner-section { height: 260px; }
      .banner-slide { height: 260px; }
      .banner-title { font-size: 36px; }
      .banner-img-wrap { width: 160px; height: 160px; }
      .categories-section, .popular-section, .all-products-section { max-width: 960px; margin-left: auto; margin-right: auto; padding-left: 32px; padding-right: 32px; }
      .combo-banner-section { height: 170px; margin: 20px auto 30px; max-width: 960px; }
      .combo-banner-slide { height: 170px; }
      .pop-card { max-width: 190px; width: 22vw; }
      .floating-cart { max-width: 400px; bottom: 20px; }
    }
  `]
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  cartService = inject(CartService);
  searchQuery = '';

  popularProducts = signal<Product[]>(this.productService.getPopular());
  allProducts     = signal<Product[]>(this.productService.getAll());

  // Hero slides (5 slides) - colors matched per background
  heroSlides = [
    {
      id: 1, tag: 'Fresh & Healthy',
      title: 'Healthy Tasty Fresh', titleHtml: 'Healthy <span class="hl">Tasty</span> Fresh',
      sub: 'Fruit Chaat & Sprouts for a better you!',
      price: null as number|null, originalPrice: null as number|null,
      link: '/menu', image: 'assets/images/mix-fruit-chaat.jpg',
      bg: 'linear-gradient(135deg,#E8F5E9 0%,#C8E6C9 50%,#DCEDC8 100%)',
      titleColor: '#1A1A1A', subColor: '#4a4a4a',
      tagColor: '#1B5E20', tagBg: 'rgba(46,125,50,0.15)',
      badgeColor: '#2E7D32', lightBtn: false
    },
    {
      id: 2, tag: 'Protein Rich',
      title: 'Masala Sprouts', titleHtml: 'Masala <span style="color:#1565C0">Sprouts</span>',
      sub: 'Healthy protein-packed sprouts — daily fresh!',
      price: 60 as number|null, originalPrice: null as number|null,
      link: '/product/2', image: 'assets/images/masala-sprouts.jpg',
      bg: 'linear-gradient(135deg,#E3F2FD 0%,#90CAF9 55%,#BBDEFB 100%)',
      titleColor: '#0D2137', subColor: '#1a4a6e',
      tagColor: '#1565C0', tagBg: 'rgba(21,101,192,0.15)',
      badgeColor: '#1565C0', lightBtn: false
    },
    {
      id: 3, tag: 'Best Combo Deal',
      title: 'Healthy Combo', titleHtml: 'Healthy <span style="color:#A5D6A7">Combo</span>',
      sub: 'Fruit Chaat + Sprouts — save Rs.41!',
      price: 99 as number|null, originalPrice: 140 as number|null,
      link: '/product/8', image: 'assets/images/masala-sprouts.jpg',
      bg: 'linear-gradient(135deg,#1B5E20 0%,#2E7D32 55%,#388E3C 100%)',
      titleColor: '#fff', subColor: 'rgba(255,255,255,0.82)',
      tagColor: '#DCEDC8', tagBg: 'rgba(255,255,255,0.2)',
      badgeColor: '#2E7D32', lightBtn: true
    },
    {
      id: 4, tag: 'Fresh Juice',
      title: 'Orange Juice', titleHtml: 'Fresh <span style="color:#E65100">Orange</span> Juice',
      sub: 'No added sugar. Pure natural goodness!',
      price: 70 as number|null, originalPrice: null as number|null,
      link: '/product/3', image: 'assets/images/fresh-juice.jpg',
      bg: 'linear-gradient(135deg,#FFF8E1 0%,#FFE082 55%,#FFECB3 100%)',
      titleColor: '#3E2000', subColor: '#6d4c00',
      tagColor: '#E65100', tagBg: 'rgba(230,81,0,0.12)',
      badgeColor: '#E65100', lightBtn: false
    },
    {
      id: 5, tag: "Today's Special",
      title: 'Pineapple Chaat', titleHtml: 'Pineapple <span style="color:#BF360C">Chaat</span>',
      sub: 'Sweet & spicy — a perfect treat!',
      price: 70 as number|null, originalPrice: null as number|null,
      link: '/product/4', image: 'assets/images/pineapple-chaat.jpg',
      bg: 'linear-gradient(135deg,#FBE9E7 0%,#FF8A65 55%,#FFCCBC 100%)',
      titleColor: '#3E0000', subColor: '#7a2000',
      tagColor: '#BF360C', tagBg: 'rgba(191,54,12,0.12)',
      badgeColor: '#BF360C', lightBtn: false
    },
  ];
  activeHero = signal(0);
  private heroTimer: ReturnType<typeof setInterval> | null = null;

  // Combo banner slides (4 slides, bottom section)
  comboSlides = [
    {
      id: 1, tag: 'Limited Offer',
      title: 'Healthy Combo', sub: 'Fruit Chaat + Sprouts',
      price: 99, originalPrice: 140, link: '/product/8',
      bg: 'linear-gradient(135deg,#1B5E20 0%,#2E7D32 55%,#388E3C 100%)',
      titleColor: '#fff', subColor: 'rgba(255,255,255,0.82)',
      tagColor: '#DCEDC8', tagBg: 'rgba(255,255,255,0.2)',
      lightBtn: true, image: 'assets/images/masala-sprouts.jpg'
    },
    {
      id: 2, tag: 'Fresh Pick',
      title: 'Mix Fruit Chaat', sub: 'Fresh seasonal fruits with masala',
      price: 80, originalPrice: 100, link: '/product/1',
      bg: 'linear-gradient(135deg,#E8F5E9 0%,#A5D6A7 55%,#DCEDC8 100%)',
      titleColor: '#1A1A1A', subColor: '#4a4a4a',
      tagColor: '#1B5E20', tagBg: 'rgba(46,125,50,0.15)',
      lightBtn: false, image: 'assets/images/mix-fruit-chaat.jpg'
    },
    {
      id: 3, tag: 'Popular',
      title: 'Fresh Juice', sub: 'Pure natural orange juice — no sugar',
      price: 70, originalPrice: null as number|null, link: '/product/3',
      bg: 'linear-gradient(135deg,#FFF8E1 0%,#FFE082 55%,#FFECB3 100%)',
      titleColor: '#3E2000', subColor: '#6d4c00',
      tagColor: '#E65100', tagBg: 'rgba(230,81,0,0.12)',
      lightBtn: false, image: 'assets/images/fresh-juice.jpg'
    },
    {
      id: 4, tag: 'Daily Fresh',
      title: 'Masala Sprouts', sub: 'Protein rich sprouts with masala',
      price: 60, originalPrice: null as number|null, link: '/product/2',
      bg: 'linear-gradient(135deg,#E3F2FD 0%,#64B5F6 55%,#BBDEFB 100%)',
      titleColor: '#0D2137', subColor: '#1a4a6e',
      tagColor: '#1565C0', tagBg: 'rgba(21,101,192,0.15)',
      lightBtn: false, image: 'assets/images/masala-sprouts.jpg'
    },
  ];
  activeCombo = signal(0);
  private comboTimer: ReturnType<typeof setInterval> | null = null;

  @ViewChild('popularSlider') popularSliderRef!: ElementRef<HTMLDivElement>;
  activePopular = signal(0);
  popularDots   = signal<number[]>([]);

  ngAfterViewInit(): void {
    this.startHeroAuto();
    this.startComboAuto();
    setTimeout(() => this.initPopularDots(), 120);
  }

  ngOnDestroy(): void {
    if (this.heroTimer)  clearInterval(this.heroTimer);
    if (this.comboTimer) clearInterval(this.comboTimer);
  }

  private initPopularDots(): void {
    const el = this.popularSliderRef?.nativeElement;
    if (!el) return;
    const card = el.querySelector('.pop-card') as HTMLElement;
    if (!card) return;
    const cardW = card.offsetWidth + 10;
    const visible = Math.floor(el.offsetWidth / cardW);
    const pages = Math.max(1, this.popularProducts().length - visible + 1);
    this.popularDots.set(Array.from({ length: pages }, (_, i) => i));
  }

  // Hero
  private startHeroAuto(): void {
    this.heroTimer = setInterval(() => {
      this.activeHero.set((this.activeHero() + 1) % this.heroSlides.length);
    }, 3000);
  }
  goToHero(i: number): void {
    if (this.heroTimer) clearInterval(this.heroTimer);
    this.activeHero.set(i);
    this.startHeroAuto();
  }

  // Popular
  onPopularScroll(): void {
    const el = this.popularSliderRef?.nativeElement;
    if (!el) return;
    const card = el.querySelector('.pop-card') as HTMLElement;
    if (!card) return;
    this.activePopular.set(Math.round(el.scrollLeft / (card.offsetWidth + 10)));
  }
  goToPopular(i: number): void {
    this.activePopular.set(i);
    const el = this.popularSliderRef?.nativeElement;
    if (!el) return;
    const card = el.querySelector('.pop-card') as HTMLElement;
    el.scrollTo({ left: i * (card ? card.offsetWidth + 10 : 170), behavior: 'smooth' });
  }

  // Combo banner auto-scroll
  private startComboAuto(): void {
    this.comboTimer = setInterval(() => {
      this.activeCombo.set((this.activeCombo() + 1) % this.comboSlides.length);
    }, 2800);
  }
  goToCombo(i: number): void {
    if (this.comboTimer) clearInterval(this.comboTimer);
    this.activeCombo.set(i);
    this.startComboAuto();
  }

  // Helpers
  getDiscount(p: Product): number {
    if (!p.originalPrice) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }
  getCartQty(id: string): number { return this.cartService.getQty(id); }
  addToCart(e: Event, p: Product): void { e.preventDefault(); e.stopPropagation(); this.cartService.addToCart(p); }
  increase(e: Event, p: Product): void { e.preventDefault(); e.stopPropagation(); this.cartService.updateQty(p.id, this.getCartQty(p.id) + 1); }
  decrease(e: Event, p: Product): void { e.preventDefault(); e.stopPropagation(); this.cartService.updateQty(p.id, this.getCartQty(p.id) - 1); }
  onSearch(): void {
    this.allProducts.set(this.searchQuery.trim()
      ? this.productService.search(this.searchQuery)
      : this.productService.getAll());
  }
}
