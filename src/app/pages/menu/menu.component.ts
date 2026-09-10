import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  template: `
    <div class="menu-page">
      <!-- STICKY HEADER (Swiggy / Zomato Style) -->
      <div class="menu-header">
        <div class="container">
          <!-- Top Row: Back button, Title & Info, Cart button -->
          <div class="header-top-row">
            <a routerLink="/" class="back-btn" title="Back to Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </a>
            <div class="header-title-wrap">
              <h1 class="menu-title">Our Menu</h1>
            </div>
            <a routerLink="/cart" class="header-cart-btn">
              <div class="cart-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                @if (cartService.totalItems() > 0) {
                  <span class="cart-badge">{{ cartService.totalItems() }}</span>
                }
              </div>
            </a>
          </div>

          <!-- Search Bar -->
          <div class="menu-search-bar">
            <svg class="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search dishes, fruits, sprouts..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()">
            @if (searchQuery) {
              <button class="clear-btn" (click)="clearSearch()">✕</button>
            }
          </div>
        </div>

        <!-- Filter Chips integrated into the header -->
        <div class="filter-strip">
          <div class="container">
            <div class="chip-filter">
              @for (cat of categories; track cat.id) {
                <button class="chip" [class.active]="activeCategory() === cat.id" (click)="setCategory(cat.id)">
                  <span>{{ cat.emoji }}</span> {{ cat.label }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUCT LIST -->
      <div class="container product-list-section">
        @if (filteredProducts().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No items found</h3>
            <p>Try a different search or category</p>
          </div>
        } @else {
          <p class="result-count">{{ filteredProducts().length }} items</p>
          <div class="product-list">
            @for (product of filteredProducts(); track product.id; let i = $index) {
              <div [style.animation-delay]="(i * 0.06) + 's'" class="list-item-wrap animate-fadeInUp">
                <app-product-card [product]="product" mode="list"></app-product-card>
              </div>
            }
          </div>
        }
      </div>

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
    .menu-page { background: #F8F9FA; min-height: 100vh; }

    .menu-header {
      background: #fff;
      padding: 12px 0 0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid #EFEFEF;

      @media (min-width: 768px) { top: 72px; }
    }

    .header-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .back-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F4F4F5;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .back-btn:active { background: #E4E4E7; transform: scale(0.95); }

    .header-title-wrap {
      flex: 1;
      min-width: 0;
    }

    .menu-title {
      font-size: 17px;
      font-weight: 800;
      color: #1A1A1A;
      line-height: 1.15;
      margin: 0;
      letter-spacing: -0.3px;
    }

    .menu-subtitle {
      font-size: 10px;
      font-weight: 600;
      color: #2E7D32;
      display: block;
      margin-top: 2px;
      letter-spacing: 0.1px;
    }

    .header-cart-btn {
      text-decoration: none;
      flex-shrink: 0;
    }

    .cart-icon-box {
      position: relative;
      width: 36px;
      height: 36px;
      background: #F1F8E9;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .cart-icon-box:active { background: #DCEDC8; transform: scale(0.95); }

    .cart-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #FF6B35;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(255,107,53,0.4);
    }

    /* SEARCH BAR (Zomato / Swiggy search box) */
    .menu-search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #F4F5F7;
      border-radius: 12px;
      padding: 9px 14px;
      border: 1.5px solid #E5E7EB;
      transition: all 0.25s;
      margin-bottom: 10px;
    }
    .menu-search-bar:focus-within {
      border-color: #2E7D32;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(46,125,50,0.12);
    }
    .menu-search-bar .search-icon {
      flex-shrink: 0;
    }
    .menu-search-bar input {
      flex: 1;
      border: none;
      outline: none;
      font-family: inherit;
      font-size: 13px;
      color: #1A1A1A;
      background: transparent;
    }
    .menu-search-bar input::placeholder { color: #9CA3AF; }
    .menu-search-bar .clear-btn {
      background: #E5E7EB;
      border: none;
      color: #6B7280;
      font-size: 10px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
    }
    .menu-search-bar .clear-btn:hover { background: #D1D5DB; color: #111; }

    /* FILTER STRIP */
    .filter-strip {
      background: #fff;
      padding-bottom: 10px;
      border-top: 1px solid #F3F4F6;
      padding-top: 9px;
    }

    .chip-filter {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .chip-filter::-webkit-scrollbar { display: none; }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
      border: 1.5px solid #E5E7EB;
      background: #fff;
      color: #4B5563;
      font-family: inherit;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .chip.active {
      background: #2E7D32;
      color: #fff;
      border-color: #2E7D32;
      box-shadow: 0 3px 10px rgba(46,125,50,0.25);
    }
    .chip:hover:not(.active) {
      border-color: #4CAF50;
      color: #2E7D32;
    }

    .product-list-section { padding-top: 20px; padding-bottom: 32px; }

    .result-count { font-size: 13px; color: #999; margin-bottom: 12px; }

    .product-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .list-item-wrap { animation: fadeInUp 0.4s ease both; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
      .empty-icon { font-size: 56px; margin-bottom: 16px; }
      h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
      p { color: #999; font-size: 14px; }
    }

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
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      box-shadow: 0 8px 32px rgba(46,125,50,0.4);
      z-index: 500;
      transition: transform 0.2s;
      &:hover { transform: translateX(-50%) translateY(-2px); }
      .fc-count { font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 999px; }
      .fc-label { font-size: 15px; font-weight: 700; }
      .fc-price { font-size: 15px; font-weight: 700; }

      @media (min-width: 768px) { bottom: 20px; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class MenuComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  cartService = inject(CartService);

  activeCategory = signal<string>('all');
  searchQuery = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.activeCategory.set(params['category']);
      }
    });
  }

  categories = [
    { id: 'all', label: 'All', emoji: '🍽️' },
    { id: 'fruit-chaat', label: 'Fruit Chaat', emoji: '🍎' },
    { id: 'sprouts', label: 'Sprouts', emoji: '🌱' },
    { id: 'juices', label: 'Juices', emoji: '🥤' },
    { id: 'combo', label: 'Combos', emoji: '🥗' },
  ];

  filteredProducts = computed<Product[]>(() => {
    let products = this.productService.getByCategory(this.activeCategory());
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return products;
  });

  setCategory(id: string): void {
    this.activeCategory.set(id);
  }

  onSearch(): void {
    // computed automatically updates
  }

  clearSearch(): void {
    this.searchQuery = '';
  }
}
