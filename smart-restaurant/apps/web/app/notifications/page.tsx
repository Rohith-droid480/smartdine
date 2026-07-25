'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  ShoppingBag, 
  CalendarDays, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { Notification } from '../../lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      // Error
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'reservation_update':
        return <CalendarDays className="w-4 h-4 text-amber-400" />;
      case 'order_update':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <Badge variant="gold" size="sm" className="mb-2 uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5 mr-1 text-amber-400" />
            In-App Notifications
          </Badge>
          <h1 className="font-serif text-3xl font-bold text-slate-100">
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Real-time status updates for kitchen orders, table bookings, and chef recommendations.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="card" className="h-20" />
          <Skeleton variant="card" className="h-20" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">No notifications at this time.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition-all ${
                !notif.read
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs ${!notif.read ? 'text-amber-200 font-semibold' : 'text-slate-300'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
