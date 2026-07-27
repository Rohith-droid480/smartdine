'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import type { Order } from '@smartdine/shared/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  Printer,
  Receipt,
  ChefHat,
  Bell,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async (isInitial = false) => {
    if (!token || !orderId) {
      if (isInitial) setIsLoading(false);
      return;
    }
    if (isInitial) setIsLoading(true);
    try {
      const res = await api.orders.getById(token, orderId);
      if (res.success && res.data) {
        setOrder(res.data);
        setErrorMsg(null);
      } else if (isInitial) {
        setErrorMsg(res.error ?? 'Failed to load order details.');
      }

      // Try fetching printable receipt from billing module
      const receiptRes = await api.billing.getReceipt(token, orderId);
      if (receiptRes.success && receiptRes.data) {
        setReceipt(receiptRes.data);
      }
    } catch (err: unknown) {
      if (isInitial) {
        setErrorMsg((err as Error).message ?? 'Network error loading order tracking.');
      }
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    fetchOrderDetails(true);

    const interval = setInterval(() => {
      fetchOrderDetails(false);
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchOrderDetails]);

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4 py-20 font-sans">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Sign In Required</h1>
            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              Sign in to track live kitchen order status and view itemized tax receipts.
            </p>
          </div>
          <Link
            href={`/auth/login?redirect=/orders/${orderId}`}
            className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            <span>Sign In to Track Order</span>
          </Link>
        </div>
      </div>
    );
  }

  const stages: { key: Order['status']; label: string; icon: React.ReactNode }[] = [
    { key: 'placed', label: 'Placed', icon: <Receipt className="w-4 h-4" /> },
    { key: 'preparing', label: 'Preparing', icon: <ChefHat className="w-4 h-4" /> },
    { key: 'ready', label: 'Ready', icon: <Bell className="w-4 h-4" /> },
    { key: 'served', label: 'Served', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'billed', label: 'Billed', icon: <Receipt className="w-4 h-4" /> },
  ];

  const getStageIndex = (status: Order['status']) => {
    return stages.findIndex((s) => s.key === status);
  };

  const currentStageIndex = order ? getStageIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 space-y-10 font-sans">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-stone-900 border-b border-stone-800 py-12 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="mx-auto max-w-4xl relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>

          <button
            onClick={() => fetchOrderDetails(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-bold text-stone-200 hover:bg-stone-750 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
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

        {/* LOADING STATE */}
        {isLoading && (
          <div className="animate-pulse space-y-6">
            <div className="h-28 bg-stone-900 rounded-3xl border border-stone-800"></div>
            <div className="h-64 bg-stone-900 rounded-3xl border border-stone-800"></div>
          </div>
        )}

        {/* POPULATED ORDER DETAILS */}
        {!isLoading && !errorMsg && order && (
          <>
            {/* Order Banner & Tracker Card */}
            <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl space-y-8 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-white font-mono">
                    Order #{order.id.substring(0, 8)}
                  </h1>
                  <p className="text-xs text-stone-400 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Amount Paid</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Live Kitchen Step Tracker */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Live Kitchen Preparation Status</h3>
                <div className="grid grid-cols-5 gap-3 text-center">
                  {stages.map((stage, idx) => {
                    const isPassed = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage.key} className="space-y-2">
                        <div
                          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 scale-110 shadow-lg font-bold'
                              : isPassed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-stone-800/60 text-stone-500 border border-stone-800'
                          }`}
                        >
                          {stage.icon}
                        </div>
                        <p
                          className={`text-[11px] font-bold ${
                            isCurrent
                              ? 'text-amber-400'
                              : isPassed
                              ? 'text-emerald-400'
                              : 'text-stone-500'
                          }`}
                        >
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Printable Itemized Tax Invoice */}
            <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="text-center border-b border-stone-800 pb-6 space-y-1.5">
                <h2 className="text-2xl font-black text-white">SmartDine Restaurant</h2>
                <p className="text-xs text-stone-400">Official Tax Invoice & Itemized Receipt</p>
                <p className="text-xs text-stone-500 font-mono">Invoice Ref: {receipt?.['invoiceNumber'] as string ?? `INV-${order.id.substring(0, 8)}`}</p>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Itemized Breakdown</h3>
                <div className="divide-y divide-stone-800/80 border-t border-b border-stone-800/80 py-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 text-xs">
                      <div>
                        <span className="font-bold text-white font-mono">Item #{item.menuItemId.substring(0, 6)}</span>
                        <span className="text-stone-400 font-mono"> &times; {item.quantity}</span>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">
                        ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Calculation Summary */}
              <div className="space-y-2 text-xs text-stone-400 pt-2 border-t border-stone-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-300">₹{(order.total / 1.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (2.5%)</span>
                  <span className="font-mono text-stone-300">₹{((order.total / 1.05) * 0.025).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%)</span>
                  <span className="font-mono text-stone-300">₹{((order.total / 1.05) * 0.025).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-stone-800">
                  <span>Grand Total (Paid)</span>
                  <span className="font-mono text-amber-400">₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 text-center">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 bg-stone-800 px-6 py-3 text-xs font-bold text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Itemized Tax Invoice</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

