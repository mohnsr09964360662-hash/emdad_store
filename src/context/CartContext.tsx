'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Product } from '@/types/storefront';
import { CartItem, CartState, CartToastNotification } from '@/types/cart';

const STORAGE_KEY = 'emdad_dental_cart_v1';

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState<CartToastNotification | null>(null);

  // 1. Initial Client Hydration from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      }
    } catch (err) {
      console.warn('[EmdadCart] Failed to load cart from localStorage:', err);
      // Self-heal corrupted localStorage
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Persist to localStorage on items change (only after hydration is complete)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch (err) {
      console.warn('[EmdadCart] Failed to save cart to localStorage:', err);
    }
  }, [items, isHydrated]);

  // 3. Auto-dismiss Toast Timer
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // 4. Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        } catch (_) {}
      } else if (e.key === STORAGE_KEY && !e.newValue) {
        setItems([]);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 5. Actions
  const addItem = useCallback((product: Product, quantity = 1) => {
    const qtyToAdd = Math.max(1, Math.floor(quantity));
    const maxStock = product.stock || 99;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id || item.id === product.id
      );

      if (existingIndex > -1) {
        const existing = prevItems[existingIndex];
        const updatedQty = Math.min(existing.quantity + qtyToAdd, maxStock);
        const updatedList = [...prevItems];
        updatedList[existingIndex] = {
          ...existing,
          quantity: updatedQty,
        };
        return updatedList;
      }

      const newItem: CartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        nameEn: product.nameEn,
        sku: product.sku,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.categoryName || '',
        categoryName: product.categoryName || '',
        unit: product.unit || 'قطعة',
        quantity: Math.min(qtyToAdd, maxStock),
        stock: product.stock,
      };

      return [...prevItems, newItem];
    });

    // Trigger Notification Toast
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      message: `تمت إضافة "${product.name}" إلى السلة`,
      productName: product.name,
      timestamp: Date.now(),
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) =>
      prev.filter((item) => item.productId !== productId && item.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const newQty = Math.floor(quantity);
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId || item.id === productId) {
          const limit = item.stock || 99;
          return { ...item, quantity: Math.min(newQty, limit) };
        }
        return item;
      })
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  // Derived calculations
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const contextValue = useMemo<CartState>(
    () => ({
      items,
      totalItems,
      subtotal,
      isCartOpen,
      isHydrated,
      toast,
      isCheckoutOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      dismissToast,
      openCheckout,
      closeCheckout,
    }),
    [
      items,
      totalItems,
      subtotal,
      isCartOpen,
      isHydrated,
      toast,
      isCheckoutOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      dismissToast,
      openCheckout,
      closeCheckout,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
