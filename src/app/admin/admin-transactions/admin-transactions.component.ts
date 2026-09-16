import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="at-header">
      <div>
        <h1 class="at-title">Transactions</h1>
        <p class="at-sub">All payment transactions from delivered orders</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="at-summary">
      <div class="at-summary-card">
        <div class="at-s-icon green"><span class="material-symbols-outlined">payments</span></div>
        <div>
          <div class="at-s-value">₹{{ totalRevenue() | number:'1.0-0' }}</div>
          <div class="at-s-label">Total Revenue</div>
        </div>
      </div>
      <div class="at-summary-card">
        <div class="at-s-icon teal"><span class="material-symbols-outlined">receipt_long</span></div>
        <div>
          <div class="at-s-value">{{ deliveredOrders().length }}</div>
          <div class="at-s-label">Total Orders</div>
        </div>
      </div>
      <div class="at-summary-card">
        <div class="at-s-icon orange"><span class="material-symbols-outlined">trending_up</span></div>
        <div>
          <div class="at-s-value">₹{{ avgOrderValue() | number:'1.0-0' }}</div>
          <div class="at-s-label">Avg Order Value</div>
        </div>
      </div>
    </div>

    <!-- Date Filter -->
    <div class="at-filter-row">
      <div class="at-filter-tabs">
        <button *ngFor="let f of filters" [class.active]="dateFilter() === f.key" (click)="dateFilter.set(f.key)">{{ f.label }}</button>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="at-table-wrap">
      <div class="at-empty" *ngIf="filteredOrders().length === 0">
        <span class="material-symbols-outlined">receipt_long</span>
        <p>No transactions found</p>
      </div>
      <table class="at-table" *ngIf="filteredOrders().length > 0">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Payment</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let order of filteredOrders()">
            <td><span class="at-order-id">#{{ order.id.slice(-6).toUpperCase() }}</span></td>
            <td><span class="at-name">{{ order.customerName }}</span></td>
            <td><span class="at-phone">{{ order.customerPhone }}</span></td>
            <td><span class="at-payment">{{ order.paymentMethod || 'Online' }}</span></td>
            <td><span class="at-amount">₹{{ order.grandTotal }}</span></td>
            <td><span class="at-date">{{ order.placedAt | date:'dd MMM, yyyy' }}</span></td>
            <td><span class="at-status delivered">Delivered</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .at-header { margin-bottom:1.5rem; }
    .at-title { font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:800; color:#1a1a1a; margin:0; }
    .at-sub { color:#888; font-size:0.88rem; margin-top:0.2rem; }

    .at-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.25rem; }
    .at-summary-card { background:#fff; border-radius:16px; padding:1.25rem; display:flex; align-items:center; gap:1rem; box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f0f0f0; }
    .at-s-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; span{font-size:1.4rem !important;} }
    .at-s-icon.green { background:#E8F5E9; color:#2E7D32; }
    .at-s-icon.teal  { background:#E0F2F1; color:#00695C; }
    .at-s-icon.orange{ background:#FFF3E0; color:#E65100; }
    .at-s-value { font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:800; color:#1a1a1a; }
    .at-s-label { font-size:0.78rem; color:#888; font-weight:500; margin-top:2px; }

    .at-filter-row { margin-bottom:1rem; }
    .at-filter-tabs { display:flex; gap:0.4rem; flex-wrap:wrap; }
    .at-filter-tabs button { padding:0.4rem 0.9rem; border-radius:8px; border:1px solid #e0e0e0; background:#f5f5f5; color:#555; font-size:0.8rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; }
    .at-filter-tabs button.active { background:#2E7D32; color:#fff; border-color:#2E7D32; }

    .at-table-wrap { background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f0f0f0; overflow:hidden; }
    .at-empty { text-align:center; padding:3rem; span{font-size:2.5rem;color:#ddd;display:block;margin-bottom:0.5rem;} p{color:#bbb;font-size:0.88rem;} }
    .at-table { width:100%; border-collapse:collapse; }
    .at-table thead { background:#F8F9FA; }
    .at-table th { padding:0.85rem 1rem; text-align:left; font-size:0.72rem; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #eee; }
    .at-table td { padding:0.85rem 1rem; border-bottom:1px solid #F5F5F5; vertical-align:middle; }
    .at-table tbody tr:last-child td { border-bottom:none; }
    .at-table tbody tr:hover { background:#FAFAFA; }

    .at-order-id { font-size:0.78rem; font-weight:700; color:#999; font-family:monospace; background:#f5f5f5; padding:2px 6px; border-radius:4px; }
    .at-name { font-size:0.88rem; font-weight:600; color:#1a1a1a; }
    .at-phone { font-size:0.82rem; color:#666; }
    .at-payment { font-size:0.8rem; color:#555; background:#f5f5f5; padding:2px 8px; border-radius:6px; font-weight:500; }
    .at-amount { font-size:0.9rem; font-weight:800; color:#1a1a1a; }
    .at-date { font-size:0.8rem; color:#888; }
    .at-status { font-size:0.72rem; font-weight:700; text-transform:capitalize; padding:3px 10px; border-radius:20px; }
    .at-status.delivered { background:#E8F5E9; color:#2E7D32; }

    @media(max-width:768px) { .at-summary { grid-template-columns:1fr; } }
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
  `]
})
export class AdminTransactionsComponent {
  dataService = inject(DataService);
  dateFilter = signal('all');

  filters = [
    { key:'all', label:'All Time' },
    { key:'today', label:'Today' },
    { key:'this_week', label:'This Week' },
    { key:'this_month', label:'This Month' }
  ];

  deliveredOrders = computed(() => this.dataService.orders().filter(o => o.status === 'delivered'));

  filteredOrders = computed(() => {
    let orders = this.deliveredOrders();
    const f = this.dateFilter();
    if (f === 'all') return orders;
    const today = new Date(); today.setHours(0,0,0,0);
    if (f === 'today') return orders.filter(o => new Date(o.placedAt) >= today);
    if (f === 'this_week') {
      const sw = new Date(today); sw.setDate(today.getDate()-today.getDay());
      return orders.filter(o => new Date(o.placedAt) >= sw);
    }
    if (f === 'this_month') {
      const sm = new Date(today.getFullYear(), today.getMonth(), 1);
      return orders.filter(o => new Date(o.placedAt) >= sm);
    }
    return orders;
  });

  totalRevenue = computed(() => this.filteredOrders().reduce((s,o) => s + o.grandTotal, 0));
  avgOrderValue = computed(() => {
    const o = this.filteredOrders();
    return o.length ? this.totalRevenue() / o.length : 0;
  });
}
