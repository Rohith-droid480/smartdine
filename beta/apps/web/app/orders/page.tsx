'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ChevronRight, 
  Utensils, 
  Receipt,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { Order } from '../../lib/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      } else {
        setError(res.error || 'Failed to load orders.');
      }
    } catch (e) {
      setError('An error occurred while retrieving orders.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return <Badge variant="sky" dot>Order Placed</Badge>;
      case 'preparing':
        return <Badge variant="amber" dot>Kitchen Preparing</Badge>;
      case 'ready':
        return <Badge variant="gold" dot>Ready to Serve</Badge>;
      case 'served':
        return <Badge variant="emerald">Served</Badge>;
      case 'billed':
        return <Badge variant="slate">Billed & Paid</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge variant="gold" size="sm" className="mb-2 uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Kitchen Order Tracking
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            Active & Past Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Monitor real-time preparation status and view detailed digital receipts.
          </p>
        </div>

        <Link href="/menu">
          <Button leftIcon={<Utensils className="w-4 h-4" />}>
            Order More Dishes
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-slate-200">No Orders Found</h3>
          <Link href="/menu">
            <Button size="sm">Explore Digital Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif font-bold text-lg text-slate-100">
                    Order #{order.id}
                  </h3>
                  {getStatusBadge(order.status)}
                </div>

                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                  <span>Table {order.tableNumber || 4}</span>
                  <span>•</span>
                  <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>{order.items.length} {order.items.length === 1 ? 'Dish' : 'Dishes'}</span>
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  {order.items.map(i => `${i.quantity}x ${i.name || 'Dish'}`).join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase">Total</span>
                  <span className="font-serif font-bold text-amber-400 text-lg">₹{order.total.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/orders/${order.id}`}>
                    <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                      Track Live
                    </Button>
                  </Link>
                  <Link href={`/billing?orderId=${order.id}`}>
                    <Button size="sm" variant="secondary" leftIcon={<Receipt className="w-3.5 h-3.5" />}>
                      Receipt
                    </Button>
                  </Link>
                </div>
              </div>

            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
