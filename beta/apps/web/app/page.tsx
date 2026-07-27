'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  UtensilsCrossed, 
  CalendarDays, 
  Sparkles, 
  Clock, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  ChefHat,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { MenuItem } from '@/lib/types';

export default function HomePage() {
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMenu().then((res) => {
      if (res.success && res.data) {
        setFeaturedDishes(res.data.slice(0, 3));
      }
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load menu for landing page:', err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="relative overflow-hidden space-y-20 pb-20">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="gold" size="md" className="mx-auto uppercase tracking-widest text-[11px]">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Next-Gen Smart Restaurant Experience
          </Badge>
          
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-slate-100 leading-[1.15]">
            Where Fine Culinary Art Meets <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Intelligent Dining</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            Browse our live digital menu, secure your preferred table instantly, track kitchen orders in real-time, and get AI-grounded dish recommendations tailored to your palate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/menu">
              <Button size="lg" leftIcon={<UtensilsCrossed className="w-5 h-5" />}>
                Explore Menu
              </Button>
            </Link>
            <Link href="/reservations">
              <Button size="lg" variant="outline" leftIcon={<CalendarDays className="w-5 h-5" />}>
                Book a Table
              </Button>
            </Link>
            <Link href="/assistant">
              <Button size="lg" variant="secondary" leftIcon={<Sparkles className="w-5 h-5 text-amber-400" />}>
                Ask AI Assistant
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Real-Time Kitchen Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Live Order Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-yellow-400" />
              <span>Master Chef Specials</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Chef Specials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="amber" size="sm" className="mb-2 uppercase tracking-wider">
              Curated Menu
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
              Tonight's Chef Specials
            </h2>
          </div>
          <Link href="/menu" className="text-sm font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1">
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton variant="card" className="h-80" />
            <Skeleton variant="card" className="h-80" />
            <Skeleton variant="card" className="h-80" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDishes.map((dish) => (
              <Card key={dish.id} className="flex flex-col h-full group">
                <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 bg-slate-800">
                  {dish.imageUrl ? (
                    <Image
                      src={dish.imageUrl}
                      alt={dish.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                      <UtensilsCrossed className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <Badge variant={dish.available ? 'emerald' : 'rose'} dot>
                      {dish.available ? 'Available' : 'Sold Out'}
                    </Badge>
                  </div>
                  {dish.rating && (
                    <div className="absolute bottom-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 flex items-center gap-1 border border-amber-500/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{dish.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {dish.name}
                      </h3>
                      <span className="font-serif font-bold text-amber-400 text-lg">
                        ₹{dish.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-light">
                      {dish.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                      {dish.category}
                    </span>
                    <Link href="/menu">
                      <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* AI Assistant Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-amber-500/30 overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="gold" size="sm">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
                AI Culinary Assistant
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
                Undecided? Let Our AI Sommelier Guide You
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you're looking for gluten-free pairings, wine advice, or dish suggestions based on your diet, our assistant queries live menu data instantly.
              </p>
              <Link href="/assistant">
                <Button size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Chat with AI Assistant
                </Button>
              </Link>
            </div>

            {/* Interactive Mock Chat Snippet */}
            <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-3 font-sans text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  U
                </div>
                <div className="bg-slate-800 p-3 rounded-xl text-slate-200">
                  "What's a great vegetarian dish with wine pairing?"
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-slate-200 space-y-1.5">
                  <p>
                    I recommend our <strong className="text-amber-300">Truffle & Wild Mushroom Arancini</strong> (₹450). Pairs exquisitely with a crisp Pinot Noir!
                  </p>
                  <Badge variant="emerald" size="sm">Live Availability Verified</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
