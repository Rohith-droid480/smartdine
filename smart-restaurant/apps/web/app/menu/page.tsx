'use client';

import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../lib/api';
import { MenuItem } from '../../lib/types';

interface CartItem {
  dish: MenuItem;
  quantity: number;
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string>('All');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMenu();
      if (res.success && res.data) {
        setMenu(res.data);
      } else {
        setError(res.error || 'Failed to load menu items.');
      }
    } catch (err) {
      setError('An error occurred while fetching the menu.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Appetizers', 'Main Course', 'Chef Specials', 'Desserts', 'Beverages'];
  const dietaryOptions = ['All', 'vegetarian', 'vegan', 'gluten-free', 'chef-special'];

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDietary = selectedDietary === 'All' || (item.dietary && item.dietary.includes(selectedDietary as any));
    return matchesCategory && matchesSearch && matchesDietary;
  });

  const addToCart = (dish: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.dish.id === dish.id);
      if (existing) {
        return prev.map((i) => i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.dish.id === dishId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setOrderSubmitting(true);
    try {
      const payload = {
        tableId: 'tbl-4',
        items: cart.map(i => ({ menuItemId: i.dish.id, quantity: i.quantity }))
      };
      const res = await api.createOrder(payload);
      if (res.success && res.data) {
        setOrderSuccess(res.data.id);
        setCart([]);
      } else {
        setError(res.error || 'Failed to place order.');
      }
    } catch (e) {
      setError('Checkout error occurred.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Badge variant="gold" size="sm" className="mb-2 uppercase tracking-wider">
            <UtensilsCrossed className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Live Culinary Menu
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            Artisanal Dining Selection
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Real-time availability directly synced with kitchen inventory.
          </p>
        </div>

        <Button
          onClick={() => setIsCartOpen(true)}
          variant="primary"
          leftIcon={<ShoppingBag className="w-4 h-4" />}
          className="relative"
        >
          View Order Cart
          {cartItemCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-xs font-bold">
              {cartItemCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Bar & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter:
            </span>
            {dietaryOptions.map((diet) => (
              <button
                key={diet}
                onClick={() => setSelectedDietary(diet)}
                className={`text-xs px-3 py-1.5 rounded-xl capitalize font-medium transition-all ${
                  selectedDietary === diet
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={fetchMenu}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton variant="card" className="h-96" />
          <Skeleton variant="card" className="h-96" />
          <Skeleton variant="card" className="h-96" />
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-4">
          <UtensilsCrossed className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-slate-200">No Dishes Found</h3>
          <Button variant="outline" size="sm" onClick={() => { setActiveCategory('All'); setSearchQuery(''); setSelectedDietary('All'); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((dish) => {
            const inCartItem = cart.find(i => i.dish.id === dish.id);
            return (
              <Card key={dish.id} className="flex flex-col h-full group">
                <div className="relative h-52 w-full rounded-xl overflow-hidden mb-4 bg-slate-900">
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
                      <UtensilsCrossed className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <Badge variant={dish.available ? 'emerald' : 'rose'} dot>
                      {dish.available ? 'Available' : 'Kitchen Sold Out'}
                    </Badge>
                  </div>

                  {dish.rating && (
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 flex items-center gap-1 border border-amber-500/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{dish.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {dish.name}
                      </h3>
                      <span className="font-serif font-bold text-amber-400 text-lg">
                        ₹{dish.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-3">
                      {dish.description}
                    </p>
                  </div>

                  {dish.dietary && dish.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dish.dietary.map((d) => (
                        <span key={d} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-300/80 border border-slate-700 uppercase tracking-wider">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-amber-500/70" />
                      <span>{dish.prepTimeMinutes || 20} min prep</span>
                    </div>

                    {dish.available ? (
                      inCartItem ? (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(dish.id, -1)}
                            className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-400 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-amber-300 px-1">{inCartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(dish.id, 1)}
                            className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-400 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(dish)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                          Add
                        </Button>
                      )
                    ) : (
                      <Button size="sm" variant="ghost" disabled>
                        Unavailable
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cart Modal / Drawer */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Your Dining Order Cart">
        {orderSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-emerald-400">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-300">
              Order <strong className="text-amber-300">#{orderSuccess}</strong> sent to the kitchen.
            </p>
            <Button className="w-full" onClick={() => { setIsCartOpen(false); setOrderSuccess(null); }}>
              Back to Menu
            </Button>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Your cart is empty. Select dishes to build your order.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.dish.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{item.dish.name}</h4>
                    <p className="text-[11px] text-amber-400">₹{item.dish.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.dish.id, -1)} className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-100">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.dish.id, 1)} className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Amount</span>
                <span className="font-serif font-bold text-amber-400 text-lg">₹{cartTotal.toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                isLoading={orderSubmitting}
                onClick={handleCheckout}
              >
                Submit Order to Kitchen
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
