'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { OperationalInsight } from '@smartdine/shared/types';
import { getAIInsights } from '@/lib/api';
import { Sparkles, AlertTriangle, ShieldAlert, Boxes, TrendingUp, Users, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OperationsIntelligenceSection() {
  const [insights, setInsights] = useState<OperationalInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const loadInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAIInsights();
      if (Array.isArray(data)) {
        setInsights(data as OperationalInsight[]);
      } else {
        setInsights([]);
      }
    } catch (err: unknown) {
      console.error('Failed to load operations intelligence:', err);
      setError('Unable to fetch live operational risk alerts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  // Sort by Impact (HIGH -> MEDIUM -> LOW), then recency
  const sortedInsights = useMemo(() => {
    const impactWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    return [...insights].sort((a, b) => {
      const weightA = impactWeight[a.impact?.toUpperCase()] || 0;
      const weightB = impactWeight[b.impact?.toUpperCase()] || 0;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [insights]);

  // Client-side Category Filtering (Zero Refetching!)
  const filteredInsights = useMemo(() => {
    if (categoryFilter === 'All') return sortedInsights;
    return sortedInsights.filter((item) => {
      const cat = item.category?.toUpperCase() || '';
      const filter = categoryFilter.toUpperCase();
      if (filter === 'MENU') {
        return cat.includes('MENU');
      }
      return cat === filter;
    });
  }, [sortedInsights, categoryFilter]);

  // Impact summary counts
  const highCount = insights.filter((i) => i.impact?.toUpperCase() === 'HIGH').length;
  const mediumCount = insights.filter((i) => i.impact?.toUpperCase() === 'MEDIUM').length;

  const categories = ['All', 'Inventory', 'Revenue', 'Staffing', 'Menu'];

  const getImpactBadge = (impact: string) => {
    switch (impact?.toUpperCase()) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Critical Alert
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
            Operational
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
            Opportunity
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'INVENTORY':
        return <Boxes className="w-4 h-4 text-amber-400" />;
      case 'STAFFING':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'REVENUE':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-400" />;
    }
  };

  return (
    <section aria-label="Operations Intelligence Section" className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Operations Intelligence Engine
            </h2>
            {highCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-extrabold text-rose-300">
                {highCount} Critical
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Grounded risk assessment, inventory alerts, and AI-recommended actions
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border',
                categoryFilter === cat
                  ? 'bg-brand-500 text-white border-brand-400 shadow-xs'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-800 hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 rounded bg-slate-800"></div>
                <div className="h-4 w-20 rounded-full bg-slate-800"></div>
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-800"></div>
              <div className="h-10 w-full rounded bg-slate-800/80"></div>
              <div className="h-8 w-full rounded-xl bg-slate-800"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="text-sm font-bold text-red-200">Failed to Load Intelligence Insights</h3>
          <p className="text-xs text-red-300 max-w-md mx-auto">{error}</p>
          <button
            onClick={loadInsights}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading Insights</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredInsights.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No operational insights available.</h3>
          <p className="text-xs text-slate-500">
            {categoryFilter !== 'All'
              ? `No insights flagged under category "${categoryFilter}".`
              : 'All restaurant operations are currently running smoothly without active risk flags.'}
          </p>
        </div>
      )}

      {/* Populated Cards Grid */}
      {!isLoading && !error && filteredInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInsights.map((item) => (
            <div
              key={item.id}
              className={cn(
                'p-5 rounded-2xl bg-slate-900/80 border transition-all shadow-card flex flex-col justify-between space-y-4 hover:border-brand-500/40',
                item.impact?.toUpperCase() === 'HIGH'
                  ? 'border-rose-900/40 bg-gradient-to-b from-rose-950/20 to-slate-900/90'
                  : 'border-slate-800/80'
              )}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/50">
                      {getCategoryIcon(item.category)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  {getImpactBadge(item.impact)}
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-sans">
                  {item.description}
                </p>
              </div>

              {/* Actionable Recommendation Box */}
              {item.actionableRecommendation && (
                <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Actionable Recommendation:</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {item.actionableRecommendation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
