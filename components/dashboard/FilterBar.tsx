"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

interface FilterBarProps {
  period: number;
  onPeriodChange: (period: number) => void;
}

export function FilterBar({ period, onPeriodChange }: FilterBarProps) {
  const { t } = useLocale();

  const PERIODS = [
    { value: 7, label: t("dashboard.period_7") },
    { value: 14, label: t("dashboard.period_14") },
    { value: 30, label: t("dashboard.period_30") },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 font-medium mr-1">{t("dashboard.period_label")}</span>
      <div className="flex gap-1.5 bg-gray-100/80 rounded-xl p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              period === p.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
