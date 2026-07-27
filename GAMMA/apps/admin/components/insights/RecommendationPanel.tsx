import React from 'react';
import Link from 'next/link';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { InsightCategory } from '@/lib/types';

export interface RecommendationPanelProps {
  recommendation: string;
  category: InsightCategory | string;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendation,
  category,
}) => {
  // Map category to module link
  const getCategoryLink = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'INVENTORY':
        return { label: 'Open Inventory', href: '/inventory' };
      case 'STAFFING':
        return { label: 'Open Staff Roster', href: '/staff' };
      case 'MENU_OPTIMIZATION':
      case 'REVENUE':
        return { label: 'View Analytics', href: '/analytics' };
      default:
        return { label: 'View Module', href: '/dashboard' };
    }
  };

  const actionLink = getCategoryLink(category);

  return (
    <div className="mt-4 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-2.5">
      <div className="flex items-center gap-2 text-brand-300 font-bold uppercase tracking-wider text-[11px]">
        <Lightbulb className="w-4 h-4 text-brand-400 shrink-0" />
        <span>Actionable Operational Recommendation</span>
      </div>

      <p className="text-slate-200 leading-relaxed font-medium">
        {recommendation}
      </p>

      <div className="pt-2 flex justify-end">
        <Link
          href={actionLink.href}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-glow-sm group"
        >
          <span>{actionLink.label}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
