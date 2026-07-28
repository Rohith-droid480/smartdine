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
  LogIn,
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
  const lowName = menuItem.name.toLowerCase();
  if (lowName.includes('steak') || lowName.includes('beef') || lowName.includes('wagyu')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
  }
  if (lowName.includes('salmon') || lowName.includes('fish') || lowName.includes('bass')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80';
  }
  if (lowName.includes('risotto') || lowName.includes('mushroom') || lowName.includes('truffle')) {
    return 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80';
  }
  if (lowName.includes('cocktail') || lowName.includes('drink') || lowName.includes('mocktail') || lowName.includes('berry')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80';
  }
  if (lowName.includes('tiramisu') || lowName.includes('chocolate') || lowName.includes('dessert') || lowName.includes('fondant')) {
    return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  const [inputTableId, setInputTableId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAuthenticated = Boolean(user && token);

  const handleCheckout = async () => {
    setErrorMsg(null);
    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (!isAuthenticated || !token) {
      setErrorMsg('Authentication Required: Please sign in to place your order.');
      router.push('/auth/login?redirect=/menu');
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
                <h2 className="text-base font-bold text-white">Your Dining Order</h2>
                <p className="text-2xs text-stone-400">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} Items Selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unauthenticated Alert Banner */}
          {!isAuthenticated && !orderSuccessId && items.length > 0 && (
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3.5 flex items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sign in required to link order to your account</span>
              </div>
              <button
                onClick={() => router.push('/auth/login?redirect=/menu')}
                className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-3xs font-black text-stone-950 hover:bg-amber-400 transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Body List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {errorMsg && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-start justify-between gap-2 shadow-lg">
                <p>{errorMsg}</p>
                <button onClick={() => setErrorMsg(null)} className="font-bold text-red-400">✕</button>
              </div>
            )}

            {orderSuccessId ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-5 my-auto shadow-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Order Confirmed!</h3>
                  <p className="text-xs text-stone-300">
                    Your order ticket <span className="font-mono text-emerald-400 font-bold">#{orderSuccessId.substring(0, 8)}</span> has been dispatched directly to the kitchen line.
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      onClose();
                      router.push(`/orders/${orderSuccessId}`);
                    }}
                    className="w-full rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-stone-950 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Track Live Order Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setOrderSuccessId(null);
                      onClose();
                    }}
                    className="w-full rounded-2xl border border-stone-800 bg-stone-950 py-2.5 text-xs text-stone-400 hover:text-white transition-colors"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800 text-stone-500">
                  <Utensils className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Your cart is empty</h3>
                  <p className="text-xs text-stone-500 mt-1">Explore our culinary selections to add items.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="flex items-center gap-4 rounded-2xl border border-stone-800 bg-stone-950/60 p-3.5 shadow-md"
                    >
                      <img
                        src={getCartItemImage(item.menuItem)}
                        alt={item.menuItem.name}
                        className="h-16 w-16 rounded-xl object-cover border border-stone-800"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-100 truncate">{item.menuItem.name}</h4>
                        <p className="text-xs font-mono text-amber-400 mt-0.5">₹{item.menuItem.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            className="rounded-lg bg-stone-800 p-1 text-stone-300 hover:bg-stone-700 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-stone-200 px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            className="rounded-lg bg-stone-800 p-1 text-stone-300 hover:bg-stone-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.menuItem.id)}
                        className="text-stone-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Table Number Selection */}
                <div className="rounded-2xl border border-stone-800 bg-stone-950/40 p-4 space-y-2 mt-4">
                  <label className="block text-3xs uppercase font-bold text-stone-400 tracking-wider">
                    Dine-in Table ID / Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={inputTableId}
                    onChange={(e) => setInputTableId(e.target.value)}
                    placeholder="e.g. Table #4"
                    className="w-full rounded-xl bg-stone-900 border border-stone-800 px-3.5 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
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

              {!isAuthenticated ? (
                <button
                  onClick={() => router.push('/auth/login?redirect=/menu')}
                  className="w-full rounded-2xl bg-amber-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Place Order • ₹{grandTotal.toFixed(2)}</span>
                </button>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
