"use client";

import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { TeamCard } from "./TeamCard";
import type { TeamProfile } from "@/types/profile";

export function TeamGrid({ profiles }: { profiles: TeamProfile[] }) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">Профілів поки немає</p>
        <p className="text-sm mt-1">Admin може додати членів команди</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {profiles.map((profile) => (
        <TeamCard key={profile.id} profile={profile} />
      ))}
    </StaggerContainer>
  );
}
