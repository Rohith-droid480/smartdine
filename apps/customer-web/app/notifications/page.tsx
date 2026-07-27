'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Notification } from '@smartdine/shared/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function NotificationsPage() {
  const { token, user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.notifications.getOwn(token);
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setErrorMsg(res.error ?? 'Failed to load notifications.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? 'Network error fetching notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      await api.notifications.markRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore silent error
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await api.notifications.markAllRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore silent error
    }
  };

  if (!user || !token) {
    return (
      <div className="mx-auto max-w-md my-16 px-4 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 text-3xl">
          🔔
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          Sign in to view real-time order updates, table reservation alerts, and dining notifications.
        </p>
        <Link
          href="/auth/login?redirect=/notifications"
          className="inline-block rounded-xl bg-orange-500 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-orange-600 transition-colors"
        >
          Sign In to View Notifications &rarr;
        </Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">Notification Center</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ✓ Mark All as Read
          </button>
        )}
      </div>

      {/* ERROR STATE */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
          <div className="text-2xl">⚠️</div>
          <h3 className="text-base font-bold text-red-900">Failed to Load Notifications</h3>
          <p className="text-xs text-red-700">{errorMsg}</p>
          <button
            onClick={fetchNotifications}
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* LOADING SKELETON STATE */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 h-20" />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !errorMsg && notifications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center space-y-3">
          <div className="text-4xl">🔕</div>
          <h3 className="text-base font-bold text-gray-900">No Notifications</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You are all caught up! Order status updates and reservation alerts will appear here.
          </p>
        </div>
      )}

      {/* POPULATED NOTIFICATION LIST */}
      {!isLoading && !errorMsg && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between rounded-2xl border p-4 transition-all ${
                n.read
                  ? 'border-gray-100 bg-white opacity-80'
                  : 'border-orange-200 bg-orange-50/40 shadow-2xs'
              }`}
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />}
                  <p className={`text-xs ${n.read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                    {n.message}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-3xs text-gray-400">
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  <span className="capitalize rounded-md bg-gray-100 px-1.5 py-0.5 text-gray-600 font-mono">
                    {n.channel}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="shrink-0 text-3xs font-semibold text-orange-600 hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
