"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
