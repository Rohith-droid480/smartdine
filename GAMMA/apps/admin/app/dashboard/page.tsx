'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Grid,
  Boxes,
  Users,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Server,
  Database,
  Cpu,
  Zap,
  RefreshCw,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getOrders, getReservations, getInventory, getStaff } from '@/lib/api';
import { Order, Reservation, InventoryItem, StaffMember } from '@/lib/types';

interface DashboardMetrics {
  activeOrdersCount: number;
  reservedTablesCount: number;
  lowStockCount: number;
  staffOnShiftCount: number;
}

interface ActivityEvent {
  id: string;
  type: 'ORDER' | 'RESERVATION' | 'INVENTORY' | 'STAFF';
  title: string;
  description: string;
  timeAgo: string;
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all core summary metrics in parallel using lib/api.ts
      const [orders, reservations, inventory, staff] = await Promise.all([
        getOrders(),
        getReservations(),
        getInventory(),
        getStaff(),
      ]);

      // Calculate active orders (PENDING, PREPARING, READY)
      const activeOrdersCount = orders.filter((o: Order) =>
        ['PENDING', 'PREPARING', 'READY'].includes(o.status)
      ).length;

      // Calculate reserved/seated tables
      const reservedTablesCount = reservations.filter((r: Reservation) =>
        ['CONFIRMED', 'SEATED'].includes(r.status)
      ).length;

      // Calculate low stock / out of stock items
      const lowStockCount = inventory.filter((i: InventoryItem) =>
        ['LOW_STOCK', 'OUT_OF_STOCK'].includes(i.status)
      ).length;

      // Calculate staff on duty / break
      const staffOnShiftCount = staff.filter((s: StaffMember) =>
        ['ON_DUTY', 'ON_BREAK'].includes(s.shiftStatus)
      ).length;

      setMetrics({
        activeOrdersCount,
        reservedTablesCount,
        lowStockCount,
        staffOnShiftCount,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load operational dashboard metrics.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Timeline Activity Log
  const activities: ActivityEvent[] = [
    {
      id: 'act_1',
      type: 'ORDER',
      title: 'New Order Received',
      description: 'Table 4 ordered Truffle Wagyu Burger (x2) & Smoked Old Fashioned (x2)',
      timeAgo: '5 mins ago',
      icon: <UtensilsCrossed className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'act_2',
      type: 'RESERVATION',
      title: 'Reservation Confirmed',
      description: 'Dr. Evelyn Sterling reserved Table 7 for 4 guests at 20:00',
      timeAgo: '18 mins ago',
      icon: <Grid className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'act_3',
      type: 'INVENTORY',
      title: 'Stock Threshold Warning',
      description: 'Fresh Black Truffles dropped to 0.35 kg (Low Stock Warning)',
      timeAgo: '32 mins ago',
      icon: <Boxes className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'act_4',
      type: 'STAFF',
      title: 'Staff Checked In',
      description: 'Executive Chef Antoine Dubois clocked in for Dinner Shift',
      timeAgo: '1 hour ago',
      icon: <Users className="w-4 h-4 text-purple-400" />,
    },
  ];

  // Quick Action Links
  const quickActions = [
    {
      title: 'Live Orders',
      description: 'Track kitchen dispatch & takeaway queues',
      href: '/orders',
      icon: <UtensilsCrossed className="w-5 h-5 text-brand-400" />,
      badge: 'Live',
    },
    {
      title: 'Table Management',
      description: 'Manage floor seating & guest reservations',
      href: '/tables',
      icon: <Grid className="w-5 h-5 text-blue-400" />,
    },
    {
      title: 'Inventory Alert',
      description: 'Check stock levels & ingredient re-orders',
      href: '/inventory',
      icon: <Boxes className="w-5 h-5 text-amber-400" />,
      badge: 'Action Needed',
    },
    {
      title: 'Staff Roster',
      description: 'Monitor active shifts & employee schedules',
      href: '/staff',
      icon: <Users className="w-5 h-5 text-purple-400" />,
    },
    {
      title: 'Sales Analytics',
      description: 'Inspect revenue graphs & category trends',
      href: '/analytics',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'AI Insights',
      description: 'View demand forecasting & smart suggestions',
      href: '/insights',
      icon: <Sparkles className="w-5 h-5 text-amber-300" />,
      badge: 'AI Engine',
    },
  ];

  // System Status Indicator Items
  const systemStatusItems = [
    { name: 'Backend Core Service', status: 'Healthy', details: 'Express Node Cluster API v1.0', icon: Server },
    { name: 'Database Cluster', status: 'Healthy', details: 'PostgreSQL Primary Replica (14ms)', icon: Database },
    { name: 'API Gateway Contract', status: 'Healthy', details: 'Alpha API Contract Synced', icon: Cpu },
    { name: 'Mock Data Service', status: 'Healthy', details: 'GAMMA Local Runtime Active', icon: Zap },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Operations Overview"
        subtitle="Executive management summary & real-time restaurant performance metrics"
        action={
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        }
      />

      {/* Error State */}
      {error && !loading && (
        <ErrorState
          title="Unable to load dashboard data"
          message={error}
          onRetry={fetchDashboardData}
        />
      )}

      {/* Loading State */}
      {loading && !metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <LoadingSkeleton count={4} className="h-28 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-80 lg:col-span-2 w-full" />
            <LoadingSkeleton className="h-80 w-full" />
          </div>
        </div>
      )}

      {/* Dashboard Body */}
      {!loading && metrics && (
        <div className="space-y-8 animate-in fade-in">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Orders"
              value={metrics.activeOrdersCount}
              change={8.5}
              changeLabel="orders pending/preparing"
              icon={<UtensilsCrossed className="w-5 h-5 text-brand-400" />}
            />
            <StatCard
              title="Reserved Tables"
              value={metrics.reservedTablesCount}
              change={12.0}
              changeLabel="confirmed / seated today"
              icon={<Grid className="w-5 h-5 text-blue-400" />}
            />
            <StatCard
              title="Low Stock Items"
              value={metrics.lowStockCount}
              change={-15.0}
              changeLabel="items below threshold"
              icon={<Boxes className="w-5 h-5 text-amber-400" />}
            />
            <StatCard
              title="Staff On Shift"
              value={metrics.staffOnShiftCount}
              change={0}
              changeLabel="active floor & kitchen staff"
              icon={<Users className="w-5 h-5 text-purple-400" />}
            />
          </div>

          {/* Main Grid: Recent Activity & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity Timeline Card */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-400" />
                  <h2 className="text-base font-bold text-white">Recent Activity Log</h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">Real-Time Operational Audit</span>
              </div>

              <div className="mt-5 space-y-4">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/50 hover:border-slate-700/60 transition-colors"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 shrink-0 mt-0.5">
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-100 truncate">{act.title}</h4>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {act.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed truncate">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-white">System Health Status</h2>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    All Operational
                  </span>
                </div>

                <div className="mt-5 space-y-3.5">
                  {systemStatusItems.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.details}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Alpha Core API Contract v1.0</span>
                <span>Latency: 14ms</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Quick Operations Navigation</h2>
              <span className="text-xs text-slate-400">Direct Module Access</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-brand-500/40 hover:bg-slate-900 transition-all shadow-card flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-slate-800/80 group-hover:bg-brand-500/20 group-hover:text-brand-300 transition-all border border-slate-700/50">
                      {action.icon}
                    </div>
                    {action.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {action.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                        {action.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State Fallback */}
      {!loading && !error && metrics === null && (
        <EmptyState
          title="No Operational Metrics Found"
          description="Unable to locate active restaurant metrics from the API service."
          actionText="Reload Data"
          onAction={fetchDashboardData}
        />
      )}
    </DashboardLayout>
  );
}
