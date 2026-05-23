import { NextRequest } from "next/server";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { registerSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return Response.json(allUsers);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email: rawEmail, password } = parsed.data;
  const email = rawEmail.toLowerCase().trim();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: "Email вже зайнятий" }, { status: 409 });
  }

  const [userCount] = await db.select({ count: count() }).from(users);
  const isFirstUser = userCount.count === 0;

  const passwordHash = await bcrypt.hash(password, 12);

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: isFirstUser ? "admin" : "viewer",
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  return Response.json(newUser, { status: 201 });
}
