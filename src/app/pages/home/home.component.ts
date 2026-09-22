import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { SnackbarService } from '../../core/services/snackbar.service';
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

      <!-- ACTIVE ORDER STRIP (ONLY SHOWN IF EXACTLY 1 ACTIVE ORDER) -->
      @if (activeOrdersCount() === 1) {
        <div class="home-active-order-wrapper">
          <!-- SINGLE ORDER UI WITH PROGRESS BAR (EXACT MOCKUP) -->
          <div class="active-order-strip light-theme single-order" [routerLink]="'/track-order/' + activeOrders()[0].id">
            <div class="aos-top-row">
              <div class="aos-info">
                <span class="aos-title dark-text">{{ getStatusText(activeOrders()[0].status) }}</span>
                <span class="aos-sub dark-sub">Order #{{ activeOrders()[0].id.slice(-6).toUpperCase() }}</span>
              </div>
              <div class="aos-actions" (click)="$event.stopPropagation()">
                <a [routerLink]="'/track-order/' + activeOrders()[0].id" class="icon-btn track-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Track
                </a>
                <a href="tel:+919827664121" class="icon-btn call-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Call
                </a>
              </div>
            </div>
            
            <div class="aos-progress-wrapper">
              <div class="progress-track">
                <div class="progress-fill" [style.width.%]="getProgressPercent(activeOrders()[0].status)"></div>
                <div class="moving-rider" [style.left.%]="getProgressPercent(activeOrders()[0].status)">
                  <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="35" width="25" height="25" rx="3" fill="#FF9800"/>
                    <path d="M15 65 L40 65 L45 50 L65 50 L75 65 L85 65 A5 5 0 0 1 85 75 L15 75 A5 5 0 0 1 15 65 Z" fill="#4CAF50"/>
                    <path d="M60 50 L70 30 L75 30" fill="none" stroke="#2E7D32" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="75" cy="30" r="3" fill="#1B5E20"/>
                    <path d="M35 50 C35 35 45 35 50 35 L60 35 L65 45 L50 45 L45 50 Z" fill="#FFB74D"/>
                    <circle cx="55" cy="25" r="8" fill="#FFCC80"/>
                    <path d="M45 25 A10 10 0 0 1 65 25 Z" fill="#2E7D32"/>
                    <circle cx="25" cy="75" r="10" fill="#333"/>
                    <circle cx="25" cy="75" r="4" fill="#BDBDBD"/>
                    <circle cx="75" cy="75" r="10" fill="#333"/>
                    <circle cx="75" cy="75" r="4" fill="#BDBDBD"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- OFFER CARD — Dynamic from Firestore fc_settings/offerCard (with Skeleton Loading) -->
      @if (dataService.isOfferCardLoading()) {
        <section class="offer-section">
          <div class="offer-skel-body">
            <div class="offer-row">
              <div class="offer-text-col">
                <div class="offer-skel-badge-strip">
                  <div class="skel-pill-code"></div>
                </div>
                <div class="skel-offer-heading"></div>
                <div class="skel-offer-sub"></div>
              </div>
              <div class="offer-pill-col">
                <div class="skel-offer-cta"></div>
              </div>
            </div>
          </div>
        </section>
      } @else if (dataService.offerCard().isActive !== false) {
        <section class="offer-section">
          <div class="offer-body" (click)="copyOfferCode($event)">
            <div class="offer-decor-glow"></div>
            <div class="offer-row">
              <div class="offer-text-col">
                <div class="offer-badge-strip">
                  <span class="offer-code-tag">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    CODE: {{ (dataService.offerCard().code || 'FRUIT50').toUpperCase() }}
                  </span>
                  @if (isCouponApplied()) {
                    <span class="applied-tag">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      APPLIED IN CART
                    </span>
                  }
                </div>
                <h3 class="offer-heading">{{ dataService.offerCard().heading || 'Hurry, ₹50 Free Cash expiring soon!' }}</h3>
                <p class="offer-sub">
                  Get <strong>₹{{ dataService.offerCard().amount || 50 }} OFF</strong> on orders above <strong>₹{{ dataService.offerCard().minOrderAmount || 99 }}</strong>
                </p>
              </div>
              <div class="offer-pill-col">
                <div class="offer-pill" [class.claimed]="offerCopied() || isCouponApplied()">
                  <div class="pill-glare"></div>
                  @if (offerCopied()) {
                    <span class="pill-label">COPIED</span>
                    <span class="pill-amount">🎉 SAVED</span>
                  } @else if (isCouponApplied()) {
                    <span class="pill-label">COUPON</span>
                    <span class="pill-amount">APPLIED ✓</span>
                  } @else {
                    <span class="pill-label">TAP TO APPLY</span>
                    <span class="pill-amount">₹{{ dataService.offerCard().amount || 50 }} OFF</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </section>
      }

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

      <!-- CATEGORY CHIPS (Dynamic from Firestore with Skeleton) -->
      <section class="container categories-section">
        <div class="sec-title-clean">
          <span>What's on your mind?</span>
        </div>
        @if (isLoading()) {
          <div class="categories-grid">
            @for (i of [1,2,3,4]; track i) {
              <div class="category-skel-item">
                <div class="cat-skel-circle"></div>
                <div class="cat-skel-text"></div>
              </div>
            }
          </div>
        } @else {
          <div class="categories-grid">
            @for (cat of displayCategories(); track cat.id) {
              <div class="category-item" [class.active]="selectedCategory() === cat.id" (click)="toggleCategory(cat.id)">
                <div class="cat-img-wrap">
                  <img [src]="cat.image || 'assets/images/mix-fruit-chaat.jpg'" [alt]="cat.name"
                       onerror="this.src='assets/images/mix-fruit-chaat.jpg'">
                </div>
                <span class="cat-label">{{ cat.name }}</span>
              </div>
            }
          </div>
        }
      </section>

      <!-- ALL PRODUCTS (Dynamic with Skeleton) -->
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
        @if (isLoading()) {
          <div class="product-grid">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="home-skel-card">
                <div class="h-skel-img"></div>
                <div class="h-skel-body">
                  <div class="h-skel-line short"></div>
                  <div class="h-skel-line wide"></div>
                  <div class="h-skel-line med"></div>
                </div>
              </div>
            }
          </div>
        } @else if (displayProducts().length === 0) {
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

      <!-- BOTTOM COMBO BANNER SLIDER - Dynamic from fc_combo_cards -->
      @if (dynamicComboSlides().length > 0) {
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
                      <img [src]="slide.image" [alt]="slide.title" class="combo-dish-img"
                           onerror="this.src='assets/images/masala-sprouts.jpg'">
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          <div class="combo-banner-dots">
            @for (slide of dynamicComboSlides(); track slide.id; let i = $index) {
              <span class="bdot" [class.active]="(comboIndex() % dynamicComboSlides().length) === i" (click)="goToCombo(i)"></span>
            }
          </div>
        </section>
      }

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

    /* ACTIVE ORDER STRIP (BLINKIT STYLE FOR HOME) */
    .home-active-order-wrapper {
      padding: 14px 14px 0;
      animation: slideDownFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes slideDownFadeIn {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .active-order-strip.light-theme {
      background: #F4FBF6; /* Match mockup background */
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0,0,0,0.03);
      border: 1px solid #E1EFE6;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }
    .active-order-strip.light-theme.multi-order {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
    }
    .active-order-strip.light-theme:active { transform: scale(0.98); }
    .active-order-strip.light-theme:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
    
    .aos-top-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 24px;
    }
    
    .aos-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .aos-title.dark-text {
      font-size: 15px;
      font-weight: 800;
      color: #0D4A22;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 3px;
    }
    .aos-sub.dark-sub {
      font-size: 11.5px;
      color: #617C6B;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .aos-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .icon-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }
    .icon-btn.call-btn {
      background: #ffffff;
      border: 1px solid #2E7D32;
      color: #2E7D32;
    }
    .icon-btn.call-btn:hover { background: #F4FBF6; }
    .icon-btn.track-btn {
      background: #2E7D32;
      border: 1px solid #2E7D32;
      color: #fff;
    }
    .icon-btn.track-btn:hover { background: #1B5E20; border-color: #1B5E20; }

    /* Progress Bar */
    .aos-progress-wrapper {
      width: 100%;
      position: relative;
      padding-bottom: 2px;
    }
    .progress-track {
      width: 100%;
      height: 6px;
      background: #E3F2E7;
      border-radius: 999px;
      position: relative;
    }
    .progress-fill {
      height: 100%;
      background: #2E7D32;
      border-radius: 999px;
      transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .moving-rider {
      position: absolute;
      top: -26px;
      transform: translateX(-50%);
      transition: left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
      animation: bounceRide 1s infinite alternate;
      z-index: 2;
    }
    @keyframes bounceRide {
      0% { transform: translateX(-50%) translateY(0); }
      100% { transform: translateX(-50%) translateY(-2px); }
    }

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

    /* ===== OFFER CARD — Modern Premium Voucher Design ===== */
    .offer-section {
      margin: 10px 16px 8px;
      animation: offerSlide 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes offerSlide {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .offer-body {
      position: relative;
      background: linear-gradient(135deg, #0b4e20 0%, #157335 55%, #1da149 100%);
      border-radius: 16px;
      padding: 14px 16px;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 6px 20px -2px rgba(11, 78, 32, 0.32), 0 2px 6px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      &:active { transform: scale(0.985); }
    }

    .offer-decor-glow {
      position: absolute;
      top: -24px;
      right: -24px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%);
      pointer-events: none;
    }

    /* Content row */
    .offer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      position: relative;
      z-index: 1;
    }
    .offer-text-col {
      flex: 1 1 auto;
      min-width: 0;
    }
    .offer-pill-col {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .offer-badge-strip {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 5px;
      flex-wrap: wrap;
    }
    .offer-code-tag {
      background: rgba(0, 0, 0, 0.22);
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.6px;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px dashed rgba(255, 255, 255, 0.5);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .applied-tag {
      background: #E8F5E9;
      color: #1B5E20;
      font-size: 9.5px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      letter-spacing: 0.3px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    }

    /* Left text */
    .offer-heading {
      font-family: 'Outfit', sans-serif;
      font-size: 14.5px;
      font-weight: 800;
      color: #fff;
      line-height: 1.25;
      margin: 0 0 3px;
      letter-spacing: -0.2px;
      white-space: normal;
      word-break: break-word;
    }
    .offer-sub {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.86);
      font-weight: 400;
      line-height: 1.3;
      margin: 0;
    }

    /* Right pink/green pill */
    .offer-pill {
      position: relative;
      background: linear-gradient(135deg, #FF6B9D 0%, #FF136F 100%);
      border-radius: 12px;
      padding: 7px 11px;
      min-width: 76px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(255, 19, 111, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.35);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .offer-pill.claimed {
      background: linear-gradient(135deg, #00E676 0%, #00B04A 100%);
      box-shadow: 0 4px 14px rgba(0, 176, 74, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.45);
      animation: popPill 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popPill {
      0% { transform: scale(0.92); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    .pill-glare {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 50%;
      border-radius: 12px 12px 0 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.38) 0%, transparent 100%);
      pointer-events: none;
    }
    .pill-label {
      font-family: 'Outfit', sans-serif;
      font-size: 8px;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.95);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      line-height: 1;
      margin-bottom: 2px;
      position: relative;
      z-index: 1;
    }
    .pill-amount {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #fff;
      line-height: 1.15;
      letter-spacing: -0.2px;
      white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      position: relative;
      z-index: 1;
    }

    /* Offer Skeleton Shimmer Styles */
    .offer-skel-body {
      background: linear-gradient(105deg, #184e27 0%, #1e5f32 40%, #25753e 72%, #2c8c4a 100%);
      padding: 14px 16px;
      border-radius: 16px;
      min-height: 86px;
      box-sizing: border-box;
      box-shadow: 0 4px 14px rgba(10, 74, 28, 0.15);
      overflow: hidden;
    }
    .offer-skel-badge-strip {
      display: flex;
      margin-bottom: 7px;
    }
    .skel-pill-code {
      width: 78px;
      height: 18px;
      border-radius: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 75%);
      background-size: 200% 100%;
      animation: skelShimmer 1.4s infinite;
    }
    .skel-offer-heading {
      width: 75%;
      max-width: 210px;
      height: 16px;
      border-radius: 4px;
      background: linear-gradient(90deg, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.36) 50%, rgba(255,255,255,0.18) 75%);
      background-size: 200% 100%;
      animation: skelShimmer 1.4s infinite;
      margin-bottom: 7px;
    }
    .skel-offer-sub {
      width: 90%;
      max-width: 240px;
      height: 12px;
      border-radius: 4px;
      background: linear-gradient(90deg, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.12) 75%);
      background-size: 200% 100%;
      animation: skelShimmer 1.4s infinite;
    }
    .skel-offer-cta {
      width: 76px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(90deg, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.18) 75%);
      background-size: 200% 100%;
      animation: skelShimmer 1.4s infinite;
      border: 1px solid rgba(255,255,255,0.18);
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

    /* Skeleton Loading Shimmer */
    .category-skel-item { display: flex; flex-direction: column; align-items: center; }
    .cat-skel-circle {
      width: 62px; height: 62px; border-radius: 50%;
      background: linear-gradient(90deg, #E6E6E6 25%, #F5F5F5 50%, #E6E6E6 75%);
      background-size: 200% 100%;
      animation: skelShimmer 1.4s infinite;
    }
    .cat-skel-text {
      width: 44px; height: 10px; border-radius: 4px; margin-top: 6px;
      background: linear-gradient(90deg, #E6E6E6 25%, #F5F5F5 50%, #E6E6E6 75%);
      background-size: 200% 100%;
      animation: skelShimmer 1.4s infinite;
    }
    .home-skel-card {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; flex-direction: column;
    }
    .h-skel-img {
      height: 120px;
      background: linear-gradient(90deg, #EAEAEA 25%, #F8F8F8 50%, #EAEAEA 75%);
      background-size: 200% 100%;
      animation: skelShimmer 1.4s infinite;
    }
    .h-skel-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .h-skel-line {
      height: 11px; border-radius: 4px;
      background: linear-gradient(90deg, #EAEAEA 25%, #F8F8F8 50%, #EAEAEA 75%);
      background-size: 200% 100%;
      animation: skelShimmer 1.4s infinite;
      &.short { width: 45%; }
      &.wide { width: 85%; }
      &.med { width: 60%; }
    }
    @keyframes skelShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

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
  authService = inject(AuthService);
  dataService = inject(DataService);
  private confettiService = inject(ConfettiService);
  private snackbarService = inject(SnackbarService);
  isLoading = signal(true);
  searchQuery = '';

  selectedCategory = signal<string>('all');

  constructor() {
    setTimeout(() => this.isLoading.set(false), 700);
  }

  activeOrders = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '').slice(-10);
    const uPhone = cleanPhone(user.phone);
    const uEmail = (user.email || '').trim().toLowerCase();
    
    return this.dataService.orders().filter(o => {
      const match = (o.userId && user.uid && o.userId === user.uid) ||
                    (uPhone && o.customerPhone && cleanPhone(o.customerPhone) === uPhone) ||
                    (uEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === uEmail);
      if (!match) return false;
      return o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'out-for-delivery';
    });
  });

  activeOrdersCount = computed(() => this.activeOrders().length);

  displayCategories = computed(() => {
    const list = this.dataService.categories().filter(c => c.status === 'active');
    if (list.length > 0) {
      return list.map(c => ({
        id: c.id,
        name: c.name,
        image: c.image || 'assets/images/mix-fruit-chaat.jpg'
      }));
    }
    return [
      { id: 'fruit-chaat', name: 'Fruit Chaat', image: 'assets/images/mix-fruit-chaat.jpg' },
      { id: 'sprouts', name: 'Sprouts', image: 'assets/images/masala-sprouts.jpg' },
      { id: 'juices', name: 'Juices', image: 'assets/images/fresh-juice.jpg' },
      { id: 'combo', name: 'Combos', image: 'assets/images/masala-sprouts.jpg' },
    ];
  });

  displayProducts = computed<Product[]>(() => {
    let list = this.productService.getAll();
    if (this.selectedCategory() !== 'all') {
      const catVal = this.selectedCategory().toLowerCase();
      list = list.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        return pCat === catVal || pCat.includes(catVal) || catVal.includes(pCat);
      });
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
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

  dynamicComboSlides = computed(() => {
    const list = this.dataService.comboCards().filter(c => c.status === 'active');
    if (list.length > 0) {
      return list.map((c, i) => ({
        id: c.id || (i + 1),
        tag: c.tag || 'SPECIAL DEAL',
        title: c.title,
        price: c.price,
        originalPrice: c.originalPrice,
        savings: (c.originalPrice ? c.originalPrice - c.price : 0),
        btnText: c.btnText || 'Order Combo',
        link: c.link || '/menu',
        image: c.image || 'assets/images/masala-sprouts.jpg',
        bg: c.bg || 'linear-gradient(125deg, #0A3D18 0%, #15662B 50%, #239441 100%)',
      }));
    }
    return this.comboSlides;
  });

  comboDisplaySlides = computed(() => {
    const slides = this.dynamicComboSlides();
    if (!slides.length) return [];
    return [
      ...slides.map(s => ({ ...s, uniqueKey: `combo-${s.id}` })),
      { ...slides[0], uniqueKey: 'combo-clone-first' }
    ];
  });

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

  isCouponApplied = computed(() => {
    const card = this.dataService.offerCard();
    const activeCode = (card.code || 'FRUIT50').trim().toUpperCase();
    const applied = this.cartService.appliedCoupon();
    return applied?.code?.toUpperCase() === activeCode;
  });

  copyOfferCode(e: MouseEvent | TouchEvent | Event): void {
    e.stopPropagation();
    const card = this.dataService.offerCard();
    const code = (card.code || 'FRUIT50').toUpperCase();

    try {
      navigator.clipboard?.writeText(code);
    } catch (_) {}

    // Pre-apply to cart so user has it ready for this order
    this.cartService.applyCoupon({
      code,
      discount: card.amount || 50,
      minOrderAmount: card.minOrderAmount || 99
    });

    // Launch celebratory confetti burst!
    let clientX = typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
    let clientY = typeof window !== 'undefined' ? window.innerHeight * 0.35 : 200;
    if ('clientX' in e && typeof e.clientX === 'number' && e.clientX > 0) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (typeof window !== 'undefined') {
      this.confettiService.launch({
        x: clientX / window.innerWidth,
        y: clientY / window.innerHeight
      });
    }

    this.offerCopied.set(true);
    this.snackbarService.show(`🎉 Coupon "${code}" copied & applied! ₹${card.amount || 50} OFF in cart`, 'success', 3500);

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
    const total = this.dynamicComboSlides().length;
    if (!total) return;
    if (this.comboIndex() >= total) {
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
    const total = this.dynamicComboSlides().length;
    if (total && this.comboIndex() >= total) {
      this.comboTransition.set(false);
      this.comboIndex.set(0);
      setTimeout(() => {
        this.comboTransition.set(true);
      }, 40);
    }
  }

  goToCombo(i: number): void {
    const total = this.dynamicComboSlides().length;
    if (!total) return;
    if (this.comboTimer) clearInterval(this.comboTimer);
    if (this.comboIndex() >= total) {
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

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Food is being prepared';
      case 'out-for-delivery': return 'Rider is on the way';
      default: return 'Order In Progress';
    }
  }

  getProgressPercent(status: string): number {
    switch (status) {
      case 'pending': return 10;
      case 'confirmed': return 35;
      case 'preparing': return 65;
      case 'out-for-delivery': return 95;
      case 'delivered': return 100;
      default: return 0;
    }
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
