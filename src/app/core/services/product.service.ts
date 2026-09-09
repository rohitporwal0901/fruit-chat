import { Injectable, signal } from '@angular/core';
import { Product, PRODUCTS } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _products = signal<Product[]>(PRODUCTS);
  products = this._products.asReadonly();

  getAll(): Product[] {
    return this._products();
  }

  getByCategory(category: string): Product[] {
    if (category === 'all') return this._products();
    return this._products().filter(p => p.category === category);
  }

  getById(id: string): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  getPopular(): Product[] {
    return this._products().filter(p => p.isBestseller);
  }

  search(query: string): Product[] {
    const q = query.toLowerCase();
    return this._products().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
}
