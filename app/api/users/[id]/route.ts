import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { role } = body;

  if (!["admin", "member", "viewer"].includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, params.id))
    .returning({ id: users.id, email: users.email, role: users.role });

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

  if (params.id === session.user.id) {
    return Response.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  await db.delete(users).where(eq(users.id, params.id));

  return new Response(null, { status: 204 });
}
