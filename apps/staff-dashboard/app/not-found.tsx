import React from 'react';
import Link from 'next/link';
import { Compass, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 font-sans">
      <div className="mx-auto max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-4xl font-black text-amber-500 tracking-widest font-mono">404</span>
          <h1 className="text-xl font-bold text-white">Route Not Found</h1>
          <p className="text-xs text-stone-400 leading-relaxed">
            The operational dashboard route you requested does not exist. Please return to the primary dispatch overview.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="w-full rounded-2xl bg-amber-500 py-3.5 text-xs font-black text-stone-950 shadow-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Operations Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
