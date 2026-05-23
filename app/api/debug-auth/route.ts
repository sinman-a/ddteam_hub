import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email: rawEmail, password } = await req.json();

  const result: Record<string, unknown> = {
    env: {
      hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
      nextauthUrl: process.env.NEXTAUTH_URL ?? null,
    },
    userFound: false,
    storedEmail: null,
    passwordValid: false,
    error: null,
  };

  try {
    const email = rawEmail.toLowerCase().trim();
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    result.userFound = rows.length > 0;
    result.storedEmail = rows[0]?.email ?? null;

    if (rows[0]) {
      result.passwordValid = await bcrypt.compare(password, rows[0].passwordHash);
    }
  } catch (err) {
    result.error = String(err);
  }

  return Response.json(result);
}
