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
                  <a [routerLink]="slide.link" class="card-btn" [class.btn-white]="slide.btnStyle === 'white'" [class.btn-green]="slide.btnStyle === 'green'">
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

      <!-- OFFER BANNER — smooth scalloped ticket matching reference image 2 -->
      <section class="offer-section">

        <!-- TOP zig-zag: page-bg solid fill, triangular teeth point DOWN into green -->
        <svg class="scallop-svg scallop-svg-top" viewBox="0 0 420 16" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 L420,0 L420,16 L410,0 L400,16 L390,0 L380,16 L370,0 L360,16 L350,0 L340,16 L330,0 L320,16 L310,0 L300,16 L290,0 L280,16 L270,0 L260,16 L250,0 L240,16 L230,0 L220,16 L210,0 L200,16 L190,0 L180,16 L170,0 L160,16 L150,0 L140,16 L130,0 L120,16 L110,0 L100,16 L90,0 L80,16 L70,0 L60,16 L50,0 L40,16 L30,0 L20,16 L10,0 L0,16 Z" fill="#F8F9FA"/>
        </svg>

        <!-- GREEN BODY -->
        <div class="offer-body" (click)="copyOfferCode($event)">
          <!-- Sparkles -->
          <div class="sparkle-layer">
            <span class="sp-item s1">✦</span>
            <span class="sp-item s2">✦</span>
            <span class="sp-item s3">✦</span>
            <span class="sp-item s4">•</span>
            <span class="sp-item s5">•</span>
          </div>
          <!-- Shine sweep -->
          <div class="offer-shine"></div>

          <div class="offer-row">
            <!-- Left -->
            <div class="offer-text-col">
              <h3 class="offer-heading">Hurry, ₹50 Free Cash<br>expiring soon!</h3>
              <p class="offer-sub">Valid on food orders above ₹99</p>
            </div>

            <!-- Right pill —  exact match to reference image 2 -->
            <div class="offer-pill-col">
              <div class="offer-pill" [class.claimed]="offerCopied()">
                <div class="pill-pulse-ring"></div>
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

        <!-- BOTTOM zig-zag: page-bg solid fill, triangular teeth point UP into green -->
        <svg class="scallop-svg scallop-svg-bottom" viewBox="0 0 420 16" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,16 L420,16 L420,0 L410,16 L400,0 L390,16 L380,0 L370,16 L360,0 L350,16 L340,0 L330,16 L320,0 L310,16 L300,0 L290,16 L280,0 L270,16 L260,0 L250,16 L240,0 L230,16 L220,0 L210,16 L200,0 L190,16 L180,0 L170,16 L160,0 L150,16 L140,0 L130,16 L120,0 L110,16 L100,0 L90,16 L80,0 L70,16 L60,0 L50,16 L40,0 L30,16 L20,0 L10,16 L0,0 Z" fill="#F8F9FA"/>
        </svg>

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
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%);
      mask-image: linear-gradient(to right, transparent 0%, black 12%);
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

    /* ===== OFFER BANNER — smooth scalloped ticket (reference image 2 style) ===== */
    .offer-section {
      width: 100%;
      margin: 8px 0 4px;
      display: flex;
      flex-direction: column;
      animation: offerEntrance 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes offerEntrance {
      from { opacity: 0; transform: translateY(-16px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }

    /* Scallop SVGs — render page-bg color overtop the green edges */
    .scallop-svg {
      display: block;
      width: 100%;
      height: 16px;
      flex-shrink: 0;
    }
    .scallop-svg-top    { margin-bottom: -1px; }
    .scallop-svg-bottom { margin-top: -1px; }

    /* Green ticket body */
    .offer-body {
      position: relative;
      background: linear-gradient(100deg, #0e5220 0%, #197a30 45%, #1f9939 80%, #25b847 100%);
      overflow: hidden;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      padding: 13px 16px 14px;
      transition: filter 0.16s ease;
      &:active { filter: brightness(0.9); }
    }

    /* Diagonal glimmer sweep — matches reference */
    .offer-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        115deg,
        transparent 25%,
        rgba(255,255,255,0.10) 48%,
        rgba(255,255,255,0.04) 52%,
        transparent 72%
      );
      background-size: 250% 100%;
      background-position: -100% 0;
      animation: shimmerSweep 4s ease-in-out infinite;
      pointer-events: none;
      z-index: 0;
    }
    @keyframes shimmerSweep {
      0%   { background-position: -100% 0; }
      55%  { background-position: 220% 0; }
      100% { background-position: 220% 0; }
    }

    /* Floating sparkle stars */
    .sparkle-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 1;
    }
    .sp-item {
      position: absolute;
      color: rgba(255,255,255,0.75);
      font-weight: 700;
      animation: spFloat 3.2s ease-in-out infinite alternate;
    }
    .s1 { top: 18%; left: 6%;   font-size: 10px; animation-delay: 0s;    }
    .s2 { bottom: 18%; left: 14%; font-size: 8px;  animation-delay: 0.65s; }
    .s3 { top: 22%; left: 48%;  font-size: 12px; animation-delay: 1.3s; opacity:0.4; }
    .s4 { top: 12%; right: 38%; font-size: 9px;  animation-delay: 0.35s; }
    .s5 { bottom: 20%; right: 32%; font-size: 8px; animation-delay: 1.05s; }
    @keyframes spFloat {
      0%   { opacity: 0.2;  transform: translateY(0px)   scale(0.8);  }
      100% { opacity: 0.85; transform: translateY(-5px)  scale(1.2);  }
    }

    /* Content row */
    .offer-row {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .offer-text-col { flex: 1; min-width: 0; }
    .offer-pill-col  { flex-shrink: 0; }

    /* Left text — exact reference image 2 typography */
    .offer-heading {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.22;
      margin: 0 0 3px;
      letter-spacing: -0.2px;
    }
    .offer-sub {
      font-size: 10.5px;
      color: rgba(255,255,255,0.82);
      font-weight: 400;
      margin: 0;
    }

    /* Right pill — salmon/pink lozenge from reference image 2 */
    .offer-pill {
      position: relative;
      background: linear-gradient(145deg, #FF6CAB 0%, #FF1E78 55%, #D10059 100%);
      border-radius: 14px;
      padding: 7px 14px 6px;
      min-width: 80px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 6px 20px rgba(209, 0, 89, 0.52),
        inset 0 1.5px 0 rgba(255,255,255,0.55);
      border: 1.5px solid rgba(255,255,255,0.38);
      transition: transform 0.2s ease;
      animation: pillLevitate 2.6s ease-in-out infinite alternate;
    }
    @keyframes pillLevitate {
      0%   { transform: rotate(-2deg) translateY(0px);  }
      100% { transform: rotate(-2deg) translateY(-5px); }
    }
    .offer-pill.claimed {
      background: linear-gradient(145deg, #00E676 0%, #00B248 100%);
      box-shadow: 0 6px 20px rgba(0,178,72,0.48);
      animation: none;
      transform: rotate(-2deg);
    }

    /* Pulse ring on pill */
    .pill-pulse-ring {
      position: absolute;
      inset: -6px;
      border-radius: 20px;
      border: 2px solid rgba(255,108,171,0.7);
      pointer-events: none;
      animation: pulsRing 2s ease-out infinite;
    }
    @keyframes pulsRing {
      0%   { opacity: 0.9; transform: scale(1);    }
      65%  { opacity: 0;   transform: scale(1.3);  }
      100% { opacity: 0;   transform: scale(1.3);  }
    }

    /* Glare highlight inside pill */
    .pill-glare {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 50%;
      border-radius: 14px 14px 0 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.48) 0%, transparent 100%);
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
      text-shadow: 0 2px 4px rgba(0,0,0,0.22);
      position: relative;
      z-index: 1;
    }
    .pill-amount.claimed-check {
      font-size: 20px !important;
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

  // Hero slides (5 category cards matched to reference UI)
  heroSlides = [
    {
      id: 1,
      brand: 'FruitChat',
      brandColor: '#ffffff',
      headlineHtml: 'FRESH FRUIT CHAAT.<br>DISCOVER YOUR<br>FAVORITE MIX!',
      titleColor: '#ffffff',
      btnText: 'Order Now',
      btnStyle: 'white',
      link: '/product/1',
      image: 'assets/images/mix-fruit-chaat.jpg',
      bg: 'linear-gradient(110deg, #113819 0%, #174E23 45%, #1F632E 100%)',
    },
    {
      id: 2,
      brand: 'FruitChat',
      brandColor: '#ffffff',
      headlineHtml: 'BOOST YOUR HEALTH<br>with MASALA SPROUTS!',
      titleColor: '#ffffff',
      btnText: 'Explore Sprouts',
      btnStyle: 'white',
      link: '/product/2',
      image: 'assets/images/masala-sprouts.jpg',
      bg: 'linear-gradient(110deg, #164220 0%, #205C2E 45%, #2C783D 100%)',
    },
    {
      id: 3,
      brand: 'FruitChat',
      brandColor: '#FFA726',
      headlineHtml: 'STAY REFRESHED.<br>PURE ORANGE JUICE.',
      titleColor: '#ffffff',
      btnText: 'Shop Juices',
      btnStyle: 'white',
      link: '/product/3',
      image: 'assets/images/fresh-juice.jpg',
      bg: 'linear-gradient(110deg, #0F1210 0%, #181C19 45%, #222723 100%)',
    },
    {
      id: 4,
      brand: 'FruitChat',
      brandColor: '#ffffff',
      headlineHtml: 'TASTE THE SEASON.<br>SEASONAL FRUIT CHAAT.',
      titleColor: '#ffffff',
      btnText: 'Order Today',
      btnStyle: 'white',
      link: '/product/4',
      image: 'assets/images/pineapple-chaat.jpg',
      bg: 'linear-gradient(115deg, #1B5226 0%, #257034 50%, #328E44 100%)',
    },
    {
      id: 5,
      brand: 'FruitChat',
      brandColor: '#ffffff',
      headlineHtml: 'THE PERFECT BALANCE.<br>ORDER THE HEALTHY COMBO.',
      titleColor: '#ffffff',
      btnText: 'Order Combo',
      btnStyle: 'white',
      link: '/product/8',
      image: 'assets/images/masala-sprouts.jpg',
      bg: 'linear-gradient(110deg, #0F2E16 0%, #164621 45%, #1F5F2D 100%)',
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
      bg: 'linear-gradient(125deg, #4A044E 0%, #701A75 50%, #A21CAF 100%)',
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
