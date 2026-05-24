"use client";

import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ExternalLink, Activity, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PersonalDashboard as DashboardData } from "@/lib/azure/personal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function KPICard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
        <div className="h-4 bg-gray-100 rounded w-3/5" />
      </div>
    </div>
  );
}

function BigStat({
  value,
  label,
  danger,
}: {
  value: number | null;
  label: string;
  danger?: boolean;
}) {
  if (value === null) {
    return (
      <div className="text-center py-4">
        <p className="text-3xl font-black text-gray-200">—</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    );
  }
  return (
    <div className="text-center py-2">
      <p className={`text-4xl font-black ${danger && value > 0 ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export function PersonalDashboard({ profileId }: { profileId: string }) {
  const { data, isLoading, error } = useSWR<DashboardData>(
    `/api/team/${profileId}/dashboard`,
    fetcher,
    { refreshInterval: 300_000 }
  );

  const hasChartData = data?.weeklyHistory?.some((w) => w.avgCycleTime > 0);

  return (
    <section className="max-w-6xl mx-auto px-6 pb-20 pt-8">
      <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5">
        Особиста статистика
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Не вдалося завантажити статистику
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card A — Active tasks */}
          <KPICard title="Активні задачі">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-gray-400" />
              {(data?.activeCount ?? 0) > 2 ? (
                <Badge variant="destructive" className="text-xs">
                  {data?.activeCount} задач
                </Badge>
              ) : (
                <span className="text-sm font-semibold text-gray-700">
                  {data?.activeCount ?? 0} задач
                </span>
              )}
            </div>
            {data?.activeItems && data.activeItems.length > 0 ? (
              <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                {data.activeItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-1.5 text-xs text-gray-600 hover:text-gray-900 hover:underline transition-colors group"
                    >
                      <ExternalLink
                        size={10}
                        className="shrink-0 mt-0.5 text-gray-400 group-hover:text-gray-600"
                      />
                      <span>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 italic">Немає активних задач</p>
            )}
          </KPICard>

          {/* Card B — Cycle Time trend chart */}
          <KPICard title="Cycle Time (8 тижнів)">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">
                {data?.personalCycleTime !== null && data?.personalCycleTime !== undefined
                  ? `${data.personalCycleTime}д середній`
                  : "—"}
              </span>
            </div>
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data?.weeklyHistory} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                    formatter={(v) => [`${v}д`, "Cycle Time"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgCycleTime"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#111827" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-400 italic py-8 text-center">
                Немає даних за останні 8 тижнів
              </p>
            )}
          </KPICard>

          {/* Card C — Throughput */}
          <KPICard title="Throughput (30 днів)">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-gray-400" />
            </div>
            <BigStat value={data?.throughputLastMonth ?? null} label="задач закрито за останні 30 днів" />
          </KPICard>

          {/* Card D — Blocked */}
          <KPICard title="Blocked">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-gray-400" />
            </div>
            <BigStat
              value={data?.blockedCount ?? null}
              label="активних задач з тегом Blocked"
              danger
            />
          </KPICard>
        </div>
      )}
    </section>
  );
}
