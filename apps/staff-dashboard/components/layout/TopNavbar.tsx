'use client';

import React from 'react';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  Clock,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Service Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dinner Shift Live</span>
        </div>

        {/* Active Shift Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/40">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          <span>07:45 PM</span>
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

        {/* Notifications Icon with Badge */}
        <button
          className="relative p-2 text-slate-400 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-slate-900" />
        </button>

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
