import React from 'react';
import { AIInsight } from '@/lib/types';
import { RecommendationPanel } from './RecommendationPanel';
import { Sparkles, TrendingUp } from 'lucide-react';

export interface OpportunityCardProps {
  opportunity: AIInsight;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-brand-500/30 shadow-glow-sm flex flex-col justify-between relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-brand-300 uppercase tracking-wider">
              Revenue & Upsell Opportunity
            </span>
          </div>

          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            Growth Insight
          </span>
        </div>

        <h3 className="text-base font-bold text-white tracking-tight mb-2">
          {opportunity.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {opportunity.description}
        </p>

        <RecommendationPanel
          recommendation={opportunity.actionableRecommendation}
          category={opportunity.category}
        />
      </div>
    </div>
  );
};
