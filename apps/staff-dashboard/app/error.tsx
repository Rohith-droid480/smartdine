'use client';

import React, { useEffect } from 'react';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected staff dashboard error silently to console
    console.error('Unhandled Staff Dashboard Error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 font-sans">
      <div className="mx-auto max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Dashboard Notice</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            An unexpected client view error occurred. Please reload to restore operational dispatch state.
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <button
            onClick={() => reset()}
            className="w-full rounded-2xl bg-amber-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Dashboard View</span>
          </button>
          <a
            href="/dashboard"
            className="inline-block w-full rounded-2xl border border-stone-800 bg-stone-950 py-3 text-xs text-stone-400 hover:text-white transition-colors"
          >
            Return to Operations Overview
          </a>
        </div>
      </div>
    </main>
  );
}
