'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid,
  Boxes,
  Users,
  TrendingUp,
  Sparkles,
  LogOut,
  ChefHat,
  X,
} from 'lucide-react';
import { NAV_ITEMS, LOGOUT_NAV_ITEM, APP_CONFIG, NavItem } from '@/lib/constants';
import { useAuth } from '@/providers';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  LayoutDashboard,
  UtensilsCrossed,
  Grid,
  Boxes,
  Users,
  TrendingUp,
  Sparkles,
  LogOut,
};

export interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
}) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const renderNavItem = (item: NavItem) => {
    const IconComponent = ICON_MAP[item.iconName];
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onCloseMobile}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
          isActive
            ? 'bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20 shadow-glow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
          isCollapsed && 'justify-center px-2'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <IconComponent className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-brand-400' : 'text-slate-400')} />
        
        {!isCollapsed && <span className="truncate">{item.label}</span>}
        
        {!isCollapsed && item.badge && (
          <span
            className={cn(
              'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
              item.badge === 'AI'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800/80 transition-all duration-300 ease-in-out',
          // Desktop sizing
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile Drawer positioning
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 shrink-0 shadow-glow-sm">
              <ChefHat className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-white tracking-wide text-base leading-tight truncate">
                  {APP_CONFIG.name}
                </span>
                <span className="text-[11px] font-medium text-slate-400 truncate">
                  {APP_CONFIG.subtext}
                </span>
              </div>
            )}
          </Link>

          {/* Close button for Mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 rounded-lg lg:hidden hover:text-white hover:bg-slate-800"
            aria-label="Close Mobile Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(renderNavItem)}
        </nav>

        {/* Footer / Logout Section */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              logout();
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group text-rose-400 hover:bg-rose-950/40 hover:text-rose-300',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
