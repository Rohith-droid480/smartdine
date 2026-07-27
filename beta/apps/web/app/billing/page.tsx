'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Receipt, 
  Printer, 
  CheckCircle2, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck,
  UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

function BillingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBilling();
  }, [orderId]);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success && res.data) {
        const found = orderId ? res.data.find(o => o.id === orderId) : res.data[0];
        setOrder(found || res.data[0] || null);
      }
    } catch (e) {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order ? order.total : 0;
  const gst = subtotal * 0.05; // 5% Restaurant GST
  const serviceCharge = subtotal * 0.05; // 5% Service Charge
  const grandTotal = subtotal + gst + serviceCharge;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link href="/orders" className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <Button size="sm" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
          Print Receipt
        </Button>
      </div>

      {loading ? (
        <Skeleton variant="card" className="h-96" />
      ) : !order ? (
        <Card className="text-center py-12 space-y-3">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold">No Receipt Available</h3>
        </Card>
      ) : (
        <Card className="glass-panel p-8 sm:p-10 space-y-8 border border-slate-700/80 shadow-2xl relative">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-amber-300">AURA Lounge</h1>
                <p className="text-[11px] text-slate-400">742 Evergreen Terrace • Invoice #{order.id}</p>
              </div>
            </div>
            <Badge variant="emerald" size="md">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Paid
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Date</span>
              <span className="font-medium text-slate-200">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Table</span>
              <span className="font-medium text-slate-200">Table {order.tableNumber || 4}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Payment Method</span>
              <span className="font-medium text-amber-400 flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> UPI / Cards
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Status</span>
              <span className="font-medium text-emerald-400">Settled</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Itemized Summary
            </h3>

            <div className="divide-y divide-slate-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">{item.quantity}x</span>
                    <span className="text-slate-200">{item.name || 'Dish Item'}</span>
                  </div>
                  <span className="font-serif font-bold text-slate-200">
                    ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Restaurant GST (5%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Service Charge (5%)</span>
              <span>₹{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-serif font-bold text-amber-400 pt-3 border-t border-slate-800">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Thank you for dining at AURA Smart Restaurant.
            </p>
          </div>

        </Card>
      )}

    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading receipt...</div>}>
      <BillingContent />
    </Suspense>
  );
}
