import useSWR from "swr";
import type { KPIMetric } from "@/types/kpi";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface KPIData {
  metrics: KPIMetric[];
  lastSyncAt: string | null;
  period: number;
}

export function useKPI(period: number = 14) {
  const { data, error, isLoading, mutate } = useSWR<KPIData>(
    `/api/kpi?period=${period}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  return {
    metrics: data?.metrics ?? [],
    lastSyncAt: data?.lastSyncAt ?? null,
    error,
    isLoading,
    mutate,
  };
}
