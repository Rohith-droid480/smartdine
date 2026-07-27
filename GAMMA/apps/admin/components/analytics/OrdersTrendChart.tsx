'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { MetricChartCard } from './MetricChartCard';
import { SalesDataPoint } from '@/lib/types';
import { formatAnalyticsNumber } from '@/lib/analytics-utils';

export interface OrdersTrendChartProps {
  data: SalesDataPoint[];
}

export const OrdersTrendChart: React.FC<OrdersTrendChartProps> = ({ data }) => {
  return (
    <MetricChartCard
      title="Daily Order Volume"
      subtitle="Number of completed dining & takeaway tickets per day"
      badge="Order Volume"
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${formatAnalyticsNumber(value)} tickets`, 'Orders']}
          />
          <Bar dataKey="orderCount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </MetricChartCard>
  );
};
