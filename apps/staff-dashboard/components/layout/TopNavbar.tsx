'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  Clock,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
} from 'lucide-react';
import { User } from '@/lib/types';
import { useOrders } from '@/hooks/useOrders';
import { formatOrderCurrency, normalizeOrderStatus } from '@/lib/order-utils';

export interface TopNavbarProps {
  user?: User;
  onToggleMobileMenu: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCopilot?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user,
  onToggleMobileMenu,
  isCollapsed,
  onToggleCollapse,
  onOpenCopilot,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { allOrders } = useOrders();

  // Active / placed orders awaiting kitchen prep (case insensitive normalized)
  const pendingOrders = allOrders.filter((o) => {
    const norm = normalizeOrderStatus(o.status);
    return norm === 'placed' || norm === 'preparing';
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Left Action Controls */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-400 rounded-xl lg:hidden hover:text-white hover:bg-slate-800/80"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Tablet / Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 text-slate-400 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar Collapse"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Global Search Box */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, tables, items..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 bg-slate-800/60 rounded-xl border border-slate-700/50 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/60 transition-all"
          />
        </div>
      </div>

      {/* Right Control Bar */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* Service Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dinner Shift Live</span>
        </div>

        {/* Active Shift Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/40 font-mono">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Operations Copilot Trigger */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-500/20 to-amber-500/20 hover:from-brand-500/30 hover:to-amber-500/30 border border-brand-500/30 text-xs font-bold text-brand-400 hover:text-brand-300 transition-all shadow-xs"
            aria-label="Open Operations Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span className="hidden sm:inline">Copilot</span>
          </button>
        )}

        {/* Real-Time Notifications Bell & Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 text-slate-400 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {pendingOrders.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-slate-950 ring-2 ring-slate-900 animate-bounce">
                {pendingOrders.length}
              </span>
            )}
          </button>

          {/* Interactive Notifications Pop-over Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Kitchen Alerts ({pendingOrders.length})
                  </h4>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="font-bold text-white">All Kitchen Orders Clear!</p>
                  <p className="text-[11px] text-slate-500">New customer orders will pop up here in real time.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pendingOrders.map((o) => (
                    <Link
                      key={o.id}
                      href="/orders"
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">
                          Order #{o.id.substring(0, 8)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Table #{o.tableNumber || 4}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 mt-1">
                        {o.items?.length || 1} Item(s) — {formatOrderCurrency(o.totalAmount || (o as any).total || 0)}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-700/40 text-[10px]">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                          Status: {o.status}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1 font-bold text-amber-400">
                          View Ticket <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-slate-800 text-center">
                <Link
                  href="/orders"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-black text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Open Full Kitchen Dispatch Board &rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-800" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30 group-hover:ring-brand-500/60 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold ring-2 ring-brand-500/30">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-100 leading-none group-hover:text-brand-400 transition-colors">
              {user?.name || 'Alex Rivera'}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
              {user?.role || 'MANAGER'}
            </span>
          </div>

          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block group-hover:text-slate-200 transition-colors" />
        </div>
      </div>
    </header>
  );
};
