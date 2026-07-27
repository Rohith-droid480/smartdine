'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Notification, Order } from '@smartdine/shared/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCircle2, Clock, ChefHat, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  const { token, user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (isInitial = false) => {
    if (!token) {
      if (isInitial) setIsLoading(false);
      return;
    }
    if (isInitial) setIsLoading(true);
    try {
      // 1. Fetch direct API notifications
      const res = await api.notifications.getOwn(token);
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }

      // 2. Fetch active customer orders for live status notifications
      const ordersRes = await api.orders.getOwn(token);
      if (ordersRes.success && Array.isArray(ordersRes.data)) {
        setActiveOrders(ordersRes.data);
      }
      setErrorMsg(null);
    } catch (err: unknown) {
      if (isInitial) {
        setErrorMsg((err as Error).message ?? 'Network error fetching notifications.');
      }
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications(true);

    // 3-second live sync polling interval
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      await api.notifications.markRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await api.notifications.markAllRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4 py-20 font-sans">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bell className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Notifications</h1>
            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              Sign in to view real-time kitchen order updates, table reservation alerts, and dining notifications.
            </p>
          </div>
          <Link
            href="/auth/login?redirect=/notifications"
            className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            <span>Sign In to View Notifications &rarr;</span>
          </Link>
        </div>
      </div>
    );
  }

  // Derive order status alert cards
  const derivedOrderAlerts = activeOrders.map((o) => {
    let icon = <Clock className="w-4 h-4 text-amber-400" />;
    let statusText = `Order #${o.id.substring(0, 8)} received. Kitchen preparing your order.`;
    let badgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';

    if (o.status === 'preparing') {
      icon = <ChefHat className="w-4 h-4 text-blue-400" />;
      statusText = `Chef is preparing your dishes for Order #${o.id.substring(0, 8)}.`;
      badgeBg = 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    } else if (o.status === 'ready') {
      icon = <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />;
      statusText = `🔔 YOUR ORDER #${o.id.substring(0, 8)} IS READY! Freshly cooked and ready for Table #${(o as any).tableNumber || 4}.`;
      badgeBg = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-black';
    } else if (o.status === 'served' || o.status === 'billed') {
      icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      statusText = `Order #${o.id.substring(0, 8)} served. Enjoy your dining experience!`;
      badgeBg = 'bg-stone-800 border-stone-700 text-stone-300';
    }

    return {
      id: `derived-ord-${o.id}`,
      orderId: o.id,
      status: o.status,
      message: statusText,
      icon,
      badgeBg,
      createdAt: (o as any).updatedAt || o.createdAt,
    };
  });

  const unreadCount = notifications.filter((n) => !n.read).length + activeOrders.filter((o) => o.status === 'ready').length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-xs font-black text-stone-950 shadow-lg">
                {unreadCount} live alert{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="rounded-2xl border border-stone-700 bg-stone-900 px-4 py-2 text-xs font-bold text-stone-200 hover:bg-stone-800 transition-colors"
            >
              ✓ Mark All as Read
            </button>
          )}
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-stone-800 bg-stone-900 p-5 h-20" />
            ))}
          </div>
        )}

        {/* LIVE ORDER KITCHEN NOTIFICATION CARDS */}
        {!isLoading && derivedOrderAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 pt-2">
              <Sparkles className="w-3.5 h-3.5" /> Live Kitchen & Order Status Alerts
            </h2>
            {derivedOrderAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded-3xl border p-5 transition-all shadow-xl backdrop-blur-xl ${
                  alert.status === 'ready'
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-white ring-2 ring-emerald-500/20'
                    : 'border-stone-800 bg-stone-900/90 text-stone-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-2xl border ${alert.badgeBg}`}>
                    {alert.icon}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {alert.message}
                    </p>
                    <span className="text-[10px] text-stone-400 block mt-1 font-mono">
                      Updated {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/orders/${alert.orderId}`}
                  className="shrink-0 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 text-xs font-extrabold text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all"
                >
                  Track &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* DIRECT API NOTIFICATIONS */}
        {!isLoading && notifications.length > 0 && (
          <div className="space-y-3 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">System Notifications</h2>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between rounded-3xl border p-5 transition-all ${
                  n.read
                    ? 'border-stone-800 bg-stone-900/60 opacity-80'
                    : 'border-amber-500/30 bg-stone-900 text-white'
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
                    <p className="text-xs sm:text-sm font-bold text-white">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 text-xs font-bold text-amber-400 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && derivedOrderAlerts.length === 0 && notifications.length === 0 && (
          <div className="rounded-3xl border border-dashed border-stone-800 bg-stone-900/40 p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-800 text-stone-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Active Alerts</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Place an order or table reservation to receive real-time live kitchen dispatch updates here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
