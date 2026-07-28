'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { MenuItem } from '@smartdine/shared/types';
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { RecommendationCarousel } from '@/components/menu/RecommendationCarousel';
import {
  Search,
  X,
  Sparkles,
  ShoppingCart,
  Plus,
  Flame,
  Utensils,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

/** Helper to provide ultra high-resolution culinary photography based on dish name/category */
function getDishImage(item: MenuItem): string {
  if (item.imageUrl && item.imageUrl.startsWith('http')) {
    return item.imageUrl;
  }
  const name = item.name.toLowerCase();
  const cat = (item.category || '').toLowerCase();

  if (name.includes('asparagus') || name.includes('burrata')) {
    return 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=1200&q=80';
  }
  if (name.includes('burger') || name.includes('wagyu')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('mocktail') || name.includes('berry') || cat.includes('beverage')) {
    return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('steak') || name.includes('tomahawk') || name.includes('beef')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('risotto') || name.includes('pasta') || name.includes('truffle')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('salmon') || name.includes('fish') || name.includes('seafood') || name.includes('octopus')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('chocolate') || name.includes('fondant') || name.includes('dessert') || cat.includes('dessert')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
}

export default function MenuPage() {
  const { addItem } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const fetchMenu = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.menu.getAll();
      if (res.success && Array.isArray(res.data)) {
        setMenuItems(res.data);
      } else {
        setErrorMsg(res.error ?? 'Failed to load menu items.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message ?? 'Network error fetching restaurant menu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 space-y-12">
      {/* Luxury Editorial Header Banner */}
      <section className="relative overflow-hidden bg-stone-900 border-b border-stone-800 py-16 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10 space-y-3 text-left">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Our Menu
          </h1>

          <p className="max-w-xl text-sm sm:text-base text-stone-300 font-normal leading-relaxed">
            Freshly prepared dishes crafted for dining in or takeaway.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Chef & AI Personalized Recommendation Experience */}
        <RecommendationCarousel />

        {/* Filter & Search Bar Controls */}
        <div className="sticky top-4 z-40 rounded-2xl border border-stone-800 bg-stone-900/90 backdrop-blur-xl p-4 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-5 py-2.5 text-xs font-extrabold tracking-wide whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-stone-800/80 text-stone-300 border border-stone-700/60 hover:bg-stone-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or ingredients..."
              className="w-full rounded-xl border border-stone-700 bg-stone-800/80 pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-stone-400 focus:border-amber-500 focus:outline-none shadow-inner"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-white text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ERROR STATE */}
        {errorMsg && (
          <div className="rounded-3xl border border-red-500/30 bg-red-950/40 p-8 text-center space-y-4 backdrop-blur-xl">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Failed to Load Menu</h3>
            <p className="text-xs text-red-300 max-w-md mx-auto">{errorMsg}</p>
            <button
              onClick={fetchMenu}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading Menu</span>
            </button>
          </div>
        )}

        {/* LOADING SKELETON STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-stone-800 bg-stone-900/60 p-5 space-y-4 shadow-xl"
              >
                <div className="h-48 w-full rounded-2xl bg-stone-800"></div>
                <div className="h-5 w-3/4 rounded-lg bg-stone-800"></div>
                <div className="h-12 w-full rounded-xl bg-stone-850"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-20 rounded-lg bg-stone-800"></div>
                  <div className="h-9 w-28 rounded-xl bg-stone-800"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !errorMsg && filteredItems.length === 0 && (
          <div className="rounded-3xl border border-dashed border-stone-800 bg-stone-900/40 p-16 text-center space-y-4">
            <Utensils className="w-12 h-12 text-stone-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No dishes found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {searchQuery
                ? `No menu items matched "${searchQuery}". Try searching for another dish.`
                : `There are currently no items available in category "${selectedCategory}".`}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-colors shadow-lg"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* POPULATED MENU GRID */}
        {!isLoading && !errorMsg && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((dish) => (
              <div
                key={dish.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-stone-800 bg-stone-900/90 overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all duration-500"
              >
                {/* Culinary Dish Image Header */}
                <div
                  onClick={() => setSelectedDish(dish)}
                  className="relative h-52 w-full overflow-hidden bg-stone-950 cursor-pointer"
                >
                  <img
                    src={getDishImage(dish)}
                    alt={dish.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80" />

                  {/* Stock Availability Badge */}
                  <span
                    className={`absolute top-4 right-4 shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${
                      dish.available
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {dish.available ? 'In Stock' : 'Sold Out'}
                  </span>

                  {/* Category Overlay Tag */}
                  <span className="absolute bottom-3 left-4 rounded-lg bg-stone-950/80 border border-stone-700/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 backdrop-blur-md">
                    {dish.category}
                  </span>
                </div>

                {/* Dish Info Details */}
                <div className="p-6 space-y-4 flex flex-col justify-between flex-1">
                  <div className="space-y-2">
                    <h3
                      onClick={() => setSelectedDish(dish)}
                      className="text-xl font-extrabold text-white group-hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      {dish.name}
                    </h3>

                    <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed font-normal">
                      {dish.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-stone-800/80">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">PRICE</p>
                      <span className="text-xl font-black text-amber-400 font-mono">
                        ₹{dish.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => addItem(dish, 1)}
                      disabled={!dish.available}
                      className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-2.5 text-xs font-extrabold text-stone-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>+ Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dish Details Modal */}
        {selectedDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div className="relative max-w-lg w-full rounded-3xl border border-stone-700 bg-stone-900 p-6 shadow-2xl space-y-6 overflow-hidden">
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-stone-800 p-2 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Dish Image */}
              <div className="h-48 w-full rounded-2xl overflow-hidden relative">
                <img
                  src={getDishImage(selectedDish)}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-lg bg-stone-950/80 border border-stone-700 px-2.5 py-1 text-[10px] font-extrabold text-amber-400 uppercase">
                  {selectedDish.category}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">{selectedDish.name}</h2>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">{selectedDish.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Item Price</p>
                  <p className="text-2xl font-black text-amber-400 font-mono">
                    ₹{selectedDish.price.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    addItem(selectedDish, 1);
                    setSelectedDish(null);
                  }}
                  disabled={!selectedDish.available}
                  className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-xs font-extrabold text-stone-950 shadow-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart • ₹{selectedDish.price.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

