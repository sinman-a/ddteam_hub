import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamProfiles } from "@/lib/schema";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { ProfileDetail } from "@/components/team/ProfileDetail";
import { PersonalDashboard } from "@/components/team/PersonalDashboard";
import type { TeamProfile } from "@/types/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const result = await db
    .select()
    .from(teamProfiles)
    .where(eq(teamProfiles.id, params.id))
    .limit(1);

  const profile = result[0] as TeamProfile | undefined;

  if (!profile) {
    notFound();
  }

  return (
    <>
      <DiagonalGrid>
        <ProfileDetail profile={profile} />
      </DiagonalGrid>
      <PersonalDashboard profileId={params.id} />
    </>
  );
}
