import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { azureSettings } from "@/lib/schema";
import { encrypt } from "@/lib/crypto";
import { azureSettingsSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await db.select({
    id: azureSettings.id,
    org: azureSettings.org,
    project: azureSettings.project,
    lastSyncAt: azureSettings.lastSyncAt,
  }).from(azureSettings).limit(1);

  return Response.json(settings[0] ?? null);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = azureSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patEncrypted = encrypt(parsed.data.pat);

  await db.delete(azureSettings);

  const [settings] = await db
    .insert(azureSettings)
    .values({
      org: parsed.data.org,
      project: parsed.data.project,
      patEncrypted,
    })
    .returning({
      id: azureSettings.id,
      org: azureSettings.org,
      project: azureSettings.project,
      lastSyncAt: azureSettings.lastSyncAt,
    });

  return Response.json(settings, { status: 201 });
}
