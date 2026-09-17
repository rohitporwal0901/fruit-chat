import { Injectable, inject, computed } from '@angular/core';
import { Product, PRODUCTS } from '../models/product.model';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private dataService = inject(DataService);

  // Live products computed from Firestore DataService
  products = computed<Product[]>(() => {
    const adminList = this.dataService.products().filter(p => p.status === 'active');
    if (adminList.length > 0) {
      return adminList.map(ap => ({
        id: ap.id,
        name: ap.name,
        description: ap.description || '',
        price: ap.price,
        originalPrice: ap.originalPrice,
        image: (ap.images && ap.images.length > 0 && ap.images[0]) ? ap.images[0] : 'assets/images/mix-fruit-chaat.jpg',
        category: ap.categoryId as any,
        rating: 4.8,
        ratingCount: 124,
        isVeg: ap.isVeg !== false,
        isBestseller: !!ap.isBestseller,
        preparationTime: ap.preparationTime || 10,
        calories: ap.calories || 120,
        customizations: ap.customizations?.map(c => ({ id: c.id, name: c.name, extraPrice: c.extraPrice })) || []
      }));
    }
    return PRODUCTS; // Fallback to starter products if database has no products yet
  });

  getAll(): Product[] {
    return this.products();
  }

  getByCategory(category: string): Product[] {
    if (category === 'all') return this.products();
    return this.products().filter(p => p.category === category);
  }

  getById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  getPopular(): Product[] {
    return this.products().filter(p => p.isBestseller);
  }

  search(query: string): Product[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
}
