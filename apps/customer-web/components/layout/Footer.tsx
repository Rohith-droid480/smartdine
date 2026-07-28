'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-stone-400 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Description */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white text-base shadow-md shadow-orange-500/20">
                🍽️
              </span>
              <span>Smart<span className="text-orange-500">Dine</span></span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Michelin-grade dining system with real-time menu ordering, table reservations, live order status tracking, and grounded AI concierge support.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>FSSAI Certified • 100% Contactless</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">Dining Experience</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li><Link href="/menu" className="hover:text-amber-400 transition-colors">Gourmet Digital Menu</Link></li>
              <li><Link href="/reservations" className="hover:text-amber-400 transition-colors">Table Reservations</Link></li>
              <li><Link href="/orders" className="hover:text-amber-400 transition-colors">Live Order Tracker</Link></li>
              <li><Link href="/assistant" className="hover:text-amber-400 transition-colors flex items-center gap-1">AI Concierge <Sparkles className="w-3 h-3 text-amber-400" /></Link></li>
              <li><Link href="/notifications" className="hover:text-amber-400 transition-colors">Kitchen Alerts</Link></li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">Location & Hours</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>42 Culinary Boulevard, Gourmet Quarter, Indiranagar, Bengaluru 560038</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Mon – Sun: 11:00 AM – 11:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">Customer Support</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+91 (80) 4567-8900</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>concierge@smartdine.com</span>
              </li>
              <li className="pt-1">
                <span className="inline-block rounded-lg bg-stone-900 border border-stone-800 px-2.5 py-1 text-3xs font-mono text-stone-400">
                  SmartDine Monorepo v1.0 • Hackathon Submission
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="border-t border-stone-900 pt-6 text-center text-[11px] text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} SmartDine Monorepo System. All rights reserved.</span>
          <span className="text-stone-400 font-semibold">Built by Team HackZone</span>
        </div>
      </div>
    </footer>
  );
}
