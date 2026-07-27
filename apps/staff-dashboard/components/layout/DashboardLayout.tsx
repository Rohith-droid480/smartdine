'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { CopilotDrawer } from '../copilot/CopilotDrawer';
import { User } from '@/lib/types';
import { MOCK_CURRENT_USER } from '@/lib/mockApi';
import { Sparkles, Bell, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';
import { formatOrderCurrency } from '@/lib/order-utils';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: User;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user = MOCK_CURRENT_USER,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const { latestAlert, dismissAlert } = useOrders();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Global Real-Time Order Arrival Toast Popup */}
      {latestAlert && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 p-4 shadow-2xl border border-amber-300 flex items-center justify-between animate-in slide-in-from-top-4 duration-300 ring-4 ring-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-slate-950 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[10px] uppercase tracking-wider bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full">
                  NEW ORDER RECEIVED
                </span>
                <span className="text-[10px] font-bold opacity-80 font-mono">
                  Table #{latestAlert.tableNumber}
                </span>
              </div>
              <p className="text-xs font-black mt-1">
                Order #{latestAlert.id.substring(0, 8)} ({latestAlert.itemCount} items) — {formatOrderCurrency(latestAlert.total)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              onClick={dismissAlert}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-950 text-amber-400 px-3 py-1.5 text-xs font-black hover:bg-slate-900 transition-colors shadow-md shrink-0"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={dismissAlert}
              className="p-1 hover:bg-slate-950/20 rounded-lg transition-colors font-bold text-slate-950"
              aria-label="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
      />

      {/* Main App Container */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Top Navbar */}
        <TopNavbar
          user={user}
          onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onOpenCopilot={() => setIsCopilotOpen(true)}
        />

        {/* Scrollable Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Floating Operations Copilot FAB */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600 px-4 py-3 text-xs font-bold text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        aria-label="Open SmartDine Operations Copilot"
      >
        <Sparkles className="w-4 h-4 animate-pulse text-amber-200" />
        <span className="tracking-wide">AI Copilot</span>
      </button>

      {/* Global Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
};
