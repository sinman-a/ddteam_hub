import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamProfiles } from "@/lib/schema";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const profiles = await db.select().from(teamProfiles).orderBy(teamProfiles.name);
  return Response.json(profiles);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [profile] = await db
    .insert(teamProfiles)
    .values(parsed.data)
    .returning();

  return Response.json(profile, { status: 201 });
}
