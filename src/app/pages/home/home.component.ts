import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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

      <!-- HERO BANNER SLIDER (Auto-looping, Reference Card Style) -->
      <section class="banner-section">
        <div class="banner-track"
             [style.transform]="'translateX(-' + heroIndex() * 100 + '%)'"
             [style.transition]="heroTransition() ? 'transform 0.48s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'"
             (transitionend)="onHeroTransitionEnd()">
          @for (slide of heroDisplaySlides(); track slide.uniqueKey) {
            <div class="banner-slide" [style.background]="slide.bg">
              <div class="banner-content">
                <div class="banner-left">
                  <span class="card-brand" [style.color]="slide.brandColor">{{ slide.brand }}</span>
                  <h2 class="card-title" [style.color]="slide.titleColor" [innerHTML]="slide.headlineHtml"></h2>
                  <a [routerLink]="slide.link" class="card-btn" [class.btn-white]="slide.btnStyle === 'white'" [class.btn-green]="slide.btnStyle === 'green'" [style.color]="slide.btnTextColor || null">
                    {{ slide.btnText }}
                  </a>
                </div>
              </div>
              <div class="banner-img-corner">
                <img [src]="slide.image" [alt]="slide.brand" class="corner-photo">
              </div>
            </div>
          }
        </div>
        <div class="banner-dots">
          @for (slide of heroSlides; track slide.id; let i = $index) {
            <span class="bdot" [class.active]="(heroIndex() % heroSlides.length) === i" (click)="goToHero(i)"></span>
          }
        </div>
      </section>

      <!-- OFFER CARD — zig-zag via clip-path, transparent cutouts, entrance animation -->
      <section class="offer-section">
        <div class="offer-body" (click)="copyOfferCode($event)">
          <div class="offer-row">
            <div class="offer-text-col">
              <h3 class="offer-heading">Hurry, ₹50 Free Cash<br>expiring soon!</h3>
              <p class="offer-sub">Valid on food orders above ₹99</p>
            </div>
            <div class="offer-pill-col">
              <div class="offer-pill" [class.claimed]="offerCopied()">
                <div class="pill-glare"></div>
                @if (offerCopied()) {
                  <span class="pill-label">COPIED!</span>
                  <span class="pill-amount">✓</span>
                } @else {
                  <span class="pill-label">CASH AVAILABLE</span>
                  <span class="pill-amount">₹50</span>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SEARCH BAR -->
      <div class="container search-section">
        <div class="search-bar">
          <svg class="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search fresh fruit chaat, sprouts, juices..." [(ngModel)]="searchQuery" (input)="onSearch()">
          @if (searchQuery) {
            <button class="clear-search-btn" (click)="clearHomeSearch()">✕</button>
          }
        </div>
      </div>

      <!-- CATEGORY CHIPS (Full-width 4-column layout like Swiggy) -->
      <section class="container categories-section">
        <div class="sec-title-clean">
          <span>What's on your mind?</span>
        </div>
        <div class="categories-grid">
          <div class="category-item" [class.active]="selectedCategory() === 'fruit-chaat'" (click)="toggleCategory('fruit-chaat')">
            <div class="cat-img-wrap">
              <img src="assets/images/mix-fruit-chaat.jpg" alt="Fruit Chaat">
            </div>
            <span class="cat-label">Fruit Chaat</span>
          </div>
          <div class="category-item" [class.active]="selectedCategory() === 'sprouts'" (click)="toggleCategory('sprouts')">
            <div class="cat-img-wrap">
              <img src="assets/images/masala-sprouts.jpg" alt="Sprouts">
            </div>
            <span class="cat-label">Sprouts</span>
          </div>
          <div class="category-item" [class.active]="selectedCategory() === 'juices'" (click)="toggleCategory('juices')">
            <div class="cat-img-wrap">
              <img src="assets/images/fresh-juice.jpg" alt="Juices">
            </div>
            <span class="cat-label">Juices</span>
          </div>
          <div class="category-item" [class.active]="selectedCategory() === 'combo'" (click)="toggleCategory('combo')">
            <div class="cat-img-wrap cat-combo-img">
              <img src="assets/images/masala-sprouts.jpg" alt="Combos">
              <span class="cat-combo-badge">Combo</span>
            </div>
            <span class="cat-label">Combos</span>
          </div>
        </div>
      </section>

      <!-- ALL PRODUCTS -->
      <section class="container all-products-section">
        <div class="section-title">
          <div class="title-with-pill">
            <span>{{ getSectionTitle() }}</span>
            <span class="items-count-tag">{{ displayProducts().length }} Items</span>
          </div>
          @if (selectedCategory() !== 'all') {
            <button class="clear-filter-link" (click)="setCategory('all')">Show All ✕</button>
          }
        </div>
        @if (displayProducts().length === 0) {
          <div class="empty-state-home">
            <span class="empty-icon">🔍</span>
            <p>No items found</p>
            <button class="reset-filter-btn" (click)="resetSearchAndFilter()">Show All Items</button>
          </div>
        } @else {
          <div class="product-grid">
            @for (product of displayProducts(); track product.id) {
              <app-product-card [product]="product" mode="grid"></app-product-card>
            }
          </div>
        }
      </section>

      <!-- BOTTOM COMBO BANNER SLIDER - Clean, Compact & Premium -->
      <section class="combo-banner-section">
        <div class="combo-banner-track"
             [style.transform]="'translateX(-' + comboIndex() * 100 + '%)'"
             [style.transition]="comboTransition() ? 'transform 0.48s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'"
             (transitionend)="onComboTransitionEnd()">
          @for (slide of comboDisplaySlides(); track slide.uniqueKey) {
            <div class="combo-banner-slide" [style.background]="slide.bg">
              <div class="combo-banner-content">
                <div class="combo-left">
                  <div class="combo-badge-row">
                    <span class="combo-pill-tag">{{ slide.tag }}</span>
                  </div>
                  <h3 class="combo-card-title">{{ slide.title }}</h3>
                  <div class="combo-price-row">
                    <span class="combo-curr-price">&#8377;{{ slide.price }}</span>
                    <del class="combo-old-price">&#8377;{{ slide.originalPrice }}</del>
                    <span class="combo-save-badge">SAVE &#8377;{{ slide.savings }}</span>
                  </div>
                  <a [routerLink]="slide.link" class="combo-btn">
                    {{ slide.btnText }} &#8594;
                  </a>
                </div>
                <div class="combo-right">
                  <div class="combo-dish-frame">
                    <img [src]="slide.image" [alt]="slide.title" class="combo-dish-img">
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
        <div class="combo-banner-dots">
          @for (slide of comboSlides; track slide.id; let i = $index) {
            <span class="bdot" [class.active]="(comboIndex() % comboSlides.length) === i" (click)="goToCombo(i)"></span>
          }
        </div>
      </section>

      <!-- FLOATING VIEW CART TOASTER -->
      @if (cartService.totalItems() > 0) {
        <a routerLink="/cart" class="floating-cart" aria-label="View Cart">
          <div class="fc-left">
            <div class="fc-cart-pill">
              <svg class="fc-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span class="fc-count">{{ cartService.totalItems() }} {{ cartService.totalItems() === 1 ? 'item' : 'items' }}</span>
            </div>
            <div class="fc-divider"></div>
            <span class="fc-price">₹{{ cartService.grandTotal() }}</span>
          </div>
          <div class="fc-right">
            <span class="fc-label">View Cart</span>
            <div class="fc-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>
        </a>
      }
    </div>
  `,
  styles: [`
    .home-page { background: #F8F9FA; overflow-x: hidden; max-width: 100vw; }
    .container { padding-left: 14px; padding-right: 14px; }
    .section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .section-title span { font-size: 15px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.2px; }
    .title-with-pill { display: flex; align-items: center; gap: 8px; }
    .fire-badge {
      background: #FFF3E0;
      color: #E65100;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      letter-spacing: 0.2px;
    }
    .items-count-tag {
      font-size: 10px;
      font-weight: 700;
      color: #2E7D32;
      background: #E8F5E9;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .view-all { font-size: 11px; font-weight: 700; color: #2E7D32; text-decoration: none; }

    /* ===== HERO BANNER SLIDER (REFERENCE CARD STYLE) ===== */
    .banner-section {
      position: relative;
      margin: 14px 14px 0;
      border-radius: 20px;
      overflow: hidden;
      height: 185px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.14);
    }
    .banner-track {
      display: flex;
      height: 100%;
      will-change: transform;
    }
    .banner-slide {
      flex-shrink: 0;
      width: 100%;
      height: 185px;
      position: relative;
      overflow: hidden;
    }
    .banner-content {
      position: relative;
      z-index: 2;
      height: 100%;
      padding: 16px 14px 22px 18px;
    }
    .banner-left {
      width: 50%;
      max-width: 50%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-width: 0;
    }
    .card-brand {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.2px;
      line-height: 1.1;
      display: block;
    }
    .card-title {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.22;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      margin: 4px 0 6px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.22);
      word-wrap: break-word;
    }
    .card-btn {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 16px;
      border-radius: 999px;
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 3px 10px rgba(0,0,0,0.16);
      white-space: nowrap;
      cursor: pointer;
    }
    .card-btn.btn-white {
      background: #ffffff;
      color: #164220;
    }
    .card-btn.btn-white:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 14px rgba(0,0,0,0.24);
    }
    .card-btn.btn-green {
      background: #2E7D32;
      color: #ffffff;
    }
    .card-btn.btn-green:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 14px rgba(46,125,50,0.35);
    }
    .banner-img-corner {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 48%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 1;
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 18%);
      mask-image: linear-gradient(to right, transparent 0%, black 18%);
    }
    .corner-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
    .banner-dots {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 5px;
      z-index: 10;
    }
    .bdot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: rgba(255,255,255,0.45);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .bdot.active {
      background: #ffffff;
      width: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }

    /* ===== OFFER CARD — clip-path zig-zag, transparent cutouts ===== */
    .offer-section {
      margin: 8px 16px 6px;
      animation: offerSlide 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes offerSlide {
      from { opacity: 0; transform: translateY(-12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Green body with clip-path zig-zag on top + bottom */
    /* Percentage x-values = works at any screen width */
    /* 12px tooth height = visible and clean */
    .offer-body {
      background: linear-gradient(105deg, #0b4d1e 0%, #16652a 40%, #1c8034 72%, #229e3e 100%);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      padding: 20px 16px;
      transition: filter 0.15s ease;
      &:active { filter: brightness(0.88); }
      box-shadow: 0 3px 14px rgba(10, 74, 28, 0.22);
      clip-path: polygon(
        /* ─ TOP zig-zag: peaks at y=0, valleys at y=12px ─ */
        0% 12px,   2.5% 0,    5% 12px,
        7.5% 0,    10% 12px,  12.5% 0,   15% 12px,
        17.5% 0,   20% 12px,  22.5% 0,   25% 12px,
        27.5% 0,   30% 12px,  32.5% 0,   35% 12px,
        37.5% 0,   40% 12px,  42.5% 0,   45% 12px,
        47.5% 0,   50% 12px,  52.5% 0,   55% 12px,
        57.5% 0,   60% 12px,  62.5% 0,   65% 12px,
        67.5% 0,   70% 12px,  72.5% 0,   75% 12px,
        77.5% 0,   80% 12px,  82.5% 0,   85% 12px,
        87.5% 0,   90% 12px,  92.5% 0,   95% 12px,
        97.5% 0,   100% 12px,
        /* ─ RIGHT side straight ─ */
        100% calc(100% - 12px),
        /* ─ BOTTOM zig-zag: valleys at 100%, peaks at calc(100% - 12px) ─ */
        97.5% 100%,  95% calc(100% - 12px),
        92.5% 100%,  90% calc(100% - 12px),
        87.5% 100%,  85% calc(100% - 12px),
        82.5% 100%,  80% calc(100% - 12px),
        77.5% 100%,  75% calc(100% - 12px),
        72.5% 100%,  70% calc(100% - 12px),
        67.5% 100%,  65% calc(100% - 12px),
        62.5% 100%,  60% calc(100% - 12px),
        57.5% 100%,  55% calc(100% - 12px),
        52.5% 100%,  50% calc(100% - 12px),
        47.5% 100%,  45% calc(100% - 12px),
        42.5% 100%,  40% calc(100% - 12px),
        37.5% 100%,  35% calc(100% - 12px),
        32.5% 100%,  30% calc(100% - 12px),
        27.5% 100%,  25% calc(100% - 12px),
        22.5% 100%,  20% calc(100% - 12px),
        17.5% 100%,  15% calc(100% - 12px),
        12.5% 100%,  10% calc(100% - 12px),
        7.5% 100%,    5% calc(100% - 12px),
        2.5% 100%,    0% calc(100% - 12px)
      );
    }

    /* Content row */
    .offer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .offer-text-col { flex: 1; min-width: 0; }
    .offer-pill-col  { flex-shrink: 0; }

    /* Left text */
    .offer-heading {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #fff;
      line-height: 1.22;
      margin: 0 0 4px;
      letter-spacing: -0.2px;
    }
    .offer-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.8);
      font-weight: 400;
      margin: 0;
    }

    /* Right pink pill */
    .offer-pill {
      position: relative;
      background: linear-gradient(145deg, #FF7AB7 0%, #FF2080 52%, #D4006A 100%);
      border-radius: 13px;
      padding: 7px 13px;
      min-width: 82px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 5px 16px rgba(212,0,106,0.48), inset 0 1px 0 rgba(255,255,255,0.5);
      border: 1.5px solid rgba(255,255,255,0.32);
    }
    .offer-pill.claimed {
      background: linear-gradient(145deg, #00E676 0%, #00B04A 100%);
      box-shadow: 0 5px 16px rgba(0,176,74,0.45);
    }
    .pill-glare {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 50%;
      border-radius: 13px 13px 0 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.42) 0%, transparent 100%);
      pointer-events: none;
    }
    .pill-label {
      font-family: 'Outfit', sans-serif;
      font-size: 7.5px;
      font-weight: 800;
      color: rgba(255,255,255,0.95);
      letter-spacing: 0.6px;
      text-transform: uppercase;
      line-height: 1;
      position: relative;
      z-index: 1;
    }
    .pill-amount {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 900;
      color: #fff;
      line-height: 1.05;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      position: relative;
      z-index: 1;
    }

    /* ===== SEARCH ===== */
    .search-section { padding-top: 10px; padding-bottom: 2px; }
    .search-bar {
      display: flex; align-items: center; gap: 8px;
      background: #fff; border-radius: 999px; padding: 9px 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06); border: 1.5px solid #EEE; transition: all 0.25s;
    }
    .search-bar:focus-within { border-color: #4CAF50; box-shadow: 0 0 0 3px rgba(76,175,80,0.12); }
    .search-icon-svg { flex-shrink: 0; }
    .search-bar input { flex: 1; border: none; outline: none; font-size: 12px; color: #1A1A1A; background: transparent; font-family: inherit; }
    .search-bar input::placeholder { color: #aaa; }
    .clear-search-btn {
      background: #E0E0E0;
      border: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #666;
      cursor: pointer;
      padding: 0;
    }

    /* ===== CATEGORIES (Full-width 4-column layout like Swiggy / Zomato) ===== */
    .categories-section { padding-top: 16px; padding-bottom: 4px; }
    .sec-title-clean {
      font-size: 14px;
      font-weight: 800;
      color: #1A1A1A;
      letter-spacing: -0.2px;
      margin-bottom: 12px;
    }
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

    .category-item.active .cat-img-wrap {
      border-color: #2E7D32;
      box-shadow: 0 0 0 3px rgba(46,125,50,0.22), 0 4px 14px rgba(46,125,50,0.18);
      transform: scale(1.04);
    }
    .category-item.active .cat-label {
      color: #2E7D32;
      font-weight: 800;
    }

    .clear-filter-link {
      background: none;
      border: none;
      color: #E53935;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
    }
    .clear-filter-link:hover { text-decoration: underline; }

    /* ===== EMPTY STATE ===== */
    .empty-state-home {
      text-align: center;
      padding: 36px 16px;
      background: #fff;
      border-radius: 14px;
      border: 1px dashed #DDD;
      margin: 10px 0;
    }
    .empty-state-home .empty-icon { font-size: 28px; display: block; margin-bottom: 8px; }
    .empty-state-home p { font-size: 13px; color: #777; margin-bottom: 12px; }
    .reset-filter-btn {
      background: #2E7D32;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 7px 16px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
    }

    /* ===== ALL PRODUCTS ===== */
    .all-products-section { padding-top: 18px; padding-bottom: 4px; }
    .product-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }

    /* ===== BOTTOM COMBO BANNER SLIDER ===== */
    .combo-banner-section {
      position: relative;
      margin: 20px 14px 28px;
      border-radius: 20px;
      overflow: hidden;
      height: 135px;
      box-shadow: 0 6px 22px rgba(0,0,0,0.12);
    }
    .combo-banner-track {
      display: flex;
      height: 100%;
      will-change: transform;
    }
    .combo-banner-slide {
      flex-shrink: 0;
      width: 100%;
      height: 135px;
      position: relative;
      overflow: hidden;
    }
    .combo-banner-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 12px 16px 16px 18px;
      gap: 12px;
      position: relative;
      z-index: 2;
    }
    .combo-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-width: 0;
    }
    .combo-badge-row {
      display: flex;
      align-items: center;
    }
    .combo-pill-tag {
      background: rgba(255,255,255,0.2);
      color: #ffffff;
      font-size: 8px;
      font-weight: 800;
      padding: 2.5px 8px;
      border-radius: 999px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      backdrop-filter: blur(4px);
    }
    .combo-card-title {
      font-family: 'Outfit', sans-serif;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.1px;
      margin: 2px 0 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .combo-price-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }
    .combo-curr-price {
      color: #ffffff;
      font-size: 15px;
      font-weight: 900;
    }
    .combo-old-price {
      color: rgba(255,255,255,0.55);
      font-size: 10px;
      font-weight: 500;
    }
    .combo-save-badge {
      background: #FF6B35;
      color: #ffffff;
      font-size: 8px;
      font-weight: 800;
      padding: 1.5px 6px;
      border-radius: 4px;
      letter-spacing: 0.3px;
    }
    .combo-btn {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ffffff;
      color: #1A5424;
      padding: 5px 14px;
      border-radius: 999px;
      font-family: inherit;
      font-size: 10px;
      font-weight: 800;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 3px 10px rgba(0,0,0,0.15);
      cursor: pointer;
    }
    .combo-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 14px rgba(0,0,0,0.22);
    }
    .combo-right {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .combo-dish-frame {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255,255,255,0.38);
      box-shadow: 0 6px 18px rgba(0,0,0,0.28);
      background: rgba(255,255,255,0.1);
    }
    .combo-dish-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .combo-banner-dots {
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      z-index: 10;
    }

    /* FLOATING VIEW CART TOASTER */
    .floating-cart {
      position: fixed;
      bottom: 74px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 24px);
      max-width: 440px;
      background: linear-gradient(135deg, #155523 0%, #1e702e 52%, #24963F 100%);
      color: #fff;
      border-radius: 16px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      box-shadow: 0 10px 28px -4px rgba(21, 85, 35, 0.48), 0 4px 12px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 990;
      animation: slideUpFloat 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;

      &:hover {
        transform: translateX(-50%) translateY(-2px);
        box-shadow: 0 14px 34px -4px rgba(21, 85, 35, 0.58), 0 6px 16px rgba(0, 0, 0, 0.15);

        .fc-arrow {
          transform: translateX(3px);
          background: rgba(255, 255, 255, 0.32);
        }
      }

      &:active {
        transform: translateX(-50%) scale(0.98);
      }
    }

    .fc-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .fc-cart-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.24);
      padding: 4px 9px;
      border-radius: 999px;
      backdrop-filter: blur(4px);
    }

    .fc-cart-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      stroke: #fff;
    }

    .fc-count {
      font-size: 11.5px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }

    .fc-divider {
      width: 1px;
      height: 16px;
      background: rgba(255, 255, 255, 0.28);
    }

    .fc-price {
      font-size: 15px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.2px;
    }

    .fc-right {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .fc-label {
      font-size: 13.5px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.3px;
    }

    .fc-arrow {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;

      svg {
        stroke: #fff;
      }
    }

    @keyframes slideUpFloat {
      from {
        transform: translateX(-50%) translateY(40px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }

    @media (min-width: 768px) {
      .banner-section { height: 260px; }
      .banner-slide { height: 260px; }
      .banner-title { font-size: 36px; }
      .banner-img-wrap { width: 160px; height: 160px; }
      .categories-section, .popular-section, .all-products-section { max-width: 960px; margin-left: auto; margin-right: auto; padding-left: 32px; padding-right: 32px; }
      .combo-banner-section { height: 170px; margin: 20px auto 30px; max-width: 960px; }
      .combo-banner-slide { height: 170px; }
      .pop-card { max-width: 190px; width: 22vw; }
      .floating-cart { max-width: 420px; bottom: 24px; }
    }
  `]
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  cartService = inject(CartService);
  searchQuery = '';

  selectedCategory = signal<string>('all');

  displayProducts = computed<Product[]>(() => {
    let list = this.productService.getAll();
    if (this.selectedCategory() !== 'all') {
      list = list.filter(p => p.category === this.selectedCategory());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return list;
  });

  // Hero slides (Authentic Swiggy & Zomato signature food palettes)
  heroSlides = [
    {
      id: 1,
      brand: 'FruitChat',
      brandColor: '#FFE4E6',
      headlineHtml: 'FRESH FRUIT CHAAT.<br>DISCOVER YOUR<br>FAVORITE MIX!',
      titleColor: '#ffffff',
      btnText: 'Order Now',
      btnStyle: 'white',
      btnTextColor: '#B91C1C',
      link: '/product/1',
      image: 'assets/images/mix-fruit-chaat.jpg',
      bg: 'linear-gradient(120deg, #991B1B 0%, #C92A36 45%, #E23744 100%)',
    },
    {
      id: 2,
      brand: 'FruitChat',
      brandColor: '#DCFCE7',
      headlineHtml: 'BOOST YOUR HEALTH<br>with MASALA SPROUTS!',
      titleColor: '#ffffff',
      btnText: 'Explore Sprouts',
      btnStyle: 'white',
      btnTextColor: '#0F6832',
      link: '/product/2',
      image: 'assets/images/masala-sprouts.jpg',
      bg: 'linear-gradient(120deg, #0F6832 0%, #188644 45%, #24A255 100%)',
    },
    {
      id: 3,
      brand: 'FruitChat',
      brandColor: '#FEF3C7',
      headlineHtml: 'STAY REFRESHED.<br>PURE ORANGE JUICE.',
      titleColor: '#ffffff',
      btnText: 'Shop Juices',
      btnStyle: 'white',
      btnTextColor: '#B54A00',
      link: '/product/3',
      image: 'assets/images/fresh-juice.jpg',
      bg: 'linear-gradient(120deg, #B54A00 0%, #D86300 45%, #FC8019 100%)',
    },
    {
      id: 4,
      brand: 'FruitChat',
      brandColor: '#FEF9C3',
      headlineHtml: 'TASTE THE SEASON.<br>SEASONAL FRUIT CHAAT.',
      titleColor: '#ffffff',
      btnText: 'Order Today',
      btnStyle: 'white',
      btnTextColor: '#8A5200',
      link: '/product/4',
      image: 'assets/images/pineapple-chaat.jpg',
      bg: 'linear-gradient(120deg, #8A5200 0%, #AF6D00 45%, #D48800 100%)',
    },
    {
      id: 5,
      brand: 'FruitChat',
      brandColor: '#CCFBF1',
      headlineHtml: 'THE PERFECT BALANCE.<br>ORDER THE HEALTHY COMBO.',
      titleColor: '#ffffff',
      btnText: 'Order Combo',
      btnStyle: 'white',
      btnTextColor: '#0F766E',
      link: '/product/8',
      image: 'assets/images/masala-sprouts.jpg',
      bg: 'linear-gradient(120deg, #042F2E 0%, #0F766E 45%, #0D9488 100%)',
    },
  ];

  heroDisplaySlides = computed(() => [
    ...this.heroSlides.map(s => ({ ...s, uniqueKey: `hero-${s.id}` })),
    { ...this.heroSlides[0], uniqueKey: 'hero-clone-first' }
  ]);

  heroIndex = signal(0);
  heroTransition = signal(true);
  private heroTimer: ReturnType<typeof setInterval> | null = null;

  // Combo banner slides (Authentic combos with combo data - Distinct Vibrant Backgrounds)
  comboSlides = [
    {
      id: 1,
      tag: 'BESTSELLER COMBO',
      title: 'Fruit Chaat + Sprouts',
      price: 99,
      originalPrice: 140,
      savings: 41,
      btnText: 'Order Combo',
      link: '/product/8',
      image: 'assets/images/masala-sprouts.jpg',
      bg: 'linear-gradient(125deg, #0A3D18 0%, #15662B 50%, #239441 100%)',
    },
    {
      id: 2,
      tag: 'FITNESS SPECIAL',
      title: 'Sprouts + Orange Juice',
      price: 119,
      originalPrice: 150,
      savings: 31,
      btnText: 'Order Combo',
      link: '/product/8',
      image: 'assets/images/fresh-juice.jpg',
      bg: 'linear-gradient(125deg, #7C2D12 0%, #C2410C 50%, #EA580C 100%)',
    },
    {
      id: 3,
      tag: 'VALUE DEAL',
      title: 'Fruit Chaat + Juice',
      price: 139,
      originalPrice: 170,
      savings: 31,
      btnText: 'Order Combo',
      link: '/product/8',
      image: 'assets/images/mix-fruit-chaat.jpg',
      bg: 'linear-gradient(125deg, #7F1D1D 0%, #B91C1C 50%, #DC2626 100%)',
    },
    {
      id: 4,
      tag: 'ALL-IN-ONE TRIO',
      title: 'Chaat + Sprouts + Juice',
      price: 189,
      originalPrice: 240,
      savings: 51,
      btnText: 'Order Combo',
      link: '/product/8',
      image: 'assets/images/pineapple-chaat.jpg',
      bg: 'linear-gradient(125deg, #042F2E 0%, #0F766E 50%, #14B8A6 100%)',
    },
  ];

  comboDisplaySlides = computed(() => [
    ...this.comboSlides.map(s => ({ ...s, uniqueKey: `combo-${s.id}` })),
    { ...this.comboSlides[0], uniqueKey: 'combo-clone-first' }
  ]);

  comboIndex = signal(0);
  comboTransition = signal(true);
  private comboTimer: ReturnType<typeof setInterval> | null = null;
  // Offer Banner Suspense & Accordion State
  isOfferExpanded = signal(false);
  offerTimeLeft = signal('12:45');
  offerCopied = signal(false);
  private offerTimer: ReturnType<typeof setInterval> | null = null;
  private offerSeconds = 12 * 60 + 45;

  ngAfterViewInit(): void {
    this.startHeroAuto();
    this.startComboAuto();
    this.startOfferTimer();
  }

  ngOnDestroy(): void {
    if (this.heroTimer)  clearInterval(this.heroTimer);
    if (this.comboTimer) clearInterval(this.comboTimer);
    if (this.offerTimer) clearInterval(this.offerTimer);
  }

  toggleOfferAccordion(): void {
    this.isOfferExpanded.update(v => !v);
  }

  copyOfferCode(e: Event): void {
    e.stopPropagation();
    try {
      navigator.clipboard?.writeText('HEALTH50');
    } catch (_) {}
    this.offerCopied.set(true);
    setTimeout(() => this.offerCopied.set(false), 2500);
  }

  private startOfferTimer(): void {
    this.offerTimer = setInterval(() => {
      if (this.offerSeconds > 0) {
        this.offerSeconds--;
        const m = Math.floor(this.offerSeconds / 60);
        const s = this.offerSeconds % 60;
        this.offerTimeLeft.set(`${m}:${s < 10 ? '0' : ''}${s}`);
      } else {
        this.offerSeconds = 15 * 60;
      }
    }, 1000);
  }

  // Hero auto-loop
  private startHeroAuto(): void {
    this.heroTimer = setInterval(() => {
      this.nextHero();
    }, 3200);
  }

  nextHero(): void {
    if (this.heroIndex() >= this.heroSlides.length) {
      this.heroTransition.set(false);
      this.heroIndex.set(0);
      setTimeout(() => {
        this.heroTransition.set(true);
        this.heroIndex.set(1);
      }, 40);
      return;
    }
    this.heroTransition.set(true);
    this.heroIndex.update(i => i + 1);
  }

  onHeroTransitionEnd(): void {
    if (this.heroIndex() >= this.heroSlides.length) {
      this.heroTransition.set(false);
      this.heroIndex.set(0);
      setTimeout(() => {
        this.heroTransition.set(true);
      }, 40);
    }
  }

  goToHero(i: number): void {
    if (this.heroTimer) clearInterval(this.heroTimer);
    if (this.heroIndex() >= this.heroSlides.length) {
      this.heroTransition.set(false);
      this.heroIndex.set(0);
      setTimeout(() => {
        this.heroTransition.set(true);
        this.heroIndex.set(i);
        this.startHeroAuto();
      }, 30);
      return;
    }
    this.heroTransition.set(true);
    this.heroIndex.set(i);
    this.startHeroAuto();
  }

  // Combo banner auto-scroll
  private startComboAuto(): void {
    this.comboTimer = setInterval(() => {
      this.nextCombo();
    }, 3000);
  }

  nextCombo(): void {
    if (this.comboIndex() >= this.comboSlides.length) {
      this.comboTransition.set(false);
      this.comboIndex.set(0);
      setTimeout(() => {
        this.comboTransition.set(true);
        this.comboIndex.set(1);
      }, 40);
      return;
    }
    this.comboTransition.set(true);
    this.comboIndex.update(i => i + 1);
  }

  onComboTransitionEnd(): void {
    if (this.comboIndex() >= this.comboSlides.length) {
      this.comboTransition.set(false);
      this.comboIndex.set(0);
      setTimeout(() => {
        this.comboTransition.set(true);
      }, 40);
    }
  }

  goToCombo(i: number): void {
    if (this.comboTimer) clearInterval(this.comboTimer);
    if (this.comboIndex() >= this.comboSlides.length) {
      this.comboTransition.set(false);
      this.comboIndex.set(0);
      setTimeout(() => {
        this.comboTransition.set(true);
        this.comboIndex.set(i);
        this.startComboAuto();
      }, 30);
      return;
    }
    this.comboTransition.set(true);
    this.comboIndex.set(i);
    this.startComboAuto();
  }

  // Category Filtering
  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  toggleCategory(cat: string): void {
    this.selectedCategory.set(this.selectedCategory() === cat ? 'all' : cat);
  }

  getSectionTitle(): string {
    switch (this.selectedCategory()) {
      case 'fruit-chaat': return 'Fresh Fruit Chaat';
      case 'sprouts': return 'Healthy Sprouts';
      case 'juices': return 'Cold-Pressed Juices';
      case 'combo': return 'Healthy Combos';
      default: return 'All Items';
    }
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
    // computed displayProducts triggers automatically
  }

  clearHomeSearch(): void {
    this.searchQuery = '';
  }

  resetSearchAndFilter(): void {
    this.searchQuery = '';
    this.selectedCategory.set('all');
  }
}
