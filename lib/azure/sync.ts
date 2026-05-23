import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { azureSettings, kpiCache } from "@/lib/schema";
import { getAzureClient } from "./client";
import {
  fetchCycleTime,
  fetchLeadTime,
  fetchThroughput,
  fetchBlockedPercent,
  fetchVendorBlocked,
  fetchPRReviewTime,
  fetchWIPAge,
} from "./kpi";
import type { KPIValue } from "@/types/kpi";

async function upsertKPI(
  metricName: string,
  period: number,
  valueJson: KPIValue
) {
  await db
    .insert(kpiCache)
    .values({ metricName, period, valueJson })
    .onConflictDoUpdate({
      target: [kpiCache.metricName, kpiCache.period],
      set: { valueJson, updatedAt: new Date() },
    });
}

export interface SyncResult {
  ok: boolean;
  metrics: { name: string; period: number; status: "ok" | "error"; error?: string }[];
  syncedAt: string;
}

export async function runSync(): Promise<SyncResult> {
  const { client, settings } = await getAzureClient();
  const project = settings.project;
  const periods = [7, 14, 30];

  const tasks = [
    ...periods.flatMap((p) => [
      { name: "cycle_time", period: p, fn: () => fetchCycleTime(client, project, p) },
      { name: "lead_time", period: p, fn: () => fetchLeadTime(client, project, p) },
      { name: "throughput", period: p, fn: () => fetchThroughput(client, project, p) },
      { name: "blocked_pct", period: p, fn: () => fetchBlockedPercent(client, project, p) },
    ]),
    { name: "vendor_blocked", period: 0, fn: () => fetchVendorBlocked(client, project) },
    { name: "pr_review_time", period: 14, fn: () => fetchPRReviewTime(client, project, 14) },
    { name: "wip_age", period: 0, fn: () => fetchWIPAge(client, project) },
  ];

  const results = await Promise.allSettled(
    tasks.map(async (task) => {
      const value = await task.fn();
      await upsertKPI(task.name, task.period, value);
      return { name: task.name, period: task.period, status: "ok" as const };
    })
  );

  await db
    .update(azureSettings)
    .set({ lastSyncAt: new Date() })
    .where(eq(azureSettings.id, settings.id));

  const metrics = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      name: tasks[i].name,
      period: tasks[i].period,
      status: "error" as const,
      error: String(r.reason),
    };
  });

  return { ok: true, metrics, syncedAt: new Date().toISOString() };
}
