import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamProfiles, kpiCache } from "@/lib/schema";
import { getAzureClient } from "@/lib/azure/client";
import { fetchPersonalDashboard, type PersonalDashboard } from "@/lib/azure/personal";

const FIVE_MIN = 5 * 60 * 1000;

const NULL_DASHBOARD: PersonalDashboard = {
  activeCount: 0,
  activeItems: [],
  personalCycleTime: null,
  lastPrdDaysAgo: null,
  lastPrdDate: null,
  throughputLastMonth: 0,
  blockedCount: 0,
  weeklyHistory: [],
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await db
    .select()
    .from(teamProfiles)
    .where(eq(teamProfiles.id, params.id))
    .limit(1);

  if (!profiles[0]) return Response.json({ error: "Not found" }, { status: 404 });

  const cacheKey = `personal_dashboard_${params.id}`;

  const cached = await db
    .select()
    .from(kpiCache)
    .where(and(eq(kpiCache.metricName, cacheKey), eq(kpiCache.period, 0)))
    .limit(1);

  if (cached[0] && Date.now() - new Date(cached[0].updatedAt!).getTime() < FIVE_MIN) {
    return Response.json(cached[0].valueJson, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  }

  let dashboard: PersonalDashboard;
  try {
    const { client, settings } = await getAzureClient();
    dashboard = await fetchPersonalDashboard(
      profiles[0].name,
      settings.org,
      settings.project,
      client
    );
  } catch {
    dashboard = NULL_DASHBOARD;
  }

  await db
    .insert(kpiCache)
    .values({ metricName: cacheKey, period: 0, valueJson: dashboard as unknown as Record<string, unknown> })
    .onConflictDoUpdate({
      target: [kpiCache.metricName, kpiCache.period],
      set: { valueJson: dashboard as unknown as Record<string, unknown>, updatedAt: new Date() },
    });

  return Response.json(dashboard, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}
