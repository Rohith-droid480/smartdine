'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  UtensilsCrossed, 
  Receipt, 
  ArrowLeft,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success && res.data) {
        // Strict lookup without fallback to arbitrary first order
        const found = res.data.find(o => o.id === orderId);
        setOrder(found || null);
      }
    } catch (e) {
      console.error('Failed to fetch order tracking details:', e);
    } finally {
      setLoading(false);
    }
  };

  const steps: { key: Order['status']; label: string; icon: any }[] = [
    { key: 'placed', label: 'Order Received', icon: UtensilsCrossed },
    { key: 'preparing', label: 'Chef Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready to Serve', icon: Flame },
    { key: 'served', label: 'Served to Table', icon: CheckCircle2 },
    { key: 'billed', label: 'Billed & Completed', icon: Receipt },
  ];

  const getStepIndex = (status: Order['status']) => {
    return steps.findIndex(s => s.key === status);
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link href="/orders" className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {loading ? (
        <Skeleton variant="card" className="h-96" />
      ) : !order ? (
        <Card className="text-center py-16 glass-panel space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-slate-200">Order Not Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No order matching ID <strong className="text-amber-400">#{orderId}</strong> was found in your active sessions.
          </p>
          <Link href="/orders">
            <Button size="sm" variant="outline">
              View Active Orders
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-slate-100">
                  Order #{order.id}
                </h1>
                <Badge variant="amber" dot>
                  Table {order.tableNumber || 4}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-400 block uppercase">Est. Preparation</span>
              <span className="font-serif font-bold text-amber-400 text-xl flex items-center gap-1.5 justify-start sm:justify-end">
                <Clock className="w-5 h-5 animate-pulse" />
                {order.estimatedDeliveryMinutes || 12} mins
              </span>
            </div>
          </div>

          <Card className="glass-panel p-6 sm:p-8 space-y-6">
            <h3 className="font-serif text-lg font-bold text-amber-300">Live Kitchen Pipeline</h3>

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-slate-800 -z-0">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-glow-amber scale-110'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="md:text-center">
                      <p className={`text-xs font-semibold ${isCurrent ? 'text-amber-300 font-bold' : isPassed ? 'text-slate-200' : 'text-slate-600'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] text-amber-400 uppercase tracking-widest animate-pulse font-medium block">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
              Order Items Summary
            </h3>

            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-slate-200">{item.name || 'Dish Item'}</span>
                  </div>
                  <span className="font-serif font-bold text-amber-400">
                    ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Billed</span>
              <span className="font-serif font-bold text-xl text-amber-400">₹{order.total.toFixed(2)}</span>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href={`/billing?orderId=${order.id}`}>
              <Button leftIcon={<Receipt className="w-4 h-4" />}>
                View Receipt Breakdown
              </Button>
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
