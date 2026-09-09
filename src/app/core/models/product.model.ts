export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'fruit-chaat' | 'sprouts' | 'juices' | 'combo';
  rating: number;
  ratingCount: number;
  isVeg: boolean;
  isBestseller?: boolean;
  ingredients?: string[];
  customizations?: Customization[];
  preparationTime?: number;
  calories?: number;
}

export interface Customization {
  id: string;
  name: string;
  extraPrice: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCustomizations: string[];
  totalPrice: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  address: DeliveryAddress;
  paymentMethod: string;
  status: 'placed' | 'preparing' | 'out-for-delivery' | 'delivered';
  itemTotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  placedAt: Date;
  estimatedDelivery?: string;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Mix Fruit Chaat',
    description: 'A perfect blend of fresh seasonal fruits like apple, banana, papaya, pomegranate and special masala. Healthy, tasty and refreshing!',
    price: 80,
    originalPrice: 100,
    image: 'assets/images/mix-fruit-chaat.jpg',
    category: 'fruit-chaat',
    rating: 4.8,
    ratingCount: 256,
    isVeg: true,
    isBestseller: true,
    ingredients: ['Apple', 'Banana', 'Papaya', 'Pomegranate', 'Black Salt', 'Chaat Masala', 'Lemon'],
    customizations: [
      { id: 'c1', name: 'Extra Masala', extraPrice: 5 },
      { id: 'c2', name: 'No Salt', extraPrice: 0 },
      { id: 'c3', name: 'Add Lemon', extraPrice: 5 }
    ],
    preparationTime: 10,
    calories: 145
  },
  {
    id: '2',
    name: 'Masala Sprouts',
    description: 'Protein rich sprouts with fresh veggies & masala. A healthy and nutritious snack perfect for any time of the day.',
    price: 60,
    image: 'assets/images/masala-sprouts.jpg',
    category: 'sprouts',
    rating: 4.6,
    ratingCount: 189,
    isVeg: true,
    isBestseller: true,
    ingredients: ['Moong Sprouts', 'Onion', 'Tomato', 'Coriander', 'Chaat Masala', 'Lemon'],
    customizations: [
      { id: 'c4', name: 'Extra Sprouts', extraPrice: 10 },
      { id: 'c5', name: 'No Onion', extraPrice: 0 },
      { id: 'c6', name: 'Extra Spicy', extraPrice: 0 }
    ],
    preparationTime: 8,
    calories: 95
  },
  {
    id: '3',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice with no added sugar. Rich in Vitamin C and natural goodness.',
    price: 70,
    image: 'assets/images/fresh-juice.jpg',
    category: 'juices',
    rating: 4.7,
    ratingCount: 143,
    isVeg: true,
    customizations: [
      { id: 'c7', name: 'Extra Ice', extraPrice: 0 },
      { id: 'c8', name: 'Add Ginger', extraPrice: 5 },
      { id: 'c9', name: 'Add Mint', extraPrice: 5 }
    ],
    preparationTime: 5,
    calories: 112
  },
  {
    id: '4',
    name: 'Pineapple Chaat',
    description: 'Sweet & spicy pineapple mix with pomegranate seeds, fresh mint, red chilli and chaat masala.',
    price: 70,
    image: 'assets/images/pineapple-chaat.jpg',
    category: 'fruit-chaat',
    rating: 4.5,
    ratingCount: 98,
    isVeg: true,
    ingredients: ['Pineapple', 'Pomegranate', 'Mint', 'Red Chilli', 'Chaat Masala', 'Black Salt'],
    customizations: [
      { id: 'c10', name: 'Extra Spicy', extraPrice: 0 },
      { id: 'c11', name: 'Less Sweet', extraPrice: 0 }
    ],
    preparationTime: 8,
    calories: 130
  },
  {
    id: '5',
    name: 'Watermelon Chaat',
    description: 'Refreshing & healthy watermelon chaat with cucumber, mint leaves and a squeeze of lemon.',
    price: 60,
    image: 'assets/images/watermelon-chaat.jpg',
    category: 'fruit-chaat',
    rating: 4.4,
    ratingCount: 76,
    isVeg: true,
    ingredients: ['Watermelon', 'Cucumber', 'Mint', 'Lemon', 'Chaat Masala'],
    customizations: [
      { id: 'c12', name: 'Extra Mint', extraPrice: 0 },
      { id: 'c13', name: 'Add Jeera', extraPrice: 0 }
    ],
    preparationTime: 7,
    calories: 85
  },
  {
    id: '6',
    name: 'Boiled Sprouts',
    description: 'Simple, healthy and nutritious boiled sprouts with mild seasoning. Great for health-conscious people.',
    price: 50,
    image: 'assets/images/boiled-sprouts.jpg',
    category: 'sprouts',
    rating: 4.3,
    ratingCount: 62,
    isVeg: true,
    ingredients: ['Mixed Sprouts', 'Onion', 'Tomato', 'Coriander', 'Lemon'],
    customizations: [
      { id: 'c14', name: 'Add Salt', extraPrice: 0 },
      { id: 'c15', name: 'Extra Lemon', extraPrice: 0 }
    ],
    preparationTime: 12,
    calories: 78
  },
  {
    id: '7',
    name: 'Seasonal Fruit Chaat',
    description: 'Fresh seasonal fruits with masala. Prepared daily with the finest quality seasonal fruits.',
    price: 75,
    image: 'assets/images/mix-fruit-chaat.jpg',
    category: 'fruit-chaat',
    rating: 4.5,
    ratingCount: 112,
    isVeg: true,
    ingredients: ['Seasonal Fruits', 'Chaat Masala', 'Black Salt', 'Lemon'],
    preparationTime: 10,
    calories: 120
  },
  {
    id: '8',
    name: 'Healthy Combo',
    description: 'Best of both worlds - Fruit Chaat + Masala Sprouts combo. Perfect meal for health enthusiasts!',
    price: 99,
    originalPrice: 140,
    image: 'assets/images/masala-sprouts.jpg',
    category: 'combo',
    rating: 4.9,
    ratingCount: 324,
    isVeg: true,
    isBestseller: true,
    preparationTime: 12,
    calories: 240
  }
];
