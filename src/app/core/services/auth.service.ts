import { Injectable, inject, signal, computed } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { User, AddressOption } from '../models/user.model';

const STORAGE_KEY = 'fc_user';

export const DEFAULT_ADDRESS: AddressOption = {
  id: 'default_addr',
  icon: '🏠',
  label: 'Home',
  detail: 'Sector 15, City Center',
  fullAddress: 'Flat 402, Green Valley Apartments, Sector 15',
  lat: 22.7196,
  lng: 75.8577,
  isDefault: true
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firestore = inject(Firestore);

  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());

  private _activeAddress = signal<AddressOption>(DEFAULT_ADDRESS);
  readonly activeAddress = this._activeAddress.asReadonly();

  // Modal display signals
  readonly showAuthModal = signal<boolean>(false);
  readonly showMapPicker = signal<boolean>(false);

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const user: User = JSON.parse(saved);
        this._currentUser.set(user);
        if (user.activeAddress) {
          this._activeAddress.set(user.activeAddress);
        } else if (user.addresses && user.addresses.length > 0) {
          this._activeAddress.set(user.addresses[0]);
        }
      }
    } catch (e) {
      console.error('Failed to restore user session:', e);
    }
  }

  private saveSession(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      this._currentUser.set(user);
      if (user.activeAddress) {
        this._activeAddress.set(user.activeAddress);
      }
    } catch (e) {
      console.error('Failed to save user session:', e);
    }
  }

  openAuthModal(): void {
    this.showAuthModal.set(true);
  }

  closeAuthModal(): void {
    this.showAuthModal.set(false);
  }

  openMapPicker(): void {
    this.showMapPicker.set(true);
  }

  closeMapPicker(): void {
    this.showMapPicker.set(false);
  }

  /**
   * Check if a user with the given phone number exists in Firestore
   */
  async checkUser(phone: string): Promise<User | null> {
    const cleanPhone = phone.trim();
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('phone', '==', cleanPhone));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data() as User;
      return { ...docData, uid: snapshot.docs[0].id };
    }
    return null;
  }

  /**
   * Login with phone and 4-digit PIN
   */
  async loginWithPin(phone: string, pin: string): Promise<User> {
    const user = await this.checkUser(phone);
    if (!user) {
      throw new Error('User not found. Please register first.');
    }
    if (user.pin !== pin) {
      throw new Error('Incorrect 4-digit PIN. Please try again.');
    }

    this.saveSession(user);
    return user;
  }

  /**
   * Register a new user with Name, Phone, 4-digit PIN, and Location Address
   */
  async registerUser(data: {
    phone: string;
    name: string;
    pin: string;
    address: AddressOption;
  }): Promise<User> {
    const existing = await this.checkUser(data.phone);
    if (existing) {
      throw new Error('An account with this phone number already exists.');
    }

    const uid = 'user_' + Date.now();
    const newUser: User = {
      uid,
      phone: data.phone.trim(),
      name: data.name.trim(),
      pin: data.pin.trim(),
      addresses: [data.address],
      activeAddress: data.address,
      createdAt: new Date().toISOString(),
      role: 'user'
    };

    const userDocRef = doc(this.firestore, 'users', uid);
    await setDoc(userDocRef, newUser);

    this.saveSession(newUser);
    return newUser;
  }

  /**
   * Change current active address (e.g., via Home header or map picker)
   */
  async setActiveAddress(address: AddressOption): Promise<void> {
    this._activeAddress.set(address);
    const user = this._currentUser();
    if (user) {
      const updatedUser: User = {
        ...user,
        activeAddress: address
      };
      this.saveSession(updatedUser);

      // Persist to Firestore if user doc exists
      try {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        await updateDoc(userDocRef, { activeAddress: address });
      } catch (err) {
        console.warn('Could not sync active address to Firestore:', err);
      }
    }
  }

  /**
   * Save a new address to user's profile and make it active
   */
  async addAddress(address: AddressOption): Promise<void> {
    this._activeAddress.set(address);
    const user = this._currentUser();
    if (user) {
      const exists = user.addresses.some(a => a.id === address.id || a.fullAddress === address.fullAddress);
      const addresses = exists ? user.addresses : [...user.addresses, address];
      const updatedUser: User = {
        ...user,
        addresses,
        activeAddress: address
      };
      this.saveSession(updatedUser);

      try {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        await updateDoc(userDocRef, { addresses, activeAddress: address });
      } catch (err) {
        console.warn('Could not sync addresses to Firestore:', err);
      }
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._currentUser.set(null);
    this._activeAddress.set(DEFAULT_ADDRESS);
  }
}
