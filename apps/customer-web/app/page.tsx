'use client';

import React from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  CalendarDays,
  ChefHat,
  Bell,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AiRecommendationsSection, AiAssistantWidget } from '@/components/ai/AiAssistantFallback';

export default function HomePage() {
  return (
    <div className="space-y-24 pb-28 bg-stone-950 text-stone-100 min-h-screen font-sans">
      {/* 1. Elegant Restaurant Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-stone-950 py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-800/80 shadow-2xl">
        {/* High-Resolution Unsplash Culinary Hero Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40 pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Subtitle */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
              Fine Dining, <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-100 bg-clip-text text-transparent">
                Crafted with Precision
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-stone-300 font-normal leading-relaxed">
              Explore our seasonal menu, reserve your dining table in advance, and track live kitchen preparation directly from your device.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-9 py-4 text-sm font-extrabold text-stone-950 shadow-2xl shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Explore Menu & Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/reservations"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-stone-700 bg-stone-900/90 backdrop-blur-xl px-8 py-4 text-sm font-bold text-stone-200 hover:bg-stone-800 hover:text-white hover:border-stone-500 transition-all active:scale-95 shadow-lg"
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>Reserve a Table</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-stone-800/80 text-stone-400 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Table Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Live Kitchen Tracker</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Ticket Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl border border-stone-700/80 bg-stone-900/95 p-6 shadow-2xl backdrop-blur-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Table #04 • Main Dining Room</h4>
                    <p className="text-[11px] text-stone-400">Order #ORD-8921 • Live Kitchen Status</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  PREPARING
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-300 bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                      1x
                    </span>
                    <span className="font-semibold text-stone-100">Truffle Wagyu Burger</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">₹650.00</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-300 bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                      2x
                    </span>
                    <span className="font-semibold text-stone-100">Signature Berry Mocktail</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">₹500.00</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[11px] font-bold text-stone-400">
                  <span>Chef Preparation</span>
                  <span className="text-amber-400">Est. 12 mins remaining</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-stone-800 overflow-hidden border border-stone-700/50">
                  <div className="h-full w-2/3 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Chef Artistry Feature Story */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-800 bg-stone-900/80 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 relative h-80 lg:h-[420px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=80"
              alt="Chef Plating Gourmet Dish"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-stone-900/90 hidden lg:block" />
          </div>

          <div className="lg:col-span-6 p-8 lg:p-12 space-y-6 text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Chef-Crafted Dishes, Prepared Fresh
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed font-normal">
              Every item on our menu is thoughtfully prepared by master chefs using seasonal ingredients. View dish details, real-time availability, and pair recommendations tailored to your taste.
            </p>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>View Complete Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI Recommendations Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AiRecommendationsSection />
      </div>

      {/* 4. Dining Services Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Our Services
          </h2>
          <p className="text-sm text-stone-400 font-medium leading-relaxed">
            Seamless dining experiences tailored for table ordering, advance seating, and order tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Card 1: Digital Menu */}
          <div className="lg:col-span-7 group relative rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-15 group-hover:opacity-25 transition-opacity duration-500 overflow-hidden pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                alt="Plated Steak"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6 z-10 max-w-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                  Digital Menu & Live Stock
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed font-normal">
                  Explore food categories, view ingredient descriptions, and check live item availability.
                </p>
              </div>
            </div>

            <div className="pt-8 z-10">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-amber-400 hover:text-amber-300 group-hover:translate-x-1.5 transition-transform"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Table Reservations */}
          <div className="lg:col-span-5 group relative rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="space-y-6 z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  Table Reservations
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed font-normal">
                  Reserve dining room tables in advance and select your preferred time slot.
                </p>
              </div>
            </div>

            <div className="pt-8 z-10">
              <Link
                href="/reservations"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1.5 transition-transform"
              >
                <span>Book Table</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Live Order Tracker */}
          <div className="lg:col-span-6 group relative rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl hover:shadow-2xl hover:border-orange-500/50 transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="space-y-6 z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <ChefHat className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white group-hover:text-orange-400 transition-colors">
                  Live Order Tracker
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed font-normal">
                  Follow kitchen preparation progress from placed to served in real time.
                </p>
              </div>
            </div>

            <div className="pt-8 z-10">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-orange-400 hover:text-orange-300 group-hover:translate-x-1.5 transition-transform"
              >
                <span>Track Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 4: Notifications & Alerts */}
          <div className="lg:col-span-6 group relative rounded-3xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="space-y-6 z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Bell className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white group-hover:text-purple-400 transition-colors">
                  Notifications & Alerts
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed font-normal">
                  Receive instant alerts when your dish is ready or table status updates.
                </p>
              </div>
            </div>

            <div className="pt-8 z-10">
              <Link
                href="/notifications"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-purple-400 hover:text-purple-300 group-hover:translate-x-1.5 transition-transform"
              >
                <span>View Alerts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating AI Assistant Widget */}
      <AiAssistantWidget />
    </div>
  );
}




