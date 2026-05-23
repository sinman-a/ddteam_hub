import type { IWorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
import type { IGitApi } from "azure-devops-node-api/GitApi";
import type { WebApi } from "azure-devops-node-api";
import type { KPIValue } from "@/types/kpi";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function toISOShort(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchCycleTime(
  client: WebApi,
  project: string,
  days: number
): Promise<KPIValue> {
  const witApi: IWorkItemTrackingApi = await client.getWorkItemTrackingApi();
  const from = toISOShort(daysAgo(days));

  const wiql = {
    query: `SELECT [System.Id], [Microsoft.VSTS.Common.ActivatedDate], [Microsoft.VSTS.Common.ClosedDate]
      FROM WorkItems
      WHERE [System.TeamProject] = '${project}'
        AND [System.WorkItemType] = 'User Story'
        AND [System.State] = 'Done'
        AND [Microsoft.VSTS.Common.ClosedDate] >= '${from}'`,
  };

  const result = await witApi.queryByWiql(wiql, { project });
  const ids = result.workItems?.map((w) => w.id!) ?? [];

  if (ids.length === 0) return { value: 0, unit: "days" };

  const items = await witApi.getWorkItems(ids.slice(0, 200), [
    "Microsoft.VSTS.Common.ActivatedDate",
    "Microsoft.VSTS.Common.ClosedDate",
  ]);

  const cycleTimes: number[] = [];
  for (const item of items) {
    const activated = item.fields?.["Microsoft.VSTS.Common.ActivatedDate"];
    const closed = item.fields?.["Microsoft.VSTS.Common.ClosedDate"];
    if (activated && closed) {
      const diff =
        (new Date(closed).getTime() - new Date(activated).getTime()) /
        (1000 * 60 * 60 * 24);
      cycleTimes.push(diff);
    }
  }

  const avg =
    cycleTimes.length > 0
      ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
      : 0;

  return { value: Math.round(avg * 10) / 10, unit: "days" };
}

export async function fetchLeadTime(
  client: WebApi,
  project: string,
  days: number
): Promise<KPIValue> {
  const witApi: IWorkItemTrackingApi = await client.getWorkItemTrackingApi();
  const from = toISOShort(daysAgo(days));

  const wiql = {
    query: `SELECT [System.Id], [System.CreatedDate], [Microsoft.VSTS.Common.ClosedDate]
      FROM WorkItems
      WHERE [System.TeamProject] = '${project}'
        AND [System.WorkItemType] = 'User Story'
        AND [System.State] = 'Done'
        AND [Microsoft.VSTS.Common.ClosedDate] >= '${from}'`,
  };

  const result = await witApi.queryByWiql(wiql, { project });
  const ids = result.workItems?.map((w) => w.id!) ?? [];

  if (ids.length === 0) return { value: 0, unit: "days" };

  const items = await witApi.getWorkItems(ids.slice(0, 200), [
    "System.CreatedDate",
    "Microsoft.VSTS.Common.ClosedDate",
  ]);

  const leadTimes: number[] = [];
  for (const item of items) {
    const created = item.fields?.["System.CreatedDate"];
    const closed = item.fields?.["Microsoft.VSTS.Common.ClosedDate"];
    if (created && closed) {
      const diff =
        (new Date(closed).getTime() - new Date(created).getTime()) /
        (1000 * 60 * 60 * 24);
      leadTimes.push(diff);
    }
  }

  const avg =
    leadTimes.length > 0
      ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
      : 0;

  return { value: Math.round(avg * 10) / 10, unit: "days" };
}

export async function fetchThroughput(
  client: WebApi,
  project: string,
  days: number
): Promise<KPIValue> {
  const witApi: IWorkItemTrackingApi = await client.getWorkItemTrackingApi();
  const from = toISOShort(daysAgo(days));

  const wiql = {
    query: `SELECT [System.Id]
      FROM WorkItems
      WHERE [System.TeamProject] = '${project}'
        AND [System.WorkItemType] = 'User Story'
        AND [System.State] = 'Done'
        AND [Microsoft.VSTS.Common.ClosedDate] >= '${from}'`,
  };

  const result = await witApi.queryByWiql(wiql, { project });
  const count = result.workItems?.length ?? 0;
  const weeks = days / 7;

  return {
    value: Math.round((count / weeks) * 10) / 10,
    unit: "per week",
  };
}

export async function fetchBlockedPercent(
  client: WebApi,
  project: string,
  days: number
): Promise<KPIValue> {
  const witApi: IWorkItemTrackingApi = await client.getWorkItemTrackingApi();
  const from = toISOShort(daysAgo(days));

  const wiql = {
    query: `SELECT [System.Id]
      FROM WorkItems
      WHERE [System.TeamProject] = '${project}'
        AND [System.WorkItemType] IN ('User Story', 'Task', 'Bug')
        AND [System.Tags] CONTAINS 'Blocked'
        AND [System.ChangedDate] >= '${from}'`,
  };

  const blockedResult = await witApi.queryByWiql(wiql, { project });
  const blockedCount = blockedResult.workItems?.length ?? 0;

  const allWiql = {
    query: `SELECT [System.Id]
      FROM WorkItems
      WHERE [System.TeamProject] = '${project}'
        AND [System.WorkItemType] IN ('User Story', 'Task', 'Bug')
        AND [System.ChangedDate] >= '${from}'`,
  };

  const allResult = await witApi.queryByWiql(allWiql, { project });
  const totalCount = allResult.workItems?.length ?? 1;

  return {
    value: Math.round((blockedCount / totalCount) * 1000) / 10,
    unit: "%",
  };
}

export async function fetchVendorBlocked(
  client: WebApi,
  project: string
): Promise<KPIValue> {
  const witApi: IWorkItemTrackingApi = await client.getWorkItemTrackingApi();

  const wiql = {
    query: `SELECT [System.Id], [System.Title], [System.AssignedTo]
      FROM WorkItems
      WHERE [System.TeamProject] = '${project}'
        AND [System.State] <> 'Done'
        AND [System.Tags] CONTAINS 'Vendor-GOSS'`,
  };

  const result = await witApi.queryByWiql(wiql, { project });
  const ids = result.workItems?.map((w) => w.id!) ?? [];

  if (ids.length === 0) return { value: 0, unit: "items", items: [] };

  const items = await witApi.getWorkItems(ids.slice(0, 100), [
    "System.Title",
    "System.AssignedTo",
  ]);

  return {
    value: ids.length,
    unit: "items",
    items: items.map((item) => ({
      id: item.id!,
      title: item.fields?.["System.Title"] ?? "",
      assignee: item.fields?.["System.AssignedTo"]?.displayName ?? "",
      reason: "Vendor-GOSS",
    })),
  };
}

export async function fetchPRReviewTime(
  client: WebApi,
  project: string,
  days: number
): Promise<KPIValue> {
  const gitApi: IGitApi = await client.getGitApi();

  const repos = await gitApi.getRepositories(project);
  const from = daysAgo(days);

  let totalHours = 0;
  let count = 0;

  for (const repo of repos.slice(0, 5)) {
    if (!repo.id) continue;
    const prs = await gitApi.getPullRequests(
      repo.id,
      { status: 2 },
      project,
      undefined,
      undefined,
      100
    );

    for (const pr of prs) {
      if (pr.creationDate && new Date(pr.creationDate) >= from) {
        const ageHours =
          (Date.now() - new Date(pr.creationDate).getTime()) / (1000 * 3600);
        totalHours += ageHours;
        count++;
      }
    }
  }

  const avgHours = count > 0 ? totalHours / count : 0;
  return {
    value: Math.round((avgHours / 24) * 10) / 10,
    unit: "days",
  };
}

export async function fetchWIPAge(
  client: WebApi,
  project: string
): Promise<KPIValue> {
  const witApi: IWorkItemTrackingApi = await client.getWorkItemTrackingApi();

  const wiql = {
    query: `SELECT [System.Id], [System.Title], [System.AssignedTo], [Microsoft.VSTS.Common.ActivatedDate]
      FROM WorkItems
      WHERE [System.TeamProject] = '${project}'
        AND [System.State] = 'Active'
        AND [System.WorkItemType] IN ('User Story', 'Task', 'Bug')`,
  };

  const result = await witApi.queryByWiql(wiql, { project });
  const ids = result.workItems?.map((w) => w.id!) ?? [];

  if (ids.length === 0) return { value: 0, unit: "days", items: [] };

  const items = await witApi.getWorkItems(ids.slice(0, 100), [
    "System.Title",
    "System.AssignedTo",
    "Microsoft.VSTS.Common.ActivatedDate",
  ]);

  const ages: number[] = [];
  const wipItems = items.map((item) => {
    const activated = item.fields?.["Microsoft.VSTS.Common.ActivatedDate"];
    const age = activated
      ? Math.round(
          (Date.now() - new Date(activated).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
    ages.push(age);
    return {
      id: item.id!,
      title: item.fields?.["System.Title"] ?? "",
      assignee: item.fields?.["System.AssignedTo"]?.displayName ?? "",
      age,
    };
  });

  const avg =
    ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

  return {
    value: Math.round(avg * 10) / 10,
    unit: "days",
    items: wipItems.sort((a, b) => (b.age ?? 0) - (a.age ?? 0)).slice(0, 10),
  };
}
