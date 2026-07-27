'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { CopilotDrawer } from '../copilot/CopilotDrawer';
import { User } from '@/lib/types';
import { MOCK_CURRENT_USER } from '@/lib/mockApi';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
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
