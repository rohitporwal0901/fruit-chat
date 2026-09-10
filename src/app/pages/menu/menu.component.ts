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
      <!-- STICKY HEADER -->
      <div class="menu-header">
        <div class="container">
          <h2 class="menu-title">Our Menu</h2>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search for items..." [(ngModel)]="searchQuery" (input)="onSearch()">
            @if (searchQuery) {
              <button class="clear-btn" (click)="clearSearch()">✕</button>
            }
          </div>
        </div>
      </div>

      <!-- FILTER CHIPS -->
      <div class="filter-wrap">
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
      padding: 20px 0 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 100;

      @media (min-width: 768px) { top: 72px; }
    }

    .menu-title {
      font-size: 20px;
      font-weight: 800;
      color: #1A1A1A;
      margin-bottom: 12px;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #F8F9FA;
      border-radius: 999px;
      padding: 10px 16px;
      border: 1.5px solid #EEE;
      transition: all 0.25s;
      &:focus-within { border-color: #4CAF50; background: #fff; box-shadow: 0 0 0 3px rgba(76,175,80,0.1); }
      .search-icon { font-size: 16px; }
      input { flex:1; border:none; outline:none; font-family:'Poppins',sans-serif; font-size:14px; color:#1A1A1A; background:transparent; &::placeholder{color:#bbb;} }
      .clear-btn { background:none; border:none; color:#999; font-size:14px; cursor:pointer; padding:0; }
    }

    .filter-wrap {
      background: #fff;
      padding: 12px 0 14px;
      border-bottom: 1px solid #EEE;
    }

    .chip-filter {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
      border: 1.5px solid #EEE;
      background: #fff;
      color: #666;
      font-family: 'Poppins', sans-serif;

      &.active {
        background: #2E7D32;
        color: #fff;
        border-color: #2E7D32;
        box-shadow: 0 4px 12px rgba(46,125,50,0.25);
      }

      &:hover:not(.active) {
        border-color: #4CAF50;
        color: #2E7D32;
      }
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
