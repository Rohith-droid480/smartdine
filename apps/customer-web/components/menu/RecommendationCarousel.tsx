'use client';

import React, { useState, useEffect } from 'react';
import type { RecommendationResponse, RecommendationItem } from '@smartdine/shared/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Sparkles, ShoppingCart, Plus, ChefHat, Award, Zap } from 'lucide-react';

/** Helper to provide high-resolution culinary photography for AI recommendation items */
function getRecommendationImage(item: RecommendationItem): string {
  const name = item.name.toLowerCase();
  const reason = (item.reason || '').toLowerCase();

  if (name.includes('burger') || name.includes('wagyu') || reason.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('mocktail') || name.includes('berry') || reason.includes('drink') || reason.includes('beverage')) {
    return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('steak') || name.includes('beef') || name.includes('tomahawk')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('risotto') || name.includes('pasta') || name.includes('truffle')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('salmon') || name.includes('fish') || name.includes('seafood') || name.includes('bruschetta')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('chocolate') || name.includes('fondant') || name.includes('dessert')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
}

export function RecommendationCarousel() {
  const { token } = useAuth();
  const { addItem } = useCart();

  const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      setIsLoading(true);
      try {
        const res = await api.ai.getRecommendations(token || undefined);
        if (isMounted) {
          if (res.success && res.data && Array.isArray(res.data.recommendations)) {
            setRecommendationData(res.data);
          }
        }
      } catch (err: unknown) {
        console.error('Silent recommendation fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Loading State with Skeletons matching exact card heights (No Cumulative Layout Shift)
  if (isLoading) {
    return (
      <section aria-label="Chef & AI Recommendations Loading" className="my-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-amber-500/20 animate-pulse"></div>
          <div className="h-6 w-56 rounded-lg bg-stone-800 animate-pulse"></div>
          <div className="h-5 w-28 rounded-full bg-amber-500/20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 rounded-3xl border border-stone-800 bg-stone-900/60 p-4 space-y-3 shadow-xl animate-pulse"
            >
              <div className="h-32 w-full rounded-2xl bg-stone-800"></div>
              <div className="h-4 w-3/4 rounded-md bg-stone-800"></div>
              <div className="h-3 w-full rounded-md bg-stone-850"></div>
              <div className="flex justify-between items-center pt-3 border-t border-stone-800">
                <div className="h-5 w-16 rounded-md bg-stone-800"></div>
                <div className="h-8 w-20 rounded-xl bg-stone-800"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // If no data or array is empty (Empty/Error State): hide cleanly without layout impact
  if (!recommendationData || recommendationData.recommendations.length === 0) {
    return null;
  }

  const { mealPeriod, recommendations } = recommendationData;

  return (
    <section aria-label="Chef & AI Recommendations" className="my-10 space-y-6">
      {/* Clean Section Header */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Chef Recommendations
          </h2>
          <p className="text-xs text-stone-400">Curated dish pairings for your meal.</p>
        </div>

        <span className="shrink-0 rounded-full bg-stone-800 border border-stone-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
          {mealPeriod}
        </span>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations.map((item: RecommendationItem) => (
          <div
            key={item.menuItemId}
            className="group relative flex flex-col justify-between rounded-3xl border border-stone-800 bg-stone-900/90 overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all duration-500"
          >
            {/* Food Photography Header */}
            <div className="relative h-44 w-full overflow-hidden bg-stone-950">
              <img
                src={getRecommendationImage(item)}
                alt={item.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80" />

              {/* Confidence Match Badge */}
              <span className="absolute top-3 right-3 shrink-0 rounded-full bg-stone-950/80 border border-amber-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 backdrop-blur-md shadow-lg flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{item.confidence}% Match</span>
              </span>

              {/* Chef Badge */}
              <span className="absolute bottom-2.5 left-3 rounded-lg bg-stone-950/80 border border-stone-700/80 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-300 backdrop-blur-md flex items-center gap-1">
                <ChefHat className="w-3 h-3 text-amber-400" />
                <span>Chef Pick</span>
              </span>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3 flex flex-col justify-between flex-1">
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {item.name}
                </h3>

                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed italic">
                  "{item.reason}"
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-3 border-t border-stone-800/80">
                <div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">PRICE</p>
                  <span className="text-base font-black text-amber-400 font-mono">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() =>
                    addItem(
                      {
                        id: item.menuItemId,
                        name: item.name,
                        price: item.price,
                        available: item.available,
                        description: item.reason,
                        category: 'Chef Special',
                      },
                      1
                    )
                  }
                  disabled={!item.available}
                  className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-4 py-2 text-xs font-extrabold text-stone-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  aria-label={`Add ${item.name} to cart`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>+ Add</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

