"use client";

import useSWR from "swr";
import { Activity, Clock, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PersonalStats } from "@/lib/azure/personal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function Skeleton() {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 w-full animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-3.5 bg-gray-100 rounded-full w-3/4" />
      ))}
    </div>
  );
}

function UnavailableRow({ label }: { label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs text-gray-400 flex items-center gap-1 cursor-default">
            {label}: <span className="font-medium">—</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Дані оновлюються</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MiniKPI({ id }: { id: string }) {
  const { data, isLoading, error } = useSWR<PersonalStats>(
    `/api/team/${id}/stats`,
    fetcher,
    { refreshInterval: 300_000 }
  );

  if (isLoading) return <Skeleton />;

  if (error || !data) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 w-full">
        <UnavailableRow label="В роботі" />
        <UnavailableRow label="Cycle" />
        <UnavailableRow label="PRD" />
      </div>
    );
  }

  const activeColor =
    data.activeCount === 0
      ? "text-gray-400"
      : data.activeCount > 2
      ? "text-red-600"
      : "text-gray-600";

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 w-full">
      <div className={`text-xs flex items-center gap-1 ${activeColor}`}>
        <Activity size={11} className="shrink-0" />
        <span>В роботі:</span>
        {data.activeCount > 2 ? (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">
            {data.activeCount}
          </Badge>
        ) : (
          <span className="font-medium">{data.activeCount}</span>
        )}
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Clock size={11} className="shrink-0" />
        <span>Cycle:</span>
        <span className="font-medium">
          {data.personalCycleTime !== null ? `${data.personalCycleTime}д` : "—"}
        </span>
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <CheckSquare size={11} className="shrink-0" />
        <span>PRD:</span>
        <span className="font-medium">
          {data.lastPrdDaysAgo !== null ? `${data.lastPrdDaysAgo}д тому` : "—"}
        </span>
      </div>
    </div>
  );
}
