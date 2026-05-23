import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { kpiCache, azureSettings } from "@/lib/schema";

export const dynamic = "force-dynamic";

const METRICS = [
  { name: "cycle_time", label: "Cycle Time", description: "Середній час Active → Done", unit: "days" },
  { name: "lead_time", label: "Lead Time", description: "Середній час від створення до Done", unit: "days" },
  { name: "throughput", label: "Throughput", description: "User Stories завершено / тиждень", unit: "/ тиждень" },
  { name: "blocked_pct", label: "Blocked %", description: "Відсоток заблокованих задач", unit: "%" },
  { name: "vendor_blocked", label: "Vendor Blocked", description: "Задачі заблоковані Vendor-GOSS", unit: "items" },
  { name: "pr_review_time", label: "PR Review Time", description: "Середній час PR у статусі Active", unit: "days" },
  { name: "wip_age", label: "WIP Age", description: "Середній вік задач у Active", unit: "days" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = parseInt(searchParams.get("period") ?? "14");

  const settings = await db.select().from(azureSettings).limit(1);
  const lastSyncAt = settings[0]?.lastSyncAt ?? null;

  const cached = await db.select().from(kpiCache);

  const metrics = METRICS.map((m) => {
    const periodToUse = ["vendor_blocked", "wip_age"].includes(m.name) ? 0 : period;
    const row = cached.find(
      (c) => c.metricName === m.name && c.period === periodToUse
    );

    const valueJson = row?.valueJson as { value: number; items?: unknown[] } | undefined;

    return {
      ...m,
      period: periodToUse,
      value: valueJson?.value ?? null,
      items: valueJson?.items ?? [],
      updatedAt: row?.updatedAt?.toISOString() ?? null,
    };
  });

  return Response.json(
    { metrics, lastSyncAt: lastSyncAt?.toISOString() ?? null, period },
    {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=60",
      },
    }
  );
}
