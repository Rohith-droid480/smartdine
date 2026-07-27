'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  Utensils,
  Lock,
} from 'lucide-react';
import type { MenuItem } from '@smartdine/shared/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Helper to provide culinary food thumbnails in cart item list */
function getCartItemImage(menuItem: MenuItem): string {
  if (menuItem.imageUrl && menuItem.imageUrl.startsWith('http')) {
    return menuItem.imageUrl;
  }
  const name = menuItem.name.toLowerCase();
  const cat = (menuItem.category || '').toLowerCase();

  if (name.includes('burger') || name.includes('wagyu')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('mocktail') || name.includes('berry') || cat.includes('beverage')) {
    return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('steak') || name.includes('beef') || name.includes('tomahawk')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('risotto') || name.includes('pasta') || name.includes('truffle')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('salmon') || name.includes('fish') || name.includes('seafood') || name.includes('bruschetta')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('chocolate') || name.includes('fondant') || name.includes('dessert')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, tableId, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const { token, user } = useAuth();

  const [inputTableId, setInputTableId] = useState<string>(tableId ?? '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setErrorMsg(null);
    if (!token) {
      router.push('/auth/login?redirect=/menu');
      onClose();
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: { tableId?: string; items: { menuItemId: string; quantity: number }[] } = {
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
        })),
      };

      if (inputTableId.trim()) {
        orderPayload.tableId = inputTableId.trim();
      }

      const res = await api.orders.create(token, orderPayload);
      if (res.success && res.data) {
        setOrderSuccessId(res.data.id);
        clearCart();
      } else {
        setErrorMsg(res.error ?? 'Failed to place order. Please try again.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? 'An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const gstAmount = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col justify-between text-stone-100 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 px-6 py-5 bg-stone-900/90 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Your Dining Cart</h2>
                <p className="text-xs text-stone-400">{itemCount} {itemCount === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Order Success State */}
            {orderSuccessId ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/30 p-8 text-center space-y-5 my-6 backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">Order Sent to Kitchen!</h3>
                  <p className="text-xs text-emerald-300 font-mono">
                    Order Ticket #{orderSuccessId.substring(0, 8)}
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setOrderSuccessId(null);
                      onClose();
                      router.push(`/orders/${orderSuccessId}`);
                    }}
                    className="w-full rounded-2xl bg-emerald-500 py-3.5 text-xs font-extrabold text-stone-950 hover:bg-emerald-400 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Track Kitchen Preparation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setOrderSuccessId(null);
                      onClose();
                    }}
                    className="w-full rounded-2xl border border-stone-700 bg-stone-800 py-3 text-xs font-bold text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
                  >
                    Close Cart
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-800/80 border border-stone-700 text-amber-400">
                  <Utensils className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
                  <p className="text-xs text-stone-400 max-w-xs">
                    Explore our menu to add appetizers, main courses, desserts, or mocktails.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    router.push('/menu');
                  }}
                  className="mt-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-extrabold text-stone-950 hover:bg-amber-400 transition-colors shadow-lg"
                >
                  Browse Menu Now
                </button>
              </div>
            ) : (
              /* Items List */
              <>
                {errorMsg && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300 flex items-center justify-between">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)} className="text-red-400 font-bold ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!user && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Ordering as guest. <button onClick={() => { onClose(); router.push('/auth/login'); }} className="underline font-bold text-amber-200">Sign in</button> to track status live.
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {items.map(({ menuItem, quantity }) => (
                    <div
                      key={menuItem.id}
                      className="flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-850/60 p-3.5 shadow-md gap-3"
                    >
                      <img
                        src={getCartItemImage(menuItem)}
                        alt={menuItem.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-700/60"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-extrabold text-white truncate">{menuItem.name}</h4>
                        <p className="text-xs font-mono font-bold text-amber-400">
                          ₹{menuItem.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-xl border border-stone-700 bg-stone-900 p-1">
                          <button
                            onClick={() => updateQuantity(menuItem.id, -1)}
                            className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-black text-white font-mono">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(menuItem.id, 1)}
                            className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(menuItem.id)}
                          className="p-1.5 text-stone-400 hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Number Input */}
                <div className="pt-3 border-t border-stone-800 space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Dining Table ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={inputTableId}
                    onChange={(e) => setInputTableId(e.target.value)}
                    placeholder="Table ID or leave empty for takeaway"
                    className="w-full rounded-xl border border-stone-700 bg-stone-800/80 px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && !orderSuccessId && (
            <div className="border-t border-stone-800 bg-stone-900/95 px-6 py-5 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-200">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>GST (5% CGST+SGST)</span>
                  <span className="font-mono text-stone-200">₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-white pt-2 border-t border-stone-800">
                  <span>Total Amount</span>
                  <span className="font-mono text-amber-400">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-3.5 text-xs font-black text-stone-950 shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Place Order Now • ₹{grandTotal.toFixed(2)}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

