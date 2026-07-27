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
import { PeakHourData } from '@/lib/analytics-utils';

export interface PeakHoursChartProps {
  data: PeakHourData[];
}

export const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ data }) => {
  return (
    <MetricChartCard
      title="Peak Operating Hours"
      subtitle="Hourly kitchen order volume distribution (24-hour cycle)"
      badge="Operations"
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value} orders`, 'Hourly Volume']}
          />
          <Bar dataKey="orderCount" fill="#a855f7" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </MetricChartCard>
  );
};
