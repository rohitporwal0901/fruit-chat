export interface AddressOption {
  id: string;
  icon?: string;
  label: 'Home' | 'Work' | 'Other';
  detail: string;       // e.g. "Sector 15, City Center"
  fullAddress: string;  // e.g. "Flat 402, Green Valley Apartments, Sector 15, Indore"
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface User {
  uid: string;
  phone: string;
  name: string;
  pin: string;          // 4-digit security PIN
  email?: string;
  photoUrl?: string;    // Base64 or URL profile picture
  addresses: AddressOption[];
  activeAddress?: AddressOption;
  createdAt: string;
  role?: 'user' | 'admin';
  usedCoupons?: string[];
}
