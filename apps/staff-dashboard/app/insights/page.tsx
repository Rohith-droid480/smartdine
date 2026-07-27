'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { OperationsIntelligenceSection } from '@/components/insights';

export default function InsightsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="AI Operational Insights & Decision Center"
        subtitle="Explainable risk alerts, inventory warnings, staffing recommendations, and revenue growth opportunities"
      />

      <OperationsIntelligenceSection />
    </DashboardLayout>
  );
}
