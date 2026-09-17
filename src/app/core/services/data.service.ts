import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  getDoc,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from '@angular/fire/firestore';
import { AdminProduct, Category, AdminOrder, Transaction, HomeSlide, OfferCard, ComboCard } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  firestore = inject(Firestore);

  // ── Signals (live Firestore data) ────────────────────────
  products   = signal<AdminProduct[]>([]);
  categories = signal<Category[]>([]);
  orders     = signal<AdminOrder[]>([]);
  transactions = signal<Transaction[]>([]);
  homeSlides = signal<HomeSlide[]>([]);
  comboCards = signal<ComboCard[]>([]);
  offerCard  = signal<OfferCard>({
    heading: 'Hurry, ₹50 Free Cash',
    subtext: 'Valid on food orders above ₹99',
    amount: 50,
    validText: 'Valid on orders above ₹99',
    isActive: true
  });

  constructor() {
    this.listenProducts();
    this.listenCategories();
    this.listenOrders();
    this.listenTransactions();
    this.listenHomeSlides();
    this.listenComboCards();
    this.listenOfferCard();
  }

  // ── Listeners ─────────────────────────────────────────────

  private listenProducts() {
    const ref = collection(this.firestore, 'fc_products');
    const q = query(ref, orderBy('createdAt', 'desc'));
    onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminProduct));
      this.products.set(data);
    }, (err) => {
      console.warn('Error listening products:', err);
    });
  }

  private listenCategories() {
    const ref = collection(this.firestore, 'fc_categories');
    onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      this.categories.set(data);
    }, (err) => {
      console.warn('Error listening categories:', err);
    });
  }

  private listenOrders() {
    const ref = collection(this.firestore, 'fc_orders');
    onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminOrder));
      data.sort((a, b) => {
        const timeA = new Date(a.placedAt || (a as any).createdAt || 0).getTime();
        const timeB = new Date(b.placedAt || (b as any).createdAt || 0).getTime();
        return timeB - timeA;
      });
      this.orders.set(data);
    }, (err) => {
      console.warn('Error listening orders:', err);
    });
  }

  private listenTransactions() {
    const ref = collection(this.firestore, 'fc_transactions');
    onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      data.sort((a, b) => {
        const timeA = new Date(a.date || (a as any).createdAt || 0).getTime();
        const timeB = new Date(b.date || (b as any).createdAt || 0).getTime();
        return timeB - timeA;
      });
      this.transactions.set(data);
    }, (err) => {
      console.warn('Error listening transactions:', err);
    });
  }

  private listenHomeSlides() {
    const ref = collection(this.firestore, 'fc_home_slides');
    const q = query(ref, orderBy('order', 'asc'));
    onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomeSlide));
      this.homeSlides.set(data);
    }, (err) => {
      console.warn('Error listening home slides:', err);
    });
  }

  private listenComboCards() {
    const ref = collection(this.firestore, 'fc_combo_cards');
    const q = query(ref, orderBy('order', 'asc'));
    onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ComboCard));
      this.comboCards.set(data);
    }, (err) => {
      console.warn('Error listening combo cards:', err);
    });
  }

  private listenOfferCard() {
    const ref = doc(this.firestore, 'fc_settings', 'offerCard');
    onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        this.offerCard.set(snap.data() as OfferCard);
      }
    }, (err) => {
      console.warn('Error listening offer card:', err);
    });
  }

  // ── Products CRUD ──────────────────────────────────────────

  async addProduct(product: Omit<AdminProduct, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'fc_products');
    await addDoc(ref, { ...product, createdAt: new Date().toISOString() });
  }

  async updateProduct(id: string, data: Partial<AdminProduct>): Promise<void> {
    const ref = doc(this.firestore, 'fc_products', id);
    await updateDoc(ref, data as any);
  }

  async deleteProduct(id: string): Promise<void> {
    const ref = doc(this.firestore, 'fc_products', id);
    await deleteDoc(ref);
  }

  // ── Categories CRUD ────────────────────────────────────────

  async addCategory(category: Omit<Category, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'fc_categories');
    await addDoc(ref, { ...category, createdAt: new Date().toISOString() });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    const ref = doc(this.firestore, 'fc_categories', id);
    await updateDoc(ref, data as any);
  }

  async deleteCategory(id: string): Promise<void> {
    const ref = doc(this.firestore, 'fc_categories', id);
    await deleteDoc(ref);
  }

  // ── Orders ─────────────────────────────────────────────────

  async addOrder(order: Omit<AdminOrder, 'id'>): Promise<string> {
    const ref = collection(this.firestore, 'fc_orders');
    const docRef = await addDoc(ref, order);
    return docRef.id;
  }

  async updateOrderStatus(id: string, status: AdminOrder['status'], reason?: string): Promise<void> {
    const ref = doc(this.firestore, 'fc_orders', id);
    const data: any = { status };
    if (reason) data.cancellationReason = reason;
    await updateDoc(ref, data);
  }

  // ── Transactions ───────────────────────────────────────────

  async addTransaction(txn: Omit<Transaction, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'fc_transactions');
    await addDoc(ref, txn);
  }

  // ── Home Slides ────────────────────────────────────

  async addHomeSlide(slide: Omit<HomeSlide, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'fc_home_slides');
    await addDoc(ref, slide);
  }

  async updateHomeSlide(id: string, data: Partial<HomeSlide>): Promise<void> {
    const ref = doc(this.firestore, 'fc_home_slides', id);
    await updateDoc(ref, data as any);
  }

  async deleteHomeSlide(id: string): Promise<void> {
    const ref = doc(this.firestore, 'fc_home_slides', id);
    await deleteDoc(ref);
  }

  // ── Offer Card ─────────────────────────────────────────────

  async updateOfferCard(data: Partial<OfferCard>): Promise<void> {
    const ref = doc(this.firestore, 'fc_settings', 'offerCard');
    await setDoc(ref, data, { merge: true });
  }

  // ── Combo Cards ────────────────────────────────────────────

  async addComboCard(combo: Omit<ComboCard, 'id'>): Promise<void> {
    const ref = collection(this.firestore, 'fc_combo_cards');
    await addDoc(ref, { ...combo, createdAt: new Date().toISOString() });
  }

  async updateComboCard(id: string, data: Partial<ComboCard>): Promise<void> {
    const ref = doc(this.firestore, 'fc_combo_cards', id);
    await updateDoc(ref, data as any);
  }

  async deleteComboCard(id: string): Promise<void> {
    const ref = doc(this.firestore, 'fc_combo_cards', id);
    await deleteDoc(ref);
  }

  // ── Helpers ────────────────────────────────────────────────

  getCategoryName(id: string): string {
    return this.categories().find(c => c.id === id)?.name ?? 'Unknown';
  }

  getActiveProducts(): AdminProduct[] {
    return this.products().filter(p => p.status === 'active');
  }
}
