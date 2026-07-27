'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UtensilsCrossed, 
  CalendarDays, 
  ShoppingBag, 
  Bell, 
  Sparkles, 
  User as UserIcon, 
  Menu as MenuIcon, 
  X,
  ChevronRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { User, Notification } from '../../lib/types';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.getCurrentUser().then(res => {
      if (res.success && res.data) setUser(res.data);
    });
    api.getNotifications().then(res => {
      if (res.success && res.data) {
        setUnreadCount(res.data.filter(n => !n.read).length);
      }
    });
  }, [pathname]);

  const navLinks = [
    { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
    { name: 'Reservations', href: '/reservations', icon: CalendarDays },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'AI Assistant', href: '/assistant', icon: Sparkles, highlight: true },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                AURA
              </span>
              <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-medium">
                Smart Dining
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : link.highlight
                      ? 'bg-gradient-to-r from-amber-500/10 to-purple-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-amber-400 animate-pulse' : ''}`} />
                  <span>{link.name}</span>
                  {link.badge ? (
                    <Badge variant="rose" size="sm" dot>
                      {link.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* User / Auth State & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-200">{user.name}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-base font-medium ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-amber-400" />
                  <span>{link.name}</span>
                </div>
                {link.badge ? (
                  <Badge variant="rose" size="sm">
                    {link.badge} new
                  </Badge>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </Link>
            );
          })}
          {!user && (
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-700 text-slate-200 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
