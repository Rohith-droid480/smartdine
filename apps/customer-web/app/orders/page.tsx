'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Order } from '@smartdine/shared/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  RefreshCw,
  Receipt,
  ChefHat,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  UtensilsCrossed,
} from 'lucide-react';

export default function OrdersPage() {
  const { token, user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.orders.getOwn(token);
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setErrorMsg(res.error ?? 'Failed to load your orders.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? 'Network error fetching orders.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4 py-20 font-sans">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Your Orders</h1>
            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              Sign in to your customer account to track real-time kitchen progress and view itemized tax receipts.
            </p>
          </div>
          <Link
            href="/auth/login?redirect=/orders"
            className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            <span>Sign In to View Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return (
          <span className="rounded-full bg-sky-500/20 border border-sky-500/30 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-sky-400">
            Placed
          </span>
        );
      case 'preparing':
        return (
          <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-amber-400 animate-pulse">
            Preparing 🍳
          </span>
        );
      case 'ready':
        return (
          <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-purple-400">
            Ready 🔔
          </span>
        );
      case 'served':
        return (
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
            Served ✨
          </span>
        );
      case 'billed':
        return (
          <span className="rounded-full bg-stone-800 border border-stone-700 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-stone-300">
            Billed 💳
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-stone-800 border border-stone-700 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-stone-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 space-y-12 font-sans">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-stone-900 border-b border-stone-800 py-16 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="mx-auto max-w-5xl relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              Your Orders
            </h1>
            <p className="max-w-xl text-sm text-stone-300 font-normal leading-relaxed">
              Track live kitchen status & review tax receipts.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-bold text-stone-200 hover:bg-stone-750 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Orders</span>
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ERROR STATE */}
        {errorMsg && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* LOADING SKELETON STATE */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-stone-800 bg-stone-900 p-6 space-y-4">
                <div className="h-4 w-1/3 rounded-lg bg-stone-800"></div>
                <div className="h-3 w-1/2 rounded-lg bg-stone-850"></div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !errorMsg && orders.length === 0 && (
          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-16 text-center space-y-4 backdrop-blur-xl">
            <UtensilsCrossed className="w-12 h-12 text-stone-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Explore our menu to place your first dining order.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-extrabold text-stone-950 hover:bg-amber-400 transition-colors shadow-lg"
            >
              <span>Browse Menu & Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* POPULATED ORDERS LIST */}
        {!isLoading && !errorMsg && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-5 backdrop-blur-xl hover:border-stone-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-white font-mono">
                        Order #{order.id.substring(0, 8)}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-stone-400">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                      {order.tableId && ` • Table #${order.tableId.substring(0, 6)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-amber-400 font-mono">
                      ₹{order.total.toFixed(2)}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-stone-750 hover:text-amber-300 transition-colors"
                    >
                      <span>Track Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-2 text-xs text-stone-300">
                  <p className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">Order Items ({order.items.length}):</p>
                  <ul className="space-y-1 text-stone-300 pl-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="font-mono flex justify-between max-w-md">
                        <span>Item #{item.menuItemId.substring(0, 6)} &times; {item.quantity}</span>
                        <span className="text-stone-400">₹{(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
