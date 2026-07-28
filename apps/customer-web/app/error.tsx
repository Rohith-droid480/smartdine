'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Utensils } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client error silently to console
    console.error('Unhandled Customer App Error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 font-sans">
      <div className="mx-auto max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Utensils className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Something Went Wrong</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            We encountered a temporary interface glitch. Please refresh the view to continue exploring SmartDine.
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <button
            onClick={() => reset()}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again & Refresh</span>
          </button>
          <a
            href="/menu"
            className="inline-block w-full rounded-2xl border border-stone-800 bg-stone-950 py-3 text-xs text-stone-400 hover:text-white transition-colors"
          >
            Back to Gourmet Menu
          </a>
        </div>
      </div>
    </main>
  );
}
