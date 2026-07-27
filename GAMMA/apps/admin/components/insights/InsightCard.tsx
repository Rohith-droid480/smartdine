import React from 'react';
import { AIInsight } from '@/lib/types';
import { InsightSeverityBadge } from './InsightSeverityBadge';
import { RecommendationPanel } from './RecommendationPanel';
import { getInsightCategoryLabel, formatInsightDate } from '@/lib/insights-utils';
import { Sparkles, Clock, AlertTriangle, Users, Boxes, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InsightCardProps {
  insight: AIInsight;
}

export const InsightCard: React.FC<InsightCardProps> = React.memo(({ insight }) => {
  const isHigh = insight.impact === 'HIGH';

  // Icon mapping per category
  const getCategoryIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'INVENTORY':
        return <Boxes className="w-5 h-5 text-amber-400" />;
      case 'STAFFING':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'REVENUE':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-slate-900/80 border transition-all shadow-card flex flex-col justify-between',
        isHigh ? 'border-rose-900/40 bg-slate-900/90' : 'border-slate-800/80 hover:border-slate-700/80'
      )}
    >
      <div>
        {/* Card Header: Category & Severity */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
              {getCategoryIcon(insight.category)}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {getInsightCategoryLabel(insight.category)}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{formatInsightDate(insight.createdAt)}</span>
              </div>
            </div>
          </div>

          <InsightSeverityBadge impact={insight.impact} />
        </div>

        {/* Insight Title & Description */}
        <h3 className="text-base font-bold text-white tracking-tight mb-2">
          {insight.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          {insight.description}
        </p>

        {/* Recommendation Panel */}
        <RecommendationPanel
          recommendation={insight.actionableRecommendation}
          category={insight.category}
        />
      </div>
    </div>
  );
});
