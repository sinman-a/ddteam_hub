"use client";

import { useState } from "react";
import { useKPI } from "@/hooks/useKPI";
import { KPIWidget } from "./KPIWidget";
import { FilterBar } from "./FilterBar";
import { SyncStatus } from "./SyncStatus";
import { FadeInSection } from "@/components/animations/FadeInSection";

export function KPIDashboard() {
  const [period, setPeriod] = useState(14);
  const { metrics, lastSyncAt, isLoading, mutate } = useKPI(period);

  const handleManualSync = async () => {
    await fetch("/api/sync");
    await mutate();
  };

  return (
    <div className="space-y-6">
      <FadeInSection>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <FilterBar period={period} onPeriodChange={setPeriod} />
          <SyncStatus lastSyncAt={lastSyncAt} onManualSync={handleManualSync} />
        </div>
      </FadeInSection>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <KPIWidget
                key={i}
                metric={{ name: "", label: "", description: "", unit: "", period: 0, value: null, updatedAt: null }}
                loading
              />
            ))
          : metrics.map((metric, i) => (
              <FadeInSection key={metric.name} delay={i * 0.05}>
                <KPIWidget metric={metric} />
              </FadeInSection>
            ))}
      </div>
    </div>
  );
}
