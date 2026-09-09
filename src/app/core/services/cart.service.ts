import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  items = this._items.asReadonly();

  totalItems = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  itemTotal = computed(() => this._items().reduce((sum, i) => sum + i.totalPrice, 0));
  deliveryCharge = computed(() => this._items().length > 0 ? 20 : 0);
  grandTotal = computed(() => this.itemTotal() + this.deliveryCharge());

  addToCart(product: Product, quantity: number = 1, customizations: string[] = []): void {
    const current = this._items();
    const existing = current.find(i => i.product.id === product.id);

    if (existing) {
      this._items.set(current.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity, totalPrice: (i.quantity + quantity) * i.product.price }
          : i
      ));
    } else {
      this._items.set([...current, {
        product,
        quantity,
        selectedCustomizations: customizations,
        totalPrice: quantity * product.price
      }]);
    }
  }

  updateQty(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._items.set(this._items().map(i =>
      i.product.id === productId
        ? { ...i, quantity, totalPrice: quantity * i.product.price }
        : i
    ));
  }

  removeFromCart(productId: string): void {
    this._items.set(this._items().filter(i => i.product.id !== productId));
  }

  getQty(productId: string): number {
    return this._items().find(i => i.product.id === productId)?.quantity ?? 0;
  }

  clearCart(): void {
    this._items.set([]);
  }
}
