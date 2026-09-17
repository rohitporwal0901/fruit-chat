import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
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
  Timestamp
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
    (collectionData(q, { idField: 'id' }) as any).subscribe((data: AdminProduct[]) => {
      this.products.set(data);
    });
  }

  private listenCategories() {
    const ref = collection(this.firestore, 'fc_categories');
    (collectionData(ref, { idField: 'id' }) as any).subscribe((data: Category[]) => {
      this.categories.set(data);
    });
  }

  private listenOrders() {
    const ref = collection(this.firestore, 'fc_orders');
    const q = query(ref, orderBy('placedAt', 'desc'));
    (collectionData(q, { idField: 'id' }) as any).subscribe((data: AdminOrder[]) => {
      this.orders.set(data);
    });
  }

  private listenTransactions() {
    const ref = collection(this.firestore, 'fc_transactions');
    const q = query(ref, orderBy('date', 'desc'));
    (collectionData(q, { idField: 'id' }) as any).subscribe((data: Transaction[]) => {
      this.transactions.set(data);
    });
  }

  private listenHomeSlides() {
    const ref = collection(this.firestore, 'fc_home_slides');
    const q = query(ref, orderBy('order', 'asc'));
    (collectionData(q, { idField: 'id' }) as any).subscribe((data: HomeSlide[]) => {
      this.homeSlides.set(data);
    });
  }

  private listenComboCards() {
    const ref = collection(this.firestore, 'fc_combo_cards');
    const q = query(ref, orderBy('order', 'asc'));
    (collectionData(q, { idField: 'id' }) as any).subscribe((data: ComboCard[]) => {
      this.comboCards.set(data);
    });
  }

  private async listenOfferCard() {
    const ref = doc(this.firestore, 'fc_settings', 'offerCard');
    // Use snapshot listener
    const { onSnapshot } = await import('@angular/fire/firestore');
    onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        this.offerCard.set(snap.data() as OfferCard);
      }
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
