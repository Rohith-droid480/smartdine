import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Sparkles, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-serif text-lg font-bold text-amber-300">
                AURA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Elevating dining through intelligent culinary craft, instant reservations, and AI-powered recommendations.
            </p>
          </div>

          {/* Dining Experience */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Dining</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/menu" className="hover:text-amber-400 transition-colors">Digital Menu</Link></li>
              <li><Link href="/reservations" className="hover:text-amber-400 transition-colors">Table Booking</Link></li>
              <li><Link href="/orders" className="hover:text-amber-400 transition-colors">Track Orders</Link></li>
              <li><Link href="/assistant" className="hover:text-amber-400 transition-colors flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> AI Sommelier</Link></li>
            </ul>
          </div>

          {/* Hours & Location */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Hours & Contact</h4>
            <p className="text-xs text-slate-400 space-y-1">
              <span className="block text-slate-300">Mon - Sun: 11:30 AM - 11:00 PM</span>
              <span className="block">742 Evergreen Terrace, Suite 100</span>
              <span className="block text-amber-400 font-medium">reservations@auradining.com</span>
            </p>
          </div>

          {/* AI Notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">System Guarantee</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Grounded Live Menu Data & Instant Order Status Verification.</span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AURA Smart Restaurant System. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for VibeAthon 6.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
