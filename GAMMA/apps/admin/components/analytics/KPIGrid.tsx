import React from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { SalesAnalytics } from '@/lib/types';
import { formatAnalyticsCurrency, formatAnalyticsNumber } from '@/lib/analytics-utils';

export interface KPIGridProps {
  salesAnalytics: SalesAnalytics | null;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ salesAnalytics }) => {
  const revenue = salesAnalytics?.totalRevenue ?? 124850;
  const totalOrders = salesAnalytics?.totalOrders ?? 2840;
  const aov = salesAnalytics?.averageOrderValue ?? 43.96;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Revenue"
        value={formatAnalyticsCurrency(revenue)}
        change={14.2}
        changeLabel="vs previous period"
        icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
      />
      <StatCard
        title="Total Orders"
        value={formatAnalyticsNumber(totalOrders)}
        change={8.6}
        changeLabel="completed dining tickets"
        icon={<ShoppingCart className="w-5 h-5 text-blue-400" />}
      />
      <StatCard
        title="Avg Order Value (AOV)"
        value={formatAnalyticsCurrency(aov)}
        change={5.1}
        changeLabel="per guest check"
        icon={<TrendingUp className="w-5 h-5 text-brand-400" />}
      />
      <StatCard
        title="Peak Hour Volume"
        value="74 Orders"
        change={18.0}
        changeLabel="highest volume at 20:00"
        icon={<Clock className="w-5 h-5 text-purple-400" />}
      />
    </div>
  );
};
