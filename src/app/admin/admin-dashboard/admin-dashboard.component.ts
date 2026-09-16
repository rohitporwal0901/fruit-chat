import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  dataService = inject(DataService);

  isLoading = signal(true);
  revenueUnlocked = signal(false);
  showPinModal = signal(false);
  pinDigits = signal<string[]>([]);
  pinError = signal(false);
  pinSuccess = signal(false);
  private readonly CORRECT_PIN = '1234';

  revenueDateFilter = signal<string>('all');
  revenueFromDate = signal('');
  revenueToDate = signal('');

  ngOnInit() { setTimeout(() => this.isLoading.set(false), 1500); }

  // ── Stats ─────────────────────────────────────────────────
  totalProducts   = computed(() => this.dataService.products().length);
  totalCategories = computed(() => this.dataService.categories().length);
  pendingOrders   = computed(() => this.dataService.orders().filter(o => o.status === 'pending').length);
  activeProducts  = computed(() => this.dataService.products().filter(p => p.status === 'active').length);

  deliveredOrders = computed(() => this.dataService.orders().filter(o => o.status === 'delivered'));

  filteredRevOrders = computed(() => {
    let orders = this.deliveredOrders();
    const f = this.revenueDateFilter();
    if (f === 'all') return orders;
    const today = new Date(); today.setHours(0,0,0,0);
    if (f === 'today')     return orders.filter(o => new Date(o.placedAt) >= today);
    if (f === 'yesterday') {
      const yest = new Date(today); yest.setDate(yest.getDate()-1);
      return orders.filter(o => { const d = new Date(o.placedAt); return d >= yest && d < today; });
    }
    if (f === 'this_week') {
      const sw = new Date(today); sw.setDate(today.getDate()-today.getDay());
      return orders.filter(o => new Date(o.placedAt) >= sw);
    }
    if (f === 'this_month') {
      const sm = new Date(today.getFullYear(), today.getMonth(), 1);
      return orders.filter(o => new Date(o.placedAt) >= sm);
    }
    if (f === 'custom') {
      const from = this.revenueFromDate(), to = this.revenueToDate();
      if (from) orders = orders.filter(o => new Date(o.placedAt) >= new Date(from));
      if (to)   { const toD = new Date(to); toD.setHours(23,59,59,999); orders = orders.filter(o => new Date(o.placedAt) <= toD); }
    }
    return orders;
  });

  totalRevenue = computed(() => this.filteredRevOrders().reduce((s,o) => s + o.grandTotal, 0));

  // ── Top Selling ───────────────────────────────────────────
  topSellingItems = computed(() => {
    const map = new Map<string, { name: string; img: string; sold: number }>();
    for (const o of this.deliveredOrders()) {
      for (const item of o.items) {
        const ex = map.get(item.productId) ?? { name: item.productName, img: item.productImage||'', sold: 0 };
        map.set(item.productId, { ...ex, sold: ex.sold + item.quantity });
      }
    }
    return [...map.values()].sort((a,b) => b.sold - a.sold).slice(0,5);
  });

  // ── Recent Orders ─────────────────────────────────────────
  recentOrders = computed(() =>
    [...this.dataService.orders()]
      .sort((a,b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
      .slice(0,5)
  );

  // ── Low Stock ─────────────────────────────────────────────
  lowStockItems = computed(() => this.dataService.products().filter(p => p.stock < 10));

  // ── PIN ───────────────────────────────────────────────────
  openPinModal()  { this.pinDigits.set([]); this.pinError.set(false); this.showPinModal.set(true); }
  closePinModal() { this.showPinModal.set(false); this.pinDigits.set([]); this.pinError.set(false); }
  lockRevenue()   { this.revenueUnlocked.set(false); this.setFilter('all'); }

  pressPin(d: string) {
    if (this.pinDigits().length >= 4) return;
    const next = [...this.pinDigits(), d];
    this.pinDigits.set(next); this.pinError.set(false);
    if (next.length === 4) setTimeout(() => this.verifyPin(), 100);
  }
  backspacePin() { this.pinDigits.update(d => d.slice(0,-1)); this.pinError.set(false); }
  verifyPin() {
    if (this.pinDigits().join('') === this.CORRECT_PIN) {
      this.pinSuccess.set(true); this.revenueUnlocked.set(true);
      setTimeout(() => this.closePinModal(), 600);
    } else {
      this.pinError.set(true);
      setTimeout(() => { this.pinDigits.set([]); this.pinError.set(false); }, 900);
    }
  }

  setFilter(f: string) {
    this.revenueDateFilter.set(f);
    if (f !== 'custom') { this.revenueFromDate.set(''); this.revenueToDate.set(''); }
  }

  getStatusClass(status: string): string {
    const map: any = {
      'pending': 'status-pending', 'confirmed': 'status-confirmed',
      'preparing': 'status-preparing', 'out-for-delivery': 'status-delivery',
      'delivered': 'status-delivered', 'cancelled': 'status-cancelled'
    };
    return map[status] || '';
  }
}
