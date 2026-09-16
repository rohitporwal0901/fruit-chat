import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AdminOrder } from '../../core/models/admin.model';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent {
  dataService = inject(DataService);
  snackbar = inject(SnackbarService);

  statusFilter = signal('all');
  selectedOrder = signal<AdminOrder | null>(null);
  isUpdating = signal<string | null>(null);

  filteredOrders = computed(() => {
    const f = this.statusFilter();
    const orders = this.dataService.orders();
    return f === 'all' ? orders : orders.filter(o => o.status === f);
  });

  orderStatuses: AdminOrder['status'][] = ['pending','confirmed','preparing','out-for-delivery','delivered','cancelled'];

  setFilter(f: string) { this.statusFilter.set(f); }

  viewOrder(o: AdminOrder) { this.selectedOrder.set(o); }
  closeDetail() { this.selectedOrder.set(null); }

  async updateStatus(orderId: string, status: AdminOrder['status']) {
    this.isUpdating.set(orderId);
    try {
      await this.dataService.updateOrderStatus(orderId, status);
      this.snackbar.show(`Order marked as ${status}`, 'success');
      if (this.selectedOrder()?.id === orderId) {
        const updated = this.dataService.orders().find(o => o.id === orderId);
        this.selectedOrder.set(updated || null);
      }
    } catch { this.snackbar.show('Failed to update status', 'error'); }
    finally { this.isUpdating.set(null); }
  }

  getStatusClass(s: string) {
    const map: any = { pending:'status-pending', confirmed:'status-confirmed', preparing:'status-preparing', 'out-for-delivery':'status-delivery', delivered:'status-delivered', cancelled:'status-cancelled' };
    return map[s] || '';
  }

  statusCounts = computed(() => {
    const orders = this.dataService.orders();
    const c: any = { all: orders.length };
    this.orderStatuses.forEach(s => c[s] = orders.filter(o => o.status === s).length);
    return c;
  });
}
