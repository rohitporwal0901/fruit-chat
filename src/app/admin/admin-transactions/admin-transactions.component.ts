import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';

export interface DisplayTransaction {
  id: string;
  orderId: string;
  displayOrderId: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  amount: number;
  date: string;
  status: string;
  statusClass: string;
}

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="at-header">
      <div>
        <h1 class="at-title">Transactions</h1>
        <p class="at-sub">All payment transactions and order settlements</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="at-summary">
      <div class="at-summary-card">
        <div class="at-s-icon green"><span class="material-symbols-outlined">payments</span></div>
        <div>
          <div class="at-s-value">
            @if (isLoading()) { <span class="calc-dots">•••</span> } @else { ₹{{ totalRevenue() | number:'1.0-0' }} }
          </div>
          <div class="at-s-label">Total Revenue</div>
        </div>
      </div>
      <div class="at-summary-card">
        <div class="at-s-icon teal"><span class="material-symbols-outlined">receipt_long</span></div>
        <div>
          <div class="at-s-value">
            @if (isLoading()) { <span class="calc-dots">•••</span> } @else { {{ filteredTransactions().length }} }
          </div>
          <div class="at-s-label">Total Transactions</div>
        </div>
      </div>
      <div class="at-summary-card">
        <div class="at-s-icon orange"><span class="material-symbols-outlined">trending_up</span></div>
        <div>
          <div class="at-s-value">
            @if (isLoading()) { <span class="calc-dots">•••</span> } @else { ₹{{ avgOrderValue() | number:'1.0-0' }} }
          </div>
          <div class="at-s-label">Avg Order Value</div>
        </div>
      </div>
    </div>

    <!-- Date Filter -->
    <div class="at-filter-row">
      <div class="at-filter-tabs">
        <button
          *ngFor="let f of filters"
          [class.active]="dateFilter() === f.key"
          (click)="setFilter(f.key)"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="at-table-wrap">
      @if (isLoading()) {
        <div class="at-loading-state">
          <div class="spinner-ring"></div>
          <p class="loading-text">Filtering transactions...</p>
        </div>
      } @else {
        <div class="at-empty" *ngIf="filteredTransactions().length === 0">
          <span class="material-symbols-outlined">receipt_long</span>
          <p>No transactions found for this period</p>
        </div>
        <table class="at-table" *ngIf="filteredTransactions().length > 0">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Date & Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let txn of filteredTransactions()">
              <td><span class="at-order-id">#{{ txn.displayOrderId }}</span></td>
              <td><span class="at-name">{{ txn.customerName }}</span></td>
              <td><span class="at-phone">{{ txn.customerPhone }}</span></td>
              <td><span class="at-payment">{{ txn.paymentMethod }}</span></td>
              <td><span class="at-amount">₹{{ txn.amount }}</span></td>
              <td><span class="at-date">{{ txn.date | date:'dd MMM yyyy, hh:mm a' }}</span></td>
              <td><span class="at-status" [ngClass]="txn.statusClass">{{ txn.status }}</span></td>
            </tr>
          </tbody>
        </table>
      }
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
    .at-s-value { font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:800; color:#1a1a1a; min-height: 36px; display: flex; align-items: center; }
    .at-s-label { font-size:0.78rem; color:#888; font-weight:500; margin-top:2px; }

    .calc-dots { color: #A5D6A7; font-size: 1.2rem; letter-spacing: 3px; animation: pulseDots 1s infinite alternate; }
    @keyframes pulseDots { from { opacity: 0.3; } to { opacity: 1; } }

    .at-filter-row { margin-bottom:1rem; }
    .at-filter-tabs { display:flex; gap:0.4rem; flex-wrap:wrap; }
    .at-filter-tabs button { padding:0.45rem 1rem; border-radius:8px; border:1px solid #e0e0e0; background:#f5f5f5; color:#555; font-size:0.82rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; }
    .at-filter-tabs button:hover { background: #EEE; }
    .at-filter-tabs button.active { background:#2E7D32; color:#fff; border-color:#2E7D32; box-shadow: 0 2px 6px rgba(46,125,50,0.3); }

    .at-table-wrap { background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #f0f0f0; overflow:hidden; min-height: 220px; }
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
    .at-status.success   { background:#E8F5E9; color:#2E7D32; }
    .at-status.pending   { background:#FFF8E1; color:#F57F17; }
    .at-status.failed    { background:#FFEBEE; color:#C62828; }

    /* LOADING 2 SECONDS SPINNER */
    .at-loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4.5rem 2rem;
      gap: 14px;
    }
    .spinner-ring {
      width: 40px;
      height: 40px;
      border: 3.5px solid #E8F5E9;
      border-top-color: #2E7D32;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-text {
      color: #666;
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
      font-family: 'Outfit', sans-serif;
    }

    @media(max-width:768px) { .at-summary { grid-template-columns:1fr; } }
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
  `]
})
export class AdminTransactionsComponent {
  dataService = inject(DataService);
  dateFilter = signal('all');
  isLoading = signal<boolean>(false);
  private loadingTimeout: any = null;

  filters = [
    { key:'all', label:'All Time' },
    { key:'today', label:'Today' },
    { key:'this_week', label:'This Week' },
    { key:'this_month', label:'This Month' }
  ];

  setFilter(key: string) {
    if (this.dateFilter() === key && !this.isLoading()) return;
    this.dateFilter.set(key);
    this.isLoading.set(true);

    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.loadingTimeout = setTimeout(() => {
      this.isLoading.set(false);
    }, 2000);
  }

  // Combines direct Firestore transactions and placed orders to guarantee complete data fetching
  allTransactions = computed<DisplayTransaction[]>(() => {
    const rawTxns = this.dataService.transactions();
    const orders = this.dataService.orders();

    const result: DisplayTransaction[] = [];
    const seenOrderIds = new Set<string>();

    // 1. Direct transactions from fc_transactions
    for (const t of rawTxns) {
      if (t.orderId) seenOrderIds.add(t.orderId);
      result.push({
        id: t.id,
        orderId: t.orderId || t.id,
        displayOrderId: t.orderId ? (t.orderId.length > 8 ? t.orderId.slice(-6).toUpperCase() : t.orderId) : t.id.slice(-6).toUpperCase(),
        customerName: t.customerName || 'Customer',
        customerPhone: t.customerPhone || '-',
        paymentMethod: t.paymentMethod || 'Online (UPI)',
        amount: t.amount || 0,
        date: t.date || new Date().toISOString(),
        status: t.status === 'success' ? 'Success' : (t.status === 'failed' ? 'Failed' : 'Pending'),
        statusClass: t.status === 'success' ? 'success' : (t.status === 'failed' ? 'failed' : 'pending')
      });
    }

    // 2. Orders from fc_orders not already recorded in fc_transactions
    for (const o of orders) {
      if (!seenOrderIds.has(o.id)) {
        const isPaid = o.paymentMethod !== 'COD' || o.status === 'delivered';
        result.push({
          id: 'ord_' + o.id,
          orderId: o.id,
          displayOrderId: o.id.length > 8 ? o.id.slice(-6).toUpperCase() : o.id,
          customerName: o.customerName || 'Customer',
          customerPhone: o.customerPhone || '-',
          paymentMethod: o.paymentMethod || 'Online',
          amount: o.grandTotal || 0,
          date: o.placedAt || new Date().toISOString(),
          status: o.status === 'delivered' ? 'Delivered' : (isPaid ? 'Success' : 'Pending'),
          statusClass: (o.status === 'delivered' || isPaid) ? 'delivered' : 'pending'
        });
      }
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  });

  filteredTransactions = computed(() => {
    const list = this.allTransactions();
    const f = this.dateFilter();
    if (f === 'all') return list;

    const now = new Date();

    return list.filter(t => {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return false;

      if (f === 'today') {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      }

      if (f === 'this_week') {
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay(); // 0 is Sunday
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        return d >= startOfWeek && d < endOfWeek;
      }

      if (f === 'this_month') {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      }

      return true;
    });
  });

  totalRevenue = computed(() =>
    this.filteredTransactions().reduce((s, t) => s + (t.amount || 0), 0)
  );

  avgOrderValue = computed(() => {
    const list = this.filteredTransactions();
    return list.length ? Math.round(this.totalRevenue() / list.length) : 0;
  });
}
