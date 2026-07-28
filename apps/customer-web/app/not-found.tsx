import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Utensils } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] bg-stone-950 text-stone-100 flex items-center justify-center p-6 font-sans">
      <div className="mx-auto max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <span className="text-4xl font-black text-amber-500 tracking-widest font-mono">404</span>
          <h1 className="text-xl font-bold text-white">Page Not Found</h1>
          <p className="text-xs text-stone-400 leading-relaxed">
            The requested page does not exist or may have moved. Explore our gourmet menu or active dining features below.
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <Link
            href="/menu"
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            <span>Browse Gourmet Menu</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full rounded-2xl border border-stone-800 bg-stone-950 py-3 text-xs text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
