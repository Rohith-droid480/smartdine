'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { MenuItem } from '@smartdine/shared/types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  tableId: string | undefined;
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  setTableId: (id: string | undefined) => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'smartdine_customer_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableId, setTableId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        } catch {
          // ignore parsing error
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (menuItem: MenuItem, quantity = 1) => {
    if (!menuItem.available) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.menuItem.id === menuItem.id);
      if (existingIndex > -1 && prev[existingIndex]) {
        const existing = prev[existingIndex];
        const next = [...prev];
        next[existingIndex] = {
          menuItem: existing.menuItem,
          quantity: existing.quantity + quantity,
        };
        return next;
      }
      return [...prev, { menuItem, quantity }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setItems((prev) => {
      const updated: CartItem[] = [];
      for (const item of prev) {
        if (item.menuItem.id === menuItemId) {
          const nextQty = item.quantity + delta;
          if (nextQty > 0) {
            updated.push({ menuItem: item.menuItem, quantity: nextQty });
          }
        } else {
          updated.push(item);
        }
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        tableId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setTableId,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
