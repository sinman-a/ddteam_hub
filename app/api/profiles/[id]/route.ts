import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamProfiles } from "@/lib/schema";
import { profileSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await db
    .select()
    .from(teamProfiles)
    .where(eq(teamProfiles.id, params.id))
    .limit(1);

  if (!result[0]) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "admin";
  const body = await request.json();

  if (!isAdmin) {
    const allowed = { bioMd: body.bioMd, photoUrl: body.photoUrl };
    const [updated] = await db
      .update(teamProfiles)
      .set(allowed)
      .where(eq(teamProfiles.id, params.id))
      .returning();
    return Response.json(updated);
  }

  const parsed = profileSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(teamProfiles)
    .set(parsed.data)
    .where(eq(teamProfiles.id, params.id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(teamProfiles).where(eq(teamProfiles.id, params.id));

  return new Response(null, { status: 204 });
}
