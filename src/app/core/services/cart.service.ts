import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

export interface AppliedCoupon {
  code: string;
  discount: number;
  minOrderAmount: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  appliedCoupon = signal<AppliedCoupon | null>(null);

  items = this._items.asReadonly();

  totalItems = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  itemTotal = computed(() => this._items().reduce((sum, i) => sum + i.totalPrice, 0));
  deliveryCharge = computed(() => this._items().length > 0 ? 20 : 0);

  // Discount applies only when itemTotal meets the minOrderAmount
  discount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;
    const total = this.itemTotal();
    if (total < (coupon.minOrderAmount || 0)) {
      return 0;
    }
    return Math.min(total, coupon.discount);
  });

  grandTotal = computed(() =>
    Math.max(0, this.itemTotal() + this.deliveryCharge() - this.discount())
  );

  applyCoupon(coupon: AppliedCoupon): void {
    this.appliedCoupon.set(coupon);
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
  }

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
    if (this._items().length === 0) {
      this.appliedCoupon.set(null);
    }
  }

  getQty(productId: string): number {
    return this._items().find(i => i.product.id === productId)?.quantity ?? 0;
  }

  clearCart(): void {
    this._items.set([]);
    this.appliedCoupon.set(null);
  }
}
