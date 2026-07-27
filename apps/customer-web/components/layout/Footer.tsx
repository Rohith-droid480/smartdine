'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white text-base">
                🍽️
              </span>
              <span>Smart<span className="text-orange-500">Dine</span></span>
            </div>
            <p className="max-w-sm text-sm text-gray-400 leading-relaxed">
              Experience modern dining with real-time menu ordering, table reservations, live order status tracking, and seamless restaurant integration.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/menu" className="hover:text-white transition-colors">Digital Menu</Link></li>
              <li><Link href="/reservations" className="hover:text-white transition-colors">Table Reservations</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link href="/notifications" className="hover:text-white transition-colors">Notifications</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Customer Support</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><span className="text-gray-400">Operating Hours: 11:00 AM – 11:00 PM</span></li>
              <li><span className="text-gray-400">Support Email: support@smartdine.com</span></li>
              <li><span className="text-gray-400">VibeAthon 6.0 — SmartDine Monorepo</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} SmartDine Inc. All rights reserved. Built for VibeAthon 6.0.
        </div>
      </div>
    </footer>
  );
}
