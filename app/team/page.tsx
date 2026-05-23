import { db } from "@/lib/db";
import { teamProfiles } from "@/lib/schema";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { ParallaxHero } from "@/components/animations/ParallaxHero";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { TeamGrid } from "@/components/team/TeamGrid";
import type { TeamProfile } from "@/types/profile";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const profiles = await db
    .select()
    .from(teamProfiles)
    .orderBy(teamProfiles.name) as TeamProfile[];

  return (
    <DiagonalGrid>
      <div className="pb-20">
        <ParallaxHero className="relative pt-20 pb-16 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <FadeInSection>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                DDTeam
              </p>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tightest text-gradient mb-4">
                Наша команда
              </h1>
              <p className="text-lg text-gray-500 max-w-md">
                {profiles.length} спеціалістів, які будують майбутнє разом
              </p>
            </FadeInSection>
          </div>
        </ParallaxHero>

        <div className="max-w-6xl mx-auto px-6">
          <TeamGrid profiles={profiles} />
        </div>
      </div>
    </DiagonalGrid>
  );
}
