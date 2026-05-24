import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamProfiles } from "@/lib/schema";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select()
    .from(teamProfiles)
    .where(eq(teamProfiles.userId, session.user.id))
    .limit(1);

  return Response.json(result[0] ?? null);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const [profile] = await db
    .insert(teamProfiles)
    .values({ ...parsed.data, userId: session.user.id })
    .returning();

  return Response.json(profile, { status: 201 });
}
