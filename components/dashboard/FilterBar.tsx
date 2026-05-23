"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERIODS = [
  { value: 7, label: "7 днів" },
  { value: 14, label: "14 днів" },
  { value: 30, label: "30 днів" },
];

interface FilterBarProps {
  period: number;
  onPeriodChange: (period: number) => void;
}

export function FilterBar({ period, onPeriodChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 font-medium mr-1">Період:</span>
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
