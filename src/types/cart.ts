// src/types/cart.ts
import { Product } from './storefront';

export interface CartItem {
  id: string; // Unique item identifier (maps to product.id)
  productId: string; // Reference to product catalog ID
  sku: string; // Clinical catalog SKU
  name: string; // Arabic product title
  nameEn?: string; // English clinical title
  price: number; // Unit price in Syrian Pounds (ل.س)
  originalPrice?: number; // Pre-discount price if applicable
  image: string; // Image asset path
  category: string; // Category display name
  categoryName?: string; // Backwards-compatible alias for category
  unit: string; // Packaging unit (e.g. 'محقنة 4 غرام', 'علبة 100 قطعة')
  quantity: number; // Selected quantity (integer >= 1)
  stock?: number; // Available warehouse stock
}

export interface CartToastNotification {
  id: string;
  message: string;
  productName: string;
  timestamp: number;
}

export const SYRIAN_GOVERNORATES = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'السويداء',
  'درعا',
  'القنيطرة',
  'دير الزور',
  'الحسكة',
  'الرقة',
  'إدلب',
] as const;

export type SyrianGovernorate = (typeof SYRIAN_GOVERNORATES)[number];

export interface DeliveryInfo {
  fullName: string;
  phoneNumber: string; // Syrian format: 09xxxxxxxx or +9639xxxxxxxx or 009639xxxxxxxx
  governorate: SyrianGovernorate | string;
  addressDetails: string;
  notes?: string;
  paymentMethod?: 'COD' | 'BARAKEH' | 'MTN_CASH' | string;
}

export interface OrderPayload {
  orderNumber: string;
  delivery: DeliveryInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
  grandTotal?: number;
  timestamp: string;
}

export interface OrderDispatchResult {
  orderNumber: string;
  delivery: DeliveryInfo;
  items: CartItem[];
  subtotal: number;
  whatsappUrl: string;
  timestamp: string;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  isHydrated: boolean;
  toast: CartToastNotification | null;
  isCheckoutOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  dismissToast: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
}

export type CartContextType = CartState;
