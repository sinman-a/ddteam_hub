import type { WebApi } from "azure-devops-node-api";

export interface PersonalStats {
  activeCount: number;
  personalCycleTime: number | null;
  lastPrdDaysAgo: number | null;
  lastPrdDate: string | null;
}

export interface PersonalDashboard extends PersonalStats {
  activeItems: { id: number; title: string; url: string }[];
  throughputLastMonth: number;
  blockedCount: number;
  weeklyHistory: { week: string; avgCycleTime: number }[];
}

interface DoneItemData {
  id: number;
  activatedDate: string | null;
  closedDate: string | null;
  workItemType: string;
}

function buildWeeklyHistory(items: DoneItemData[]): { week: string; avgCycleTime: number }[] {
  const now = Date.now();
  return Array.from({ length: 8 }, (_, i) => {
    const weekStart = now - (8 - i) * 7 * 86_400_000;
    const weekEnd = weekStart + 7 * 86_400_000;
    const weekItems = items.filter((item) => {
      if (!item.closedDate) return false;
      const t = new Date(item.closedDate).getTime();
      return t >= weekStart && t < weekEnd;
    });
    const cycleTimes = weekItems
      .map((item) => {
        if (!item.activatedDate || !item.closedDate) return null;
        const diff =
          (new Date(item.closedDate).getTime() - new Date(item.activatedDate).getTime()) /
          86_400_000;
        return diff >= 0 ? diff : null;
      })
      .filter((d): d is number => d !== null);
    const avgCycleTime =
      cycleTimes.length > 0
        ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
        : 0;
    return { week: `W${i + 1}`, avgCycleTime };
  });
}

export async function fetchPersonalStats(
  name: string,
  project: string,
  client: WebApi
): Promise<PersonalStats> {
  const witApi = await client.getWorkItemTrackingApi();

  // Active items count
  const activeResult = await witApi.queryByWiql(
    {
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${project}' AND [System.AssignedTo] = '${name}' AND [System.State] = 'Active' AND [System.WorkItemType] IN ('User Story', 'Task', 'Bug')`,
    },
    { project }
  );
  const activeCount = activeResult.workItems?.length ?? 0;

  // Done items in last 56 days for cycle time
  const from = new Date();
  from.setDate(from.getDate() - 56);
  const fromStr = from.toISOString().slice(0, 10);

  const doneResult = await witApi.queryByWiql(
    {
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${project}' AND [System.AssignedTo] = '${name}' AND [System.State] = 'Done' AND [Microsoft.VSTS.Common.ClosedDate] >= '${fromStr}'`,
    },
    { project }
  );
  const doneIds = doneResult.workItems?.map((w) => w.id!).filter(Boolean) ?? [];

  const doneItems: DoneItemData[] = [];
  if (doneIds.length > 0) {
    const fetched = await witApi.getWorkItems(doneIds.slice(0, 200), [
      "Microsoft.VSTS.Common.ActivatedDate",
      "Microsoft.VSTS.Common.ClosedDate",
      "System.WorkItemType",
    ]);
    for (const item of fetched) {
      doneItems.push({
        id: item.id!,
        activatedDate: item.fields?.["Microsoft.VSTS.Common.ActivatedDate"] ?? null,
        closedDate: item.fields?.["Microsoft.VSTS.Common.ClosedDate"] ?? null,
        workItemType: item.fields?.["System.WorkItemType"] ?? "",
      });
    }
  }

  // Personal cycle time — avg of last 10 items
  const cycleTimes: number[] = [];
  for (const item of doneItems.slice(0, 10)) {
    if (item.activatedDate && item.closedDate) {
      const diff =
        (new Date(item.closedDate).getTime() - new Date(item.activatedDate).getTime()) /
        86_400_000;
      if (diff >= 0) cycleTimes.push(diff);
    }
  }
  const personalCycleTime =
    cycleTimes.length > 0
      ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
      : null;

  // Last PRD (last Done User Story)
  const lastPrd = doneItems.find((item) => item.workItemType === "User Story" && item.closedDate);
  const lastPrdDaysAgo = lastPrd?.closedDate
    ? Math.floor((Date.now() - new Date(lastPrd.closedDate).getTime()) / 86_400_000)
    : null;

  return {
    activeCount,
    personalCycleTime,
    lastPrdDaysAgo,
    lastPrdDate: lastPrd?.closedDate ?? null,
  };
}

export async function fetchPersonalDashboard(
  name: string,
  org: string,
  project: string,
  client: WebApi
): Promise<PersonalDashboard> {
  const witApi = await client.getWorkItemTrackingApi();

  // Active items with titles
  const activeResult = await witApi.queryByWiql(
    {
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${project}' AND [System.AssignedTo] = '${name}' AND [System.State] = 'Active' AND [System.WorkItemType] IN ('User Story', 'Task', 'Bug')`,
    },
    { project }
  );
  const activeIds = activeResult.workItems?.map((w) => w.id!).filter(Boolean) ?? [];

  const activeItems: { id: number; title: string; url: string }[] = [];
  if (activeIds.length > 0) {
    const fetched = await witApi.getWorkItems(activeIds.slice(0, 50), ["System.Title"]);
    for (const item of fetched) {
      activeItems.push({
        id: item.id!,
        title: (item.fields?.["System.Title"] as string) ?? `#${item.id}`,
        url: `https://dev.azure.com/${org}/${project}/_workitems/edit/${item.id}`,
      });
    }
  }

  // Done items in last 56 days
  const from = new Date();
  from.setDate(from.getDate() - 56);
  const fromStr = from.toISOString().slice(0, 10);

  const doneResult = await witApi.queryByWiql(
    {
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${project}' AND [System.AssignedTo] = '${name}' AND [System.State] = 'Done' AND [Microsoft.VSTS.Common.ClosedDate] >= '${fromStr}'`,
    },
    { project }
  );
  const doneIds = doneResult.workItems?.map((w) => w.id!).filter(Boolean) ?? [];

  const doneItems: DoneItemData[] = [];
  if (doneIds.length > 0) {
    const fetched = await witApi.getWorkItems(doneIds.slice(0, 200), [
      "Microsoft.VSTS.Common.ActivatedDate",
      "Microsoft.VSTS.Common.ClosedDate",
      "System.WorkItemType",
    ]);
    for (const item of fetched) {
      doneItems.push({
        id: item.id!,
        activatedDate: item.fields?.["Microsoft.VSTS.Common.ActivatedDate"] ?? null,
        closedDate: item.fields?.["Microsoft.VSTS.Common.ClosedDate"] ?? null,
        workItemType: item.fields?.["System.WorkItemType"] ?? "",
      });
    }
  }

  // Cycle time from last 10 Done items
  const cycleTimes: number[] = [];
  for (const item of doneItems.slice(0, 10)) {
    if (item.activatedDate && item.closedDate) {
      const diff =
        (new Date(item.closedDate).getTime() - new Date(item.activatedDate).getTime()) /
        86_400_000;
      if (diff >= 0) cycleTimes.push(diff);
    }
  }
  const personalCycleTime =
    cycleTimes.length > 0
      ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
      : null;

  // Last PRD
  const lastPrd = doneItems.find((item) => item.workItemType === "User Story" && item.closedDate);
  const lastPrdDaysAgo = lastPrd?.closedDate
    ? Math.floor((Date.now() - new Date(lastPrd.closedDate).getTime()) / 86_400_000)
    : null;

  // Throughput — Done items in last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
  const throughputLastMonth = doneItems.filter(
    (item) => item.closedDate && new Date(item.closedDate).getTime() >= thirtyDaysAgo
  ).length;

  // Blocked count
  const blockedResult = await witApi.queryByWiql(
    {
      query: `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${project}' AND [System.AssignedTo] = '${name}' AND [System.Tags] CONTAINS 'Blocked' AND [System.State] <> 'Done'`,
    },
    { project }
  );
  const blockedCount = blockedResult.workItems?.length ?? 0;

  return {
    activeCount: activeItems.length,
    activeItems,
    personalCycleTime,
    lastPrdDaysAgo,
    lastPrdDate: lastPrd?.closedDate ?? null,
    throughputLastMonth,
    blockedCount,
    weeklyHistory: buildWeeklyHistory(doneItems),
  };
}
